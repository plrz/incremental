/**
 * Zikki Incremental — Crafting Engine
 * 
 * Handles item crafting, material transmutation, and blueprint recipes.
 */

import type { GameState, Item, CraftingMaterialState } from './gameState';
import { CRAFTING_RECIPES, MATERIALS, QUALITIES, type CraftingRecipeDef } from '@/lib/gameConfig';
import { getItemDef, getQualityDef, getQualityIndex, getScrapValue } from './items';

// ============================================================
// QUERIES
// ============================================================

/** Get all available recipes (filtered by unlocked blueprints) */
export function getAvailableRecipes(state: GameState): CraftingRecipeDef[] {
  return CRAFTING_RECIPES.filter(recipe => {
    if (recipe.isBlueprint) {
      return state.crafting.blueprintsUnlocked.includes(recipe.id);
    }
    return true;
  });
}

/** Check if player has materials for a transmutation recipe */
export function canTransmute(
  state: GameState,
  recipeId: string
): boolean {
  const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
  if (!recipe || recipe.category !== 'transmute') return false;

  for (const ingredient of recipe.ingredients) {
    if (ingredient.type === 'material' && ingredient.subtype) {
      const key = ingredient.subtype as keyof CraftingMaterialState;
      if ((state.craftingMaterials[key] || 0) < ingredient.count) return false;
    }
  }

  return true;
}

// ============================================================
// TIER SYNTHESIS (3 items → +1 tier)
// ============================================================

/** Find groups of 3 same-tier, same-type items that can be combined */
export function findCombinableItems(state: GameState): {
  type: string;
  tier: number;
  items: Item[];
}[] {
  // Group unequipped, non-consumable items by type + tier
  const groups = new Map<string, Item[]>();
  const equippedIds = new Set(Object.values(state.inventory.equipped).filter(Boolean));

  state.inventory.items.forEach(item => {
    if (item.type === 'consumable') return;
    if (equippedIds.has(item.instanceId)) return;

    const key = `${item.type}_${item.tier}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  });

  const results: { type: string; tier: number; items: Item[] }[] = [];

  groups.forEach((items, key) => {
    if (items.length >= 3) {
      const [type, tierStr] = key.split('_');
      const tier = parseInt(tierStr);

      // Can only combine if there's a next tier
      if (tier < MATERIALS.length) {
        results.push({
          type,
          tier,
          items: items.slice(0, 3),
        });
      }
    }
  });

  return results;
}

/** Combine 3 items into a +1 tier item */
export function combineItems(
  state: GameState,
  itemInstanceIds: [string, string, string]
): GameState | null {
  // Validate all items exist
  const items = itemInstanceIds.map(id =>
    state.inventory.items.find(i => i.instanceId === id)
  );

  if (items.some(i => !i)) return null;
  const validItems = items as Item[];

  // All must be same type and tier
  const firstItem = validItems[0];
  if (!validItems.every(i =>
    i.type === firstItem.type && i.tier === firstItem.tier
  )) return null;

  // Must not be equipped
  const equippedIds = new Set(Object.values(state.inventory.equipped).filter(Boolean));
  if (itemInstanceIds.some(id => equippedIds.has(id))) return null;

  // Must have a next tier
  if (firstItem.tier >= MATERIALS.length) return null;

  // Determine output quality (best of inputs)
  const bestQualityIndex = Math.max(...validItems.map(i => getQualityIndex(i.quality)));
  const bestQuality = QUALITIES[bestQualityIndex];

  // Create new item
  const newTierIndex = firstItem.tier; // tier is 1-indexed, array is 0-indexed
  const prefix = firstItem.type === 'head' ? 'helmet'
    : firstItem.type === 'body' ? 'chest'
    : firstItem.type === 'feet' ? 'boots'
    : 'weapon';

  const newItem: Item = {
    id: crypto.randomUUID(),
    instanceId: crypto.randomUUID(),
    type: firstItem.type,
    itemId: `${prefix}_${newTierIndex}`,
    quality: bestQuality.id,
    qualityValue: Math.floor(Math.random() * 101),
    isOverdrive: false,
    level: 1,
    starLevel: 0,
    enchants: [],
    tier: firstItem.tier + 1,
    runes: [],
  };

  // Remove consumed items, add new one
  const newItems = state.inventory.items.filter(
    i => !itemInstanceIds.includes(i.instanceId)
  );
  newItems.push(newItem);

  return {
    ...state,
    inventory: {
      ...state.inventory,
      items: newItems,
    },
    stats: {
      ...state.stats,
      totalItemsCrafted: (state.stats.totalItemsCrafted || 0) + 1,
    },
    crafting: {
      ...state.crafting,
      craftCount: state.crafting.craftCount + 1,
    },
  };
}

// ============================================================
// TRANSMUTATION
// ============================================================

/** Transmute materials (3:1 ratio) */
export function transmuteMaterials(
  state: GameState,
  recipeId: string
): GameState | null {
  const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
  if (!recipe || recipe.category !== 'transmute') return null;
  if (!canTransmute(state, recipeId)) return null;

  const newMaterials = { ...state.craftingMaterials };

  // Deduct ingredients
  for (const ingredient of recipe.ingredients) {
    if (ingredient.type === 'material' && ingredient.subtype) {
      const key = ingredient.subtype as keyof CraftingMaterialState;
      newMaterials[key] -= ingredient.count;
    }
  }

  // Add result
  if (recipe.result.type === 'material' && recipe.result.itemId) {
    const key = recipe.result.itemId as keyof CraftingMaterialState;
    newMaterials[key] = (newMaterials[key] || 0) + 1;
  }

  return {
    ...state,
    craftingMaterials: newMaterials,
  };
}

// ============================================================
// SALVAGE (Enhanced scrap with crafting materials)
// ============================================================

/** Salvage an item, gaining gold, dust, and crafting materials */
export function salvageItem(state: GameState, itemInstanceId: string): GameState | null {
  const item = state.inventory.items.find(i => i.instanceId === itemInstanceId);
  if (!item) return null;

  // Can't salvage equipped items
  const equippedIds = new Set(Object.values(state.inventory.equipped).filter(Boolean));
  if (equippedIds.has(itemInstanceId)) return null;

  const { gold, dust, materials } = getScrapValue(item);

  // Remove item
  const newItems = state.inventory.items.filter(i => i.instanceId !== itemInstanceId);

  // Add resources
  const newResources = { ...state.resources };
  newResources.gold += gold;
  newResources.dust += dust;

  // Add crafting materials
  const newMaterials = { ...state.craftingMaterials };
  Object.entries(materials).forEach(([key, value]) => {
    const matKey = key as keyof CraftingMaterialState;
    newMaterials[matKey] = (newMaterials[matKey] || 0) + value;
  });

  // Unequip if needed
  const newEquipped = { ...state.inventory.equipped };
  if (item.type !== 'consumable' && newEquipped[item.type as keyof typeof newEquipped] === itemInstanceId) {
    (newEquipped as Record<string, string | null>)[item.type] = null;
  }

  return {
    ...state,
    resources: newResources,
    craftingMaterials: newMaterials,
    inventory: {
      ...state.inventory,
      items: newItems,
      equipped: newEquipped,
    },
  };
}
