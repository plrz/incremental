/**
 * Zikki Incremental — Complete Type System & Initial State
 * 
 * This file defines every type used across the entire game engine.
 * No React imports — pure data structures.
 */

// ============================================================
// ITEM TYPES
// ============================================================

export type ItemSlot = 'head' | 'body' | 'feet' | 'hand';
export type ItemType = ItemSlot | 'consumable';

export interface Item {
  id: string;
  instanceId: string;
  type: ItemType;
  itemId: string;
  quality: string;        // Quality ID (e.g. 'common', 'rare')
  qualityValue: number;   // 0-100 (can exceed 100 in Overdrive)
  isOverdrive: boolean;
  level: number;
  starLevel: number;      // 0-5
  enchants: string[];     // Enchant IDs
  tier: number;
  runes: (string | null)[]; // Rune instance IDs in sockets (length = starLevel)
  unlockEndTimestamp?: number; // Optional unlock countdown end timestamp for chests
}

export interface RuneInstance {
  instanceId: string;
  runeId: string;         // Base rune type ID
  level: number;          // 1-10
}

// ============================================================
// SKILL TREE TYPES
// ============================================================

export type SkillTreeBranch = 'warrior' | 'commander' | 'arcane';

export interface SkillTreeState {
  points: number;           // Available skill points
  totalPointsEarned: number;
  nodes: Record<string, number>; // nodeId -> level
  respecCount: number;
}

// ============================================================
// RUNE TYPES
// ============================================================

export interface RuneState {
  inventory: RuneInstance[];
  maxSlots: number;          // Total rune storage capacity
}

// ============================================================
// CRAFTING TYPES
// ============================================================

export interface CraftingMaterialState {
  platingShards: number;     // From head items
  reinforcedFiber: number;   // From body items
  fluxCrystals: number;      // From feet items
  essenceCores: number;      // From hand items
}

export interface CraftingState {
  blueprintsUnlocked: string[]; // Blueprint IDs
  craftCount: number;           // Total items crafted
}

// ============================================================
// QUEST TYPES
// ============================================================

export interface Quest {
  id: string;
  templateIndex: number;
  name: string;
  type: string;
  target: number;
  progress: number;
  reward: Record<string, number>;
  isCompleted: boolean;
}

// ============================================================
// COMBAT TYPES
// ============================================================

export interface CombatState {
  currentWave: number;
  currentEnemyHp: number;
  currentEnemyMaxHp: number;
  currentEnemyElement: string | null;
  playerHp: number;
  playerMaxHp: number;
  enemiesDefeated: number;
  enemiesInWave: number;
  bossFightActive: boolean;
  isBossGate: boolean;
  currentModifier: string | null;
}

// ============================================================
// NEW: PETS TYPES
// ============================================================

export interface Pet {
  instanceId: string;
  petId: string;          // e.g. 'wolf', 'dragon'
  level: number;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'celestial';
}

export interface PetEgg {
  instanceId: string;
  eggType: 'standard' | 'rare' | 'dungeon';
  wavesToHatch: number;
}

export interface PetState {
  active: string[];       // Pet instance IDs currently equipped
  inventory: Pet[];
  eggs: PetEgg[];
}

// ============================================================
// NEW: RESEARCH TYPES
// ============================================================

export interface ResearchState {
  nodes: Record<string, number>; // techId -> level
  activeResearchId: string | null;
  activeResearchEnd: number | null; // Timestamp
}

// ============================================================
// NEW: DUNGEON TYPES
// ============================================================

export interface ActiveDungeon {
  dungeonId: string;
  name: string;
  timeLeft: number;       // In seconds
  wave: number;
  kills: number;
  modifiers: string[];
}

// ============================================================
// NEW: WORLD BOSS TYPES
// ============================================================

export interface WorldBossState {
  active: boolean;
  bossId: string;
  name: string;
  hp: number;
  maxHp: number;
  timeLimit: number;      // In seconds
  elapsed: number;        // In seconds
}

// ============================================================
// RESOURCE TYPES
// ============================================================

