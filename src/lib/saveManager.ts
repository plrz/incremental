/**
 * Zikki Incremental — Save Manager
 * 
 * Handles all persistence: localStorage (primary), IndexedDB (backup),
 * and Base64 export/import for manual backups.
 */

import { GameState, SAVE_VERSION, INITIAL_STATE, createFreshState } from '@/engine/gameState';

const LS_KEY = 'zikki_save';
const LS_SETTINGS_KEY = 'zikki_settings';
const IDB_NAME = 'ZikkiIncrementalDB';
const IDB_STORE = 'saves';
const IDB_VERSION = 1;

// ============================================================
// SCHEMA MIGRATION
// ============================================================

type Migrator = (data: Record<string, unknown>) => Record<string, unknown>;

/**
 * Migration functions keyed by target version.
 * Each migrator takes data at version N-1 and returns data at version N.
 */
const MIGRATIONS: Record<number, Migrator> = {
  // v1 -> v2: Add new Phase 1 fields
  2: (data) => {
    const d = data as Record<string, unknown>;
    
    // Add new resource fields
    const resources = (d.resources || {}) as Record<string, unknown>;
    resources.skillPoints = resources.skillPoints ?? 0;
    resources.researchPoints = resources.researchPoints ?? 0;
    d.resources = resources;

    // Add stats fields
    const stats = (d.stats || {}) as Record<string, unknown>;
    stats.ascensions = stats.ascensions ?? 0;
    stats.totalItemsCrafted = stats.totalItemsCrafted ?? 0;
    stats.totalRunesForged = stats.totalRunesForged ?? 0;
    stats.playerLevel = stats.playerLevel ?? 1;
    stats.playerXp = stats.playerXp ?? 0;
    stats.playerXpToNext = stats.playerXpToNext ?? 100;
    d.stats = stats;

    // Add settings fields
    const settings = (d.settings || {}) as Record<string, unknown>;
    settings.showDamageNumbers = settings.showDamageNumbers ?? true;
    settings.numberFormat = settings.numberFormat ?? 'abbreviated';
    settings.theme = settings.theme ?? 'midnight';
    d.settings = settings;

    // Add combat fields
    const combat = (d.combat || {}) as Record<string, unknown>;
    combat.currentEnemyElement = combat.currentEnemyElement ?? null;
    combat.currentModifier = combat.currentModifier ?? null;
    // Ensure boolean fields
    combat.bossFightActive = combat.bossFightActive ?? false;
    combat.isBossGate = combat.isBossGate ?? false;
    d.combat = combat;

    // Add new systems
    d.runes = d.runes ?? { inventory: [], maxSlots: 50 };
    d.craftingMaterials = d.craftingMaterials ?? {
      platingShards: 0,
      reinforcedFiber: 0,
      fluxCrystals: 0,
      essenceCores: 0,
    };
    d.crafting = d.crafting ?? { blueprintsUnlocked: [], craftCount: 0 };
    d.skillTree = d.skillTree ?? {
      points: 0,
      totalPointsEarned: 0,
      nodes: {},
      respecCount: 0,
    };

    // Migrate items to new schema
    const inventory = (d.inventory || {}) as Record<string, unknown>;
    const items = (inventory.items || []) as Record<string, unknown>[];
    inventory.items = items.map((item) => ({
      ...item,
      qualityValue: item.qualityValue ?? 0,
      isOverdrive: item.isOverdrive ?? false,
      starLevel: item.starLevel ?? 0,
      tier: item.tier ?? 1,
      runes: item.runes ?? [],
    }));
    d.inventory = inventory;

    d.version = 2;
    return d;
  },
  // v2 -> v3: Add new Phase 2 & 3 systems (Ascension, Factions, Pets, Research, Dungeons, World Bosses, Corruption, Time Rifts)
  3: (data) => {
    const d = data as Record<string, unknown>;

    // Resources
    const resources = (d.resources || {}) as Record<string, unknown>;
    resources.ascensionPoints = resources.ascensionPoints ?? 0;
    resources.timeCrystals = resources.timeCrystals ?? 0;
    resources.purityOrbs = resources.purityOrbs ?? 0;
    resources.dungeonKeys = resources.dungeonKeys ?? 0;
    d.resources = resources;

    // Stats
    const stats = (d.stats || {}) as Record<string, unknown>;
    stats.factionRep = stats.factionRep ?? { blade: 0, merchant: 0, conclave: 0 };
    stats.elementalMastery = stats.elementalMastery ?? { fire: 0, ice: 0, lightning: 0, nature: 0, dark: 0, holy: 0 };
    stats.elementalKills = stats.elementalKills ?? { fire: 0, ice: 0, lightning: 0, nature: 0, dark: 0, holy: 0 };
    d.stats = stats;

    // Faction & Ascension
    d.ascensionPerks = d.ascensionPerks ?? {};
    d.faction = d.faction ?? null;

    // Pets
    d.pets = d.pets ?? {
      active: [],
      inventory: [],
      eggs: [],
    };

    // Research
    d.research = d.research ?? {
      nodes: {},
      activeResearchId: null,
      activeResearchEnd: null,
    };

    // Endgame / Dungeons / World Bosses / Corruption / Time Rifts
    d.activeDungeon = d.activeDungeon ?? null;
    d.worldBoss = d.worldBoss ?? null;
    d.corruption = d.corruption ?? 0;
    d.timeRiftActive = d.timeRiftActive ?? null;

    d.version = 3;
    return d;
  },
};

