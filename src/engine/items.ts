/**
 * Zikki Incremental — Item Engine
 * 
 * All item-related calculations: power, generation, rune sockets.
 * Pure functions — no React, no side effects.
 */

import type { GameState, Item, RuneInstance } from './gameState';
import {
  ALL_ITEMS, QUALITIES, ENCHANTS, MATERIALS, CHESTS, POTIONS,
  RUNE_TYPES, ELEMENTS,
  type ItemDef, type QualityDef,
} from '@/lib/gameConfig';
import {
  itemLevelMultiplier, itemStarMultiplier,
  rebirthLuckBonus, maxItemTierForWave,
} from './scaling';

// ============================================================
// ITEM LOOKUP
// ============================================================

const itemCache = new Map<string, ItemDef>();

/** Get the base definition for an item by its itemId */
export function getItemDef(itemId: string): ItemDef | undefined {
  if (itemCache.size === 0) {
    ALL_ITEMS.forEach(item => itemCache.set(item.id, item));
  }
  return itemCache.get(itemId);
}

/** Get quality definition by id */
export function getQualityDef(qualityId: string): QualityDef {
  return QUALITIES.find(q => q.id === qualityId) || QUALITIES[1];
}

/** Get the quality index (0 = poor, 10 = transcendent) */
export function getQualityIndex(qualityId: string): number {
  return QUALITIES.findIndex(q => q.id === qualityId);
}

// ============================================================
// ITEM POWER CALCULATION
// ============================================================

/** Calculate the effective power of an item (damage for weapons, defense for armor) */
export function calculateItemPower(item: Item, state?: GameState): number {
  const baseDef = getItemDef(item.itemId);
  if (!baseDef) return 0;

  const quality = getQualityDef(item.quality);
  const qualityMult = quality.multiplier * (1 + (item.qualityValue / 200));

  // Enchant multiplier
  let enchantMult = 1;
  item.enchants.forEach(eId => {
    const enchant = ENCHANTS.find(e => e.id === eId);
    if (enchant?.statMod) {
      if (item.type === 'hand' && enchant.statMod.damage) enchantMult *= enchant.statMod.damage;
      if (item.type !== 'hand' && enchant.statMod.defense) enchantMult *= enchant.statMod.defense;
    }
  });

  const levelMult = itemLevelMultiplier(item.level);
  const starMult = itemStarMultiplier(item.starLevel);

  // Rune multiplier
  let runeMult = 1;
  if (state && item.runes) {
    item.runes.forEach(runeInstanceId => {
      if (!runeInstanceId) return;
      const runeInstance = state.runes.inventory.find(r => r.instanceId === runeInstanceId);
      if (!runeInstance) return;
      const runeDef = RUNE_TYPES.find(r => r.id === runeInstance.runeId);
      if (!runeDef) return;

      if (
        (item.type === 'hand' && runeDef.statType === 'damage') ||
        (item.type !== 'hand' && runeDef.statType === 'defense')
      ) {
        runeMult *= 1 + (runeDef.baseValue * runeInstance.level / 100);
      }
    });
  }

  let baseStat = item.type === 'hand'
    ? (baseDef.damage || 0)
    : (baseDef.defense || 0);

  // Research: Tempered Steel (+2% stats per level)
  if (state) {
    const { getResearchMultiplier } = require('./research');
    baseStat *= getResearchMultiplier(state, 'r_temperedSteel', 0.02);
  }

  return baseStat * qualityMult * enchantMult * levelMult * starMult * runeMult;
}

// ============================================================
// PLAYER STAT CALCULATIONS
// ============================================================

/** Calculate total click damage */
export function calculateClickDamage(state: GameState): number {
  let dmg = 1;
  const weaponId = state.inventory.equipped.hand;

  if (weaponId) {
    const weapon = state.inventory.items.find(i => i.instanceId === weaponId);
    if (weapon) {
      dmg += calculateItemPower(weapon, state);
    }
  }

  // Rebirth multiplier
  let mult = 1 + (state.stats.rebirths * 0.5);

  // Click damage upgrade
  const clickUpgrade = state.upgrades.clickDmgMultiplier || 0;
  mult *= 1 + (clickUpgrade * 0.15);

  // Potion buff
  if (state.activePotions['strength'] > Date.now()) mult *= 2;

  // Skill tree: warrior click damage
  const sharpEdge = state.skillTree.nodes['w_sharpEdge'] || 0;
  mult *= 1 + (sharpEdge * 0.05);

  // Factions: Blade gives +50%, Merchant gives -25%
  if (state.faction === 'blade') mult *= 1.5;
  if (state.faction === 'merchant') mult *= 0.75;

  // Pets: click damage bonus
  const { calculatePetStatBonus } = require('./pets');
  mult *= calculatePetStatBonus(state, 'clickDamage');

  return dmg * mult;
}