export interface ResourceState {
  gold: number;
  gems: number;
  dust: number;
  bossKeys: number;
  rebirthPoints: number;
  skillPoints: number;
  researchPoints: number;
  // Phase 2 & 3 new
  ascensionPoints: number;
  timeCrystals: number;
  purityOrbs: number;
  dungeonKeys: number;
}

// ============================================================
// STATS TYPES
// ============================================================

export interface StatsState {
  rebirths: number;
  ascensions: number;
  lastSaveTime: number;
  highestWave: number;
  totalKills: number;
  totalGold: number;
  totalClicks: number;
  timePlayed: number;
  totalItemsCrafted: number;
  totalRunesForged: number;
  playerLevel: number;
  playerXp: number;
  playerXpToNext: number;
  // Phase 2 & 3 new
  factionRep: Record<string, number>;        // factionId -> reputation
  elementalMastery: Record<string, number>;  // elementId -> mastery level
  elementalKills: Record<string, number>;    // elementId -> kill count
}

// ============================================================
// SETTINGS TYPES
// ============================================================

export interface SettingsState {
  autoScrapRarity: string;
  autoScrapTier: number;
  showEffects: boolean;
  showDamageNumbers: boolean;
  numberFormat: 'abbreviated' | 'scientific' | 'full';
  theme: 'dark' | 'midnight' | 'abyss';
  musicEnabled: boolean;
  musicVolume: number;
  quickSalvage: boolean;
  autoBattle: boolean;
  autoSkills: boolean;
}

// ============================================================
// TITLE TYPES
// ============================================================

export interface TitleState {
  unlocked: string[];
  selected: string | null;
}

// ============================================================
// UPGRADE TYPES
// ============================================================

export interface UpgradeState {
  attackSpeed: number;
  autoClicker: number;
  luck: number;
  enchantChance: number;
  chestDropChance: number;
  goldInterest: number;
  criticalStrike: number;
  offlineProgress: number;
  chestSlots: number;
  chestUnlockSpeed: number;
  autoSkill: number;
  dpsMultiplier: number;
  clickDmgMultiplier: number;
  goldMultiplier: number;
  xpMultiplier: number;
  bossKeyChance: number;
  gemDropChance: number;
  runeCap: number;
}

// ============================================================
// COMPLETE GAME STATE
// ============================================================

export interface GameState {
  // Meta
  version: number;
  createdAt: number;

  // Core
  resources: ResourceState;
  stats: StatsState;
  settings: SettingsState;

  // Combat
  combat: CombatState;

  // Items & Equipment
  inventory: {
    items: Item[];
    equipped: Record<ItemSlot, string | null>; // slot -> instanceId
  };

  // Runes & Crafting
  runes: RuneState;
  craftingMaterials: CraftingMaterialState;
  crafting: CraftingState;

  // Progression
  upgrades: UpgradeState;
  skillTree: SkillTreeState;

  // Prestige
  rebirthUpgrades: Record<string, number>;
  // Phase 2 New
  ascensionPerks: Record<string, number>; // perkId -> level
  faction: string | null;                 // faction ID

  // Phase 2 New Systems
  pets: PetState;
  research: ResearchState;

  // Phase 3 New Systems
  activeDungeon: ActiveDungeon | null;
  worldBoss: WorldBossState | null;
  corruption: number;                    // 0-100
  timeRiftActive: { type: string; endTimestamp: number } | null;

  // Content
  achievements: string[];
  titles: TitleState;
  quests: {
    active: Quest[];
  };

  // Potions & Skills
  activePotions: Record<string, number>; // potionId -> expiry timestamp
  skills: Record<string, number>;        // skillId -> cooldown end timestamp

  // Workers
  workers: Record<string, number>;       // workerId -> count

  // Events (transient, not saved)
  events: GameEvent[];
}

// ============================================================
// EVENT TYPES (Transient — not persisted)
// ============================================================

export interface GameEvent {
  type: string;
  data: Record<string, unknown>;
}