/**
 * Apply all necessary migrations to bring data up to current version.
 */
function migrateData(data: Record<string, unknown>): Record<string, unknown> {
  let currentVersion = (data.version as number) || 1;

  while (currentVersion < SAVE_VERSION) {
    const nextVersion = currentVersion + 1;
    const migrator = MIGRATIONS[nextVersion];
    if (migrator) {
      data = migrator(data);
      currentVersion = nextVersion;
    } else {
      console.warn(`No migration found for version ${nextVersion}`);
      break;
    }
  }

  return data;
}

// ============================================================
// DEEP MERGE UTILITY
// ============================================================

/**
 * Deep merge loaded data onto the default state template.
 * This ensures any NEW fields added in code updates get their defaults,
 * while preserving all existing saved values.
 */
function deepMerge(defaults: Record<string, unknown>, loaded: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...defaults };

  for (const key of Object.keys(loaded)) {
    const loadedVal = loaded[key];
    const defaultVal = defaults[key];

    if (
      loadedVal !== null &&
      typeof loadedVal === 'object' &&
      !Array.isArray(loadedVal) &&
      defaultVal !== null &&
      typeof defaultVal === 'object' &&
      !Array.isArray(defaultVal)
    ) {
      result[key] = deepMerge(
        defaultVal as Record<string, unknown>,
        loadedVal as Record<string, unknown>
      );
    } else if (loadedVal !== undefined) {
      result[key] = loadedVal;
    }
  }

  return result;
}

// ============================================================
// LOCALSTORAGE
// ============================================================

/** Save game state to localStorage */
export function saveToLocalStorage(state: GameState): boolean {
  try {
    // Strip transient data before saving
    const saveable = {
      ...state,
      events: [], // Never persist events
      stats: { ...state.stats, lastSaveTime: Date.now() },
    };
    const json = JSON.stringify(saveable);
    localStorage.setItem(LS_KEY, json);
    return true;
  } catch (e) {
    console.error('[SaveManager] Failed to save to localStorage:', e);
    return false;
  }
}

/** Load game state from localStorage */
export function loadFromLocalStorage(): GameState | null {
  try {
    const json = localStorage.getItem(LS_KEY);
    if (!json) return null;

    let parsed = JSON.parse(json) as Record<string, unknown>;

    // Run migrations
    parsed = migrateData(parsed);

    // Deep merge with defaults to fill any missing fields
    const freshState = createFreshState() as unknown as Record<string, unknown>;
    const merged = deepMerge(freshState, parsed);

    return merged as unknown as GameState;
  } catch (e) {
    console.error('[SaveManager] Failed to load from localStorage:', e);
    return null;
  }
}

