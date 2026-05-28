/**
 * Zikki Incremental — Scaling & Balance Formulas
 * 
 * Central location for ALL mathematical scaling in the game.
 * Makes balance tuning easy — change one number, affect the whole game.
 */

// ============================================================
// ENEMY SCALING
// ============================================================

/** Enemy HP scales exponentially with wave */
export function enemyHpForWave(wave: number, baseMult: number): number {
  return Math.floor(10 * baseMult * Math.pow(1.12, wave - 1));
}

/** Enemy gold reward scales slightly slower than HP */
export function enemyGoldForWave(wave: number, baseMult: number): number {
  return Math.floor(2 * baseMult * Math.pow(1.10, wave - 1));
}

/** Enemy damage scales with wave */
export function enemyDamageForWave(wave: number): number {
  return Math.floor(1 * Math.pow(1.08, wave - 1));
}

/** Boss HP (for boss key fights) */
export function bossHpForWave(wave: number): number {
  return Math.pow(1.12, wave) * 20000;
}

/** World Boss HP scales in proportion to standard gate bosses */
export function worldBossHp(wave: number, hpMultiplier: number): number {
  return bossHpForWave(wave) * (hpMultiplier / 10);
}

/** Dungeon enemy HP scales statically based on dungeon tier rather than player highest wave */
export function dungeonEnemyHp(highestWave: number, dungeonId: string, dungeonWave: number): number {
  let equivalentWave = 20 + dungeonWave * 3;
  let mult = 1.0;
  if (dungeonId === 'lich_crypt') {
    equivalentWave = 60 + dungeonWave * 5;
    mult = 2.5;
  } else if (dungeonId === 'dragon_hoard') {
    equivalentWave = 130 + dungeonWave * 9;
    mult = 8.0;
  }
  return Math.floor(enemyHpForWave(equivalentWave, mult * 5));
}

/** Dungeon enemy damage scales statically based on dungeon tier */
export function dungeonEnemyDamage(highestWave: number, dungeonId: string, dungeonWave: number): number {
  let equivalentWave = 20 + dungeonWave * 3;
  let mult = 1.0;
  if (dungeonId === 'lich_crypt') {
    equivalentWave = 60 + dungeonWave * 5;
    mult = 2.5;
  } else if (dungeonId === 'dragon_hoard') {
    equivalentWave = 130 + dungeonWave * 9;
    mult = 8.0;
  }
  return Math.floor(enemyDamageForWave(equivalentWave) * mult * 2);
}

// ============================================================
// ITEM SCALING
// ============================================================

/** Base item stat (damage or defense) for a given material tier index */
export function itemBaseStat(baseValue: number, tierIndex: number): number {
  return Math.floor(baseValue * Math.pow(1.4, tierIndex));
}

/** Item cost for a given material tier index */
export function itemBaseCost(baseValue: number, tierIndex: number): number {
  return Math.floor(baseValue * Math.pow(1.7, tierIndex));
}

/** Level multiplier for item upgrades */
export function itemLevelMultiplier(level: number): number {
  return Math.pow(1.1, level - 1);
}

/** Star level multiplier (20% per star) */
export function itemStarMultiplier(starLevel: number): number {
  return 1 + (starLevel * 0.2);
}

/** Cost to upgrade item level */
export function itemUpgradeCostGold(currentLevel: number): number {
  return Math.floor(1000 * Math.pow(1.5, currentLevel));
}

export function itemUpgradeCostDust(currentLevel: number): number {
  return Math.floor(50 * Math.pow(1.5, currentLevel));
}

/** Cost to evolve (add star) */
export function itemEvolveCostDust(currentStarLevel: number): number {
  return 1000 * (currentStarLevel + 1);
}

export function itemEvolveCostGems(currentStarLevel: number): number {
  return 10 * (currentStarLevel + 1);
}

/** Cost to refine quality */
export function itemRefineCostGold(tier: number): number {
  return tier * 5000;
}

export function itemRefineCostDust(tier: number): number {
  return tier * 100;
}

/** Cost to enchant */
export function itemEnchantCostGold(tier: number): number {
  return 5000 * tier;
}

export function itemEnchantCostDust(tier: number): number {
  return 200 * tier;
}

// ============================================================
// WORKER SCALING
// ============================================================

/** Worker cost with diminishing returns */
export function workerCost(baseCost: number, owned: number, costReduction: number = 0): number {
  const reduction = Math.max(0, Math.min(0.9, costReduction)); // Cap at 90% reduction
  return Math.floor(baseCost * Math.pow(1.15, owned) * (1 - reduction));
}

// ============================================================
// UPGRADE SCALING
// ============================================================

/** Generic upgrade cost */
export function upgradeCost(baseCost: number, costMultiplier: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(costMultiplier, currentLevel));
}

