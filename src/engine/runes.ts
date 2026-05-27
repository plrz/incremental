/**
 * Zikki Incremental — Rune Forging Engine
 * 
 * Handles rune crafting, socketing, removal, and combining.
 */

import type { GameState, RuneInstance, Item } from './gameState';
import { RUNE_TYPES, type RuneDef } from '@/lib/gameConfig';
import { runeForgeMultiplier } from './scaling';

// ============================================================
// QUERIES
// ============================================================

/** Get rune definition by ID */
export function getRuneDef(runeId: string): RuneDef | undefined {
  return RUNE_TYPES.find(r => r.id === runeId);
}

/** Get how many sockets an item has (= star level) */
export function getSocketCount(item: Item): number {
  return item.starLevel;
}

/** Get filled sockets count */
export function getFilledSocketCount(item: Item): number {
  return item.runes.filter(r => r !== null).length;
}

/** Check if an item has empty sockets */
export function hasEmptySocket(item: Item): boolean {
  if (item.runes.length < item.starLevel) return true;
  return item.runes.some(r => r === null);
}

// ============================================================
// FORGE RUNE
// ============================================================

/** Calculate the cost to forge a rune at a given level */
export function runeForgeRequirements(runeDef: RuneDef, level: number): {
  dust: number;
  gems: number;
} {
  const mult = runeForgeMultiplier(level);
  return {
    dust: Math.floor(runeDef.craftCost.dust * mult),
    gems: Math.floor(runeDef.craftCost.gems * mult),
  };
}

/** Can the player forge this rune? */
export function canForgeRune(state: GameState, runeId: string, level: number = 1): boolean {
  const runeDef = getRuneDef(runeId);
  if (!runeDef) return false;

  const cost = runeForgeRequirements(runeDef, level);

  if (state.resources.dust < cost.dust) return false;
  if (state.resources.gems < cost.gems) return false;
  if (state.runes.inventory.length >= state.runes.maxSlots) return false;

  return true;
}

/** Forge a new rune */
export function forgeRune(state: GameState, runeId: string): GameState | null {
  const runeDef = getRuneDef(runeId);
  if (!runeDef) return null;
  if (!canForgeRune(state, runeId)) return null;

  const cost = runeForgeRequirements(runeDef, 1);

  const newRune: RuneInstance = {
    instanceId: crypto.randomUUID(),
    runeId,
    level: 1,
  };

  return {
    ...state,
    resources: {
      ...state.resources,
      dust: state.resources.dust - cost.dust,
      gems: state.resources.gems - cost.gems,
    },
    runes: {
      ...state.runes,
      inventory: [...state.runes.inventory, newRune],
    },
    stats: {
      ...state.stats,
      totalRunesForged: (state.stats.totalRunesForged || 0) + 1,
    },
  };
}

// ============================================================
// COMBINE RUNES (3 same type + level → level + 1)
// ============================================================