// ============================================================
// INDEXEDDB (Backup)
// ============================================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
  });
}

/** Save a backup to IndexedDB */
export async function saveToIndexedDB(state: GameState): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);

    const saveable = {
      ...state,
      events: [],
      stats: { ...state.stats, lastSaveTime: Date.now() },
    };

    store.put(JSON.stringify(saveable), 'main_save');
    store.put(JSON.stringify(saveable), `backup_${Date.now()}`);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    db.close();
    return true;
  } catch (e) {
    console.error('[SaveManager] Failed to save to IndexedDB:', e);
    return false;
  }
}

/** Load from IndexedDB */
export async function loadFromIndexedDB(): Promise<GameState | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);

    const result = await new Promise<string | undefined>((resolve, reject) => {
      const request = store.get('main_save');
      request.onsuccess = () => resolve(request.result as string | undefined);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (!result) return null;

    let parsed = JSON.parse(result) as Record<string, unknown>;
    parsed = migrateData(parsed);
    const freshState = createFreshState() as unknown as Record<string, unknown>;
    const merged = deepMerge(freshState, parsed);
    return merged as unknown as GameState;
  } catch (e) {
    console.error('[SaveManager] Failed to load from IndexedDB:', e);
    return null;
  }
}

// ============================================================
// EXPORT / IMPORT (Base64 JSON)
// ============================================================

/** Export game state as a Base64-encoded string for manual backup */
export function exportSave(state: GameState): string {
  const saveable = {
    ...state,
    events: [],
    stats: { ...state.stats, lastSaveTime: Date.now() },
  };
  const json = JSON.stringify(saveable);
  return btoa(unescape(encodeURIComponent(json)));
}

/** Import a game state from a Base64-encoded string */
export function importSave(base64: string): GameState | null {
  try {
    const json = decodeURIComponent(escape(atob(base64)));
    let parsed = JSON.parse(json) as Record<string, unknown>;
    parsed = migrateData(parsed);
    const freshState = createFreshState() as unknown as Record<string, unknown>;
    const merged = deepMerge(freshState, parsed);
    return merged as unknown as GameState;
  } catch (e) {
    console.error('[SaveManager] Failed to import save:', e);
    return null;
  }
}

// ============================================================
// WIPE / RESET
// ============================================================

/** Completely wipe all saved data */
export function wipeSave(): void {
  try {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_SETTINGS_KEY);
    // Also clear IDB
    indexedDB.deleteDatabase(IDB_NAME);
  } catch (e) {
    console.error('[SaveManager] Failed to wipe save:', e);
  }
}

// ============================================================
// COMBINED LOAD (with fallback chain)
// ============================================================

/**
 * Attempt to load game state with fallback:
 * 1. localStorage (fast, primary)
 * 2. IndexedDB (backup)
 * 3. Fresh state (new game)
 */
export async function loadGame(): Promise<{ state: GameState; source: 'localStorage' | 'indexedDB' | 'new' }> {
  // Try localStorage first
  const lsState = loadFromLocalStorage();
  if (lsState) {
    return { state: lsState, source: 'localStorage' };
  }

  // Try IndexedDB backup
  const idbState = await loadFromIndexedDB();
  if (idbState) {
    // Restore to localStorage too
    saveToLocalStorage(idbState);
    return { state: idbState, source: 'indexedDB' };
  }

  // Fresh game
  return { state: createFreshState(), source: 'new' };
}

/**
 * Save game to all stores.
 * localStorage is synchronous (fast), IndexedDB is async (backup).
 */
export function saveGame(state: GameState): void {
  saveToLocalStorage(state);
  // Fire-and-forget IndexedDB backup
  saveToIndexedDB(state).catch(() => {});
}