/** Calculate total DPS from workers/army */
export function calculateDPS(state: GameState): number {
  const { WORKERS } = require('@/lib/gameConfig');
  let dps = 0;

  WORKERS.forEach((w: { id: string; dps: number }) => {
    dps += (state.workers[w.id] || 0) * w.dps;
  });

  // Rebirth multiplier
  let mult = 1 + (state.stats.rebirths * 0.5);

  // Worker DPS upgrade
  const dpsUpgrade = state.upgrades.dpsMultiplier || 0;
  mult *= 1 + (dpsUpgrade * 0.15);

  // Potion buff
  if (state.activePotions['strength'] > Date.now()) mult *= 2;

  // Skill tree: commander worker DPS
  const inspiration = state.skillTree.nodes['c_inspiration'] || 0;
  mult *= 1 + (inspiration * 0.05);

  // Rune set bonus: Onyx
  const onyxRuneCount = countRuneType(state, 'onyx');
  if (onyxRuneCount >= 3) mult *= 1.25;
  if (onyxRuneCount >= 5) {
    const totalWorkers = Object.values(state.workers).reduce((sum, c) => sum + c, 0);
    mult *= 1 + (totalWorkers * 0.01);
  }

  // Factions: Blade gives -25% worker dps
  if (state.faction === 'blade') mult *= 0.75;

  // Research: Industrial Automation (+3% worker DPS per level)
  const { getResearchMultiplier } = require('./research');
  mult *= getResearchMultiplier(state, 'r_automation', 0.03);

  // Ascension Perks: Singularity Force (+1% compound per worker owned per level)
  const singularityLevel = state.ascensionPerks['singularity'] || 0;
  if (singularityLevel > 0) {
    const totalWorkers = Object.values(state.workers).reduce((sum, c) => sum + c, 0);
    mult *= Math.pow(1 + (singularityLevel * 0.01), totalWorkers);
  }

  // Pets: worker DPS bonus
  const { calculatePetStatBonus } = require('./pets');
  mult *= calculatePetStatBonus(state, 'dps');

  return dps * mult;
}

/** Calculate max HP from equipment */
export function calculateMaxHp(state: GameState): number {
  let hp = 100;
  const slots: ('head' | 'body' | 'feet')[] = ['head', 'body', 'feet'];

  slots.forEach(slot => {
    const instanceId = state.inventory.equipped[slot];
    if (instanceId) {
      const item = state.inventory.items.find(i => i.instanceId === instanceId);
      if (item) {
        hp += calculateItemPower(item, state) * 10;
      }
    }
  });

  let mult = 1;
  // Factions: Conclave gives -25% defense (HP)
  if (state.faction === 'conclave') mult *= 0.75;

  // Pets: defense bonus
  const { calculatePetStatBonus } = require('./pets');
  mult *= calculatePetStatBonus(state, 'defense');

  return hp * mult;
}

// ============================================================
// RUNE HELPERS
// ============================================================

/** Count equipped runes of a specific type across all equipment */
export function countRuneType(state: GameState, runeTypeId: string): number {
  let count = 0;
  const slots: ('head' | 'body' | 'feet' | 'hand')[] = ['head', 'body', 'feet', 'hand'];

  slots.forEach(slot => {
    const instanceId = state.inventory.equipped[slot];
    if (!instanceId) return;
    const item = state.inventory.items.find(i => i.instanceId === instanceId);
    if (!item?.runes) return;

    item.runes.forEach(runeInstanceId => {
      if (!runeInstanceId) return;
      const runeInstance = state.runes.inventory.find(r => r.instanceId === runeInstanceId);
      if (runeInstance && runeInstance.runeId === runeTypeId) count++;
    });
  });

  return count;
}

// ============================================================
// ITEM GENERATION
// ============================================================