/** Find 3 combinable runes of the same type and level */
export function findCombinableRunes(state: GameState): {
  runeId: string;
  level: number;
  instances: RuneInstance[];
}[] {
  const groups = new Map<string, RuneInstance[]>();

  // Only consider runes NOT socketed in any item
  const socketedRuneIds = new Set<string>();
  state.inventory.items.forEach(item => {
    item.runes.forEach(runeInstanceId => {
      if (runeInstanceId) socketedRuneIds.add(runeInstanceId);
    });
  });

  state.runes.inventory.forEach(rune => {
    if (socketedRuneIds.has(rune.instanceId)) return;
    const key = `${rune.runeId}_${rune.level}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(rune);
  });

  const results: {
    runeId: string;
    level: number;
    instances: RuneInstance[];
  }[] = [];

  groups.forEach((instances, key) => {
    if (instances.length >= 3) {
      const [runeId, levelStr] = key.split('_');
      results.push({
        runeId,
        level: parseInt(levelStr),
        instances: instances.slice(0, 3),
      });
    }
  });

  return results;
}

/** Combine 3 runes into a higher level rune */
export function combineRunes(
  state: GameState,
  instanceIds: [string, string, string]
): GameState | null {
  // Validate all 3 runes exist and are the same type + level
  const runes = instanceIds.map(id =>
    state.runes.inventory.find(r => r.instanceId === id)
  );

  if (runes.some(r => !r)) return null;

  const validRunes = runes as RuneInstance[];
  const firstRune = validRunes[0];

  if (!validRunes.every(r => r.runeId === firstRune.runeId && r.level === firstRune.level)) {
    return null;
  }

  if (firstRune.level >= 10) return null; // Max level

  // Check none are socketed
  const socketedRuneIds = new Set<string>();
  state.inventory.items.forEach(item => {
    item.runes.forEach(runeInstanceId => {
      if (runeInstanceId) socketedRuneIds.add(runeInstanceId);
    });
  });

  if (instanceIds.some(id => socketedRuneIds.has(id))) return null;

  // Create new rune
  const newRune: RuneInstance = {
    instanceId: crypto.randomUUID(),
    runeId: firstRune.runeId,
    level: firstRune.level + 1,
  };

  // Remove consumed runes, add new one
  const newInventory = state.runes.inventory.filter(
    r => !instanceIds.includes(r.instanceId)
  );
  newInventory.push(newRune);

  return {
    ...state,
    runes: {
      ...state.runes,
      inventory: newInventory,
    },
  };
}

// ============================================================
// SOCKET / UNSOCKET
// ============================================================

/** Socket a rune into an item */
export function socketRune(
  state: GameState,
  itemInstanceId: string,
  runeInstanceId: string
): GameState | null {
  const item = state.inventory.items.find(i => i.instanceId === itemInstanceId);
  if (!item) return null;

  const rune = state.runes.inventory.find(r => r.instanceId === runeInstanceId);
  if (!rune) return null;

  // Ensure item has runes array of correct length
  const runes = [...(item.runes || [])];
  while (runes.length < item.starLevel) runes.push(null);

  // Find first empty socket
  const emptyIndex = runes.findIndex(r => r === null);
  if (emptyIndex === -1) return null; // No empty sockets

  runes[emptyIndex] = runeInstanceId;

  const newItems = state.inventory.items.map(i =>
    i.instanceId === itemInstanceId ? { ...i, runes } : i
  );

  return {
    ...state,
    inventory: {
      ...state.inventory,
      items: newItems,
    },
  };
}

/** Remove a rune from an item (costs dust, 70% success rate) */
export function unsocketRune(
  state: GameState,
  itemInstanceId: string,
  socketIndex: number
): { state: GameState; success: boolean } | null {
  const item = state.inventory.items.find(i => i.instanceId === itemInstanceId);
  if (!item) return null;

  const runeInstanceId = item.runes[socketIndex];
  if (!runeInstanceId) return null;

  const rune = state.runes.inventory.find(r => r.instanceId === runeInstanceId);
  if (!rune) return null;

  // Cost: 500 dust
  const cost = 500;
  if (state.resources.dust < cost) return null;

  const success = Math.random() < 0.7; // 70% success rate

  const newRunes = [...item.runes];
  newRunes[socketIndex] = null;

  const newItems = state.inventory.items.map(i =>
    i.instanceId === itemInstanceId ? { ...i, runes: newRunes } : i
  );

  let newRuneInventory = [...state.runes.inventory];
  if (!success) {
    // Rune is destroyed on failure
    newRuneInventory = newRuneInventory.filter(r => r.instanceId !== runeInstanceId);
  }

  return {
    state: {
      ...state,
      resources: {
        ...state.resources,
        dust: state.resources.dust - cost,
      },
      inventory: {
        ...state.inventory,
        items: newItems,
      },
      runes: {
        ...state.runes,
        inventory: newRuneInventory,
      },
    },
    success,
  };
}