// ============================================================
// REBIRTH / PRESTIGE SCALING
// ============================================================

/** Gold required to rebirth */
export function rebirthCost(rebirthCount: number): number {
  return 1000000 * Math.pow(5, rebirthCount);
}

/** Rebirth points earned based on highest wave and total rebirths */
export function rebirthPointsEarned(highestWave: number, rebirths: number = 0): number {
  return Math.floor(highestWave / 10 + Math.pow(highestWave / 40, 2)) * (1 + rebirths * 0.2);
}

/** Damage multiplier from rebirths */
export function rebirthDamageMultiplier(rebirths: number): number {
  return 1 + (rebirths * 0.5);
}

/** Gold multiplier from rebirths */
export function rebirthGoldMultiplier(rebirths: number): number {
  return 1 + (rebirths * 0.1);
}

/** Luck bonus from rebirths */
export function rebirthLuckBonus(rebirths: number): number {
  return rebirths * 0.05;
}

// ============================================================
// XP & LEVEL SCALING
// ============================================================

/** XP required for a given level */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

/** XP gained from killing an enemy at a given wave */
export function xpFromKill(wave: number): number {
  return Math.floor(5 + wave * 0.5);
}

/** Skill points awarded per level up */
export function skillPointsPerLevel(level: number): number {
  // 1 SP per level, bonus every 10 levels
  return level % 10 === 0 ? 3 : 1;
}

// ============================================================
// RUNE SCALING
// ============================================================

/** Rune stat value at a given level */
export function runeStatValue(baseValue: number, level: number): number {
  return baseValue * level;
}

/** Cost to forge a rune (scales with target level) */
export function runeForgeMultiplier(level: number): number {
  return Math.pow(2, level - 1);
}

// ============================================================
// OVERDRIVE SCALING
// ============================================================

/** Destruction chance for overdrive refining */
export function overdriveDestructionChance(qualityValue: number): number {
  const excess = qualityValue - 100;
  return 0.05 + (Math.floor(excess / 10) * 0.01);
}

/** Sacrifice risk reduction */
export function sacrificeRiskReduction(
  sacrificeTier: number,
  targetTier: number,
  sacrificeQualityValue: number
): number {
  const tierRatio = sacrificeTier / targetTier;
  const qualityMod = sacrificeQualityValue / 100;
  return 0.01 * tierRatio * (1 + qualityMod);
}

// ============================================================
// OFFLINE PROGRESS
// ============================================================

/** Offline progress efficiency (0.1 = 10% of active DPS as gold) */
export const OFFLINE_BASE_EFFICIENCY = 0.1;

/** Max offline hours (base) */
export const OFFLINE_BASE_MAX_HOURS = 4;

/** Max offline hours with upgrades */
export function offlineMaxHours(upgradeLevel: number): number {
  return OFFLINE_BASE_MAX_HOURS + upgradeLevel;
}

// ============================================================
// CHEST SCALING
// ============================================================

/** Max chest tier based on wave */
export function maxChestTierForWave(wave: number): number {
  if (wave >= 300) return 2; // Cosmic
  if (wave >= 100) return 1; // Royal
  return 0; // Standard
}

/** Wave cap on item tier from chests (balanced to / 5 + 2) */
export function maxItemTierForWave(highestWave: number, totalMaterials: number): number {
  return Math.min(Math.floor(highestWave / 5) + 2, totalMaterials - 1);
}

/** Dynamic chest cost scaling with wave progression */
export function getChestCost(chestId: string, highestWave: number): number {
  const baseCosts: Record<string, number> = {
    standard_chest: 1000,
    royal_chest: 100000,
    cosmic_chest: 10000000,
  };
  const base = baseCosts[chestId] || 1000;
  return Math.floor(base * Math.pow(1.06, highestWave - 1));
}

/** Chest unlock countdown durations in seconds */
export function getChestUnlockDuration(chestId: string, upgradeLevel: number = 0): number {
  let base = 15;
  if (chestId === 'royal_chest') base = 60;
  if (chestId === 'cosmic_chest') base = 300;

  const reduction = upgradeLevel * 0.1; // 10% per level
  const multiplier = Math.max(0.1, 1 - reduction); // cap at 90% reduction
  return Math.ceil(base * multiplier);
}

// ============================================================
// WAVE PROGRESSION
// ============================================================

/** Enemies per wave (5 normally, 1 for boss waves) */
export function enemiesPerWave(wave: number): number {
  return wave % 5 === 0 ? 1 : 5;
}

/** Whether a wave is a boss gate (requires key) */
export function isBossGateWave(wave: number): boolean {
  return wave % 50 === 0;
}

/** Modifier spawn chance */
export const MODIFIER_CHANCE = 0.3;