/** Generate a random item from a chest opening */
export function generateItemFromChest(
  chestId: string,
  state: GameState
): { item: Item; isAutoScrapped: boolean } | null {
  const chest = CHESTS.find(c => c.id === chestId);
  if (!chest) return null;

  const luckLevel = state.upgrades.luck || 0;
  const rebirthLuck = (state.stats.rebirths || 0) * 0.05;
  const totalLuck = luckLevel + (rebirthLuck * 10);

  // Effective power (lower = better drops)
  const effectivePower = Math.max(0.5, (chest.power || 5) - (totalLuck * 0.05));

  // Roll tier
  const maxTier = MATERIALS.length;
  const roll = Math.random();
  let tier = Math.floor(Math.pow(roll, effectivePower) * maxTier);

  // Wave cap
  const waveCap = maxItemTierForWave(state.stats.highestWave, maxTier);
  tier = Math.min(tier, waveCap, maxTier - 1);

  // Determine type
  let type: 'head' | 'body' | 'feet' | 'hand' | 'consumable' = 'hand';
  let itemId = '';

  if (Math.random() < 0.2) {
    // Potion
    type = 'consumable';
    const potion = POTIONS[Math.floor(Math.random() * POTIONS.length)];
    itemId = potion.id;
  } else {
    const types: ('head' | 'body' | 'feet' | 'hand')[] = ['head', 'body', 'feet', 'hand'];
    type = types[Math.floor(Math.random() * types.length)];

    const prefix = type === 'head' ? 'helmet' : type === 'body' ? 'chest' : type === 'feet' ? 'boots' : 'weapon';
    itemId = `${prefix}_${tier}`;
  }

  // Generate quality using chest power and power-scaling luck factor
  const corruptionQualityBonus = 1 + (state.corruption * 0.01);
  const chestPowerFactor = 5 / (chest.power || 5); // standard = 1, royal = 1.67, cosmic = 3.33
  const luckMultiplier = (1 + (luckLevel * 0.1) + rebirthLuck) * corruptionQualityBonus * chestPowerFactor;
  const rand = Math.pow(Math.random(), 1 / luckMultiplier);
  let quality = QUALITIES[1]; // Common

  if (type === 'consumable') {
    if (rand > 0.99) quality = QUALITIES[5];     // Legendary
    else if (rand > 0.9) quality = QUALITIES[3];  // Rare
    else quality = QUALITIES[1];                  // Common
  } else {
    if (rand > 0.9995) quality = QUALITIES[10];     // Transcendent
    else if (rand > 0.998) quality = QUALITIES[9];   // Cosmic
    else if (rand > 0.995) quality = QUALITIES[8];   // Celestial
    else if (rand > 0.99) quality = QUALITIES[7];    // Divine
    else if (rand > 0.97) quality = QUALITIES[6];    // Mythic
    else if (rand > 0.94) quality = QUALITIES[5];    // Legendary
    else if (rand > 0.85) quality = QUALITIES[4];    // Epic
    else if (rand > 0.70) quality = QUALITIES[3];    // Rare
    else if (rand > 0.50) quality = QUALITIES[2];    // Uncommon
    else if (rand < 0.10) quality = QUALITIES[0];    // Poor
    else quality = QUALITIES[1];                     // Common
  }

  const qualityValue = Math.floor(Math.random() * 101);

  // Generate enchants
  const enchants: string[] = [];
  if (type !== 'consumable') {
    const enchantChanceUpgrade = state.upgrades.enchantChance || 0;
    const baseEnchantChance = 0.3;
    const totalEnchantChance = baseEnchantChance + (enchantChanceUpgrade * 0.05);

    if (Math.random() < totalEnchantChance) {
      const possibleEnchants = ENCHANTS.filter(
        e => e.type === 'all' || e.type === (type === 'hand' ? 'weapon' : 'armor')
      );
      const enchant = possibleEnchants[Math.floor(Math.random() * possibleEnchants.length)];
      if (enchant) enchants.push(enchant.id);
    }
  }

  // Determine element
  const material = MATERIALS[tier];
  const element = material?.element || 'fire';

  const newItem: Item = {
    id: crypto.randomUUID(),
    instanceId: crypto.randomUUID(),
    type,
    itemId,
    quality: quality.id,
    qualityValue,
    isOverdrive: false,
    level: 1,
    starLevel: 0,
    enchants,
    tier: type === 'consumable' ? 0 : tier + 1,
    runes: [],
  };

  // Auto-scrap check
  const qualityIndex = getQualityIndex(quality.id);
  const scrapRarityIndex = getQualityIndex(state.settings.autoScrapRarity);
  const scrapTier = state.settings.autoScrapTier || 0;
  const isTranscendent = quality.id === 'transcendent';

  const isAutoScrapped = !isTranscendent && type !== 'consumable' && (
    (scrapRarityIndex >= 0 && qualityIndex <= scrapRarityIndex) ||
    (scrapTier > 0 && (newItem.tier || 0) <= scrapTier)
  );

  return { item: newItem, isAutoScrapped };
}

/** Calculate scrap value of an item */
export function getScrapValue(item: Item): { gold: number; dust: number; materials: Record<string, number> } {
  const quality = getQualityDef(item.quality);
  const tier = item.tier || 1;
  const dustAmount = Math.floor((quality.multiplier * 10) * tier);
  const goldAmount = tier * 5000;

  // Crafting materials based on item type
  const materials: Record<string, number> = {};
  const matAmount = Math.max(1, Math.floor(tier / 5));

  switch (item.type) {
    case 'head': materials.platingShards = matAmount; break;
    case 'body': materials.reinforcedFiber = matAmount; break;
    case 'feet': materials.fluxCrystals = matAmount; break;
    case 'hand': materials.essenceCores = matAmount; break;
  }

  return { gold: goldAmount, dust: dustAmount, materials };
}

/** Get the element of an equipped weapon */
export function getPlayerElement(state: GameState): string | null {
  const weaponId = state.inventory.equipped.hand;
  if (!weaponId) return null;
  
  const weapon = state.inventory.items.find(i => i.instanceId === weaponId);
  if (!weapon) return null;

  const itemDef = getItemDef(weapon.itemId);
  if (!itemDef) return null;

  return itemDef.element || null;
}

/** Calculate elemental damage multiplier */
export function getElementalMultiplier(attackerElement: string | null, defenderElement: string | null): number {
  if (!attackerElement || !defenderElement) return 1;

  const element = ELEMENTS.find(e => e.id === attackerElement);
  if (!element) return 1;

  if (element.strongAgainst === defenderElement) return 2.0;
  if (element.weakAgainst === defenderElement) return 0.5;
  return 1;
}