// ============================================================
// INITIAL STATE
// ============================================================

export const SAVE_VERSION = 3;

export const INITIAL_STATE: GameState = {
  version: SAVE_VERSION,
  createdAt: Date.now(),

  resources: {
    gold: 0,
    gems: 0,
    dust: 0,
    bossKeys: 0,
    rebirthPoints: 0,
    skillPoints: 0,
    researchPoints: 0,
    ascensionPoints: 0,
    timeCrystals: 0,
    purityOrbs: 0,
    dungeonKeys: 0,
  },

  stats: {
    rebirths: 0,
    ascensions: 0,
    lastSaveTime: Date.now(),
    highestWave: 1,
    totalKills: 0,
    totalGold: 0,
    totalClicks: 0,
    timePlayed: 0,
    totalItemsCrafted: 0,
    totalRunesForged: 0,
    playerLevel: 1,
    playerXp: 0,
    playerXpToNext: 100,
    factionRep: { blade: 0, merchant: 0, conclave: 0 },
    elementalMastery: { fire: 0, ice: 0, lightning: 0, nature: 0, dark: 0, holy: 0 },
    elementalKills: { fire: 0, ice: 0, lightning: 0, nature: 0, dark: 0, holy: 0 },
  },

  settings: {
    autoScrapRarity: 'none',
    autoScrapTier: 0,
    showEffects: true,
    showDamageNumbers: true,
    numberFormat: 'abbreviated',
    theme: 'midnight',
    musicEnabled: false,
    musicVolume: 50,
    quickSalvage: false,
    autoBattle: false,
    autoSkills: false,
  },

  combat: {
    currentWave: 1,
    currentEnemyHp: 10,
    currentEnemyMaxHp: 10,
    currentEnemyElement: null,
    playerHp: 100,
    playerMaxHp: 100,
    enemiesDefeated: 0,
    enemiesInWave: 5,
    bossFightActive: false,
    isBossGate: false,
    currentModifier: null,
  },

  inventory: {
    items: [],
    equipped: { head: null, body: null, feet: null, hand: null },
  },

  runes: {
    inventory: [],
    maxSlots: 50,
  },

  craftingMaterials: {
    platingShards: 0,
    reinforcedFiber: 0,
    fluxCrystals: 0,
    essenceCores: 0,
  },

  crafting: {
    blueprintsUnlocked: [],
    craftCount: 0,
  },

  upgrades: {
    attackSpeed: 0,
    autoClicker: 0,
    luck: 0,
    enchantChance: 0,
    chestDropChance: 0,
    goldInterest: 0,
    criticalStrike: 0,
    offlineProgress: 0,
    chestSlots: 0,
    chestUnlockSpeed: 0,
    autoSkill: 0,
    dpsMultiplier: 0,
    clickDmgMultiplier: 0,
    goldMultiplier: 0,
    xpMultiplier: 0,
    bossKeyChance: 0,
    gemDropChance: 0,
    runeCap: 0,
  },

  skillTree: {
    points: 0,
    totalPointsEarned: 0,
    nodes: {},
    respecCount: 0,
  },

  rebirthUpgrades: {},
  ascensionPerks: {},
  faction: null,

  pets: {
    active: [],
    inventory: [],
    eggs: [],
  },

  research: {
    nodes: {},
    activeResearchId: null,
    activeResearchEnd: null,
  },

  activeDungeon: null,
  worldBoss: null,
  corruption: 0,
  timeRiftActive: null,

  achievements: [],
  titles: { unlocked: ['novice'], selected: 'novice' },
  quests: { active: [] },

  activePotions: {},
  skills: {},
  workers: {},
  events: [],
};

/**
 * Creates a deep clone of INITIAL_STATE with fresh timestamps.
 */
export function createFreshState(): GameState {
  const now = Date.now();
  return {
    ...structuredClone(INITIAL_STATE),
    createdAt: now,
    stats: {
      ...structuredClone(INITIAL_STATE.stats),
      lastSaveTime: now,
    },
  };
}
