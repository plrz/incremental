/**
 * Zikki Incremental — Progression Engine
 * 
 * Handles rebirth and offline progress calculations.
 */

import type { GameState } from './gameState';
import { INITIAL_STATE, createFreshState } from './gameState';
import { REBIRTH_UPGRADES } from '@/lib/gameConfig';
import { rebirthCost, rebirthPointsEarned, offlineMaxHours, OFFLINE_BASE_EFFICIENCY } from './scaling';
import { calculateDPS } from './items';
import { getEnemyStats } from './combat';

// ============================================================
// REBIRTH
// ============================================================

/** Check if rebirth is available */
export function canRebirth(state: GameState): boolean {
  const cost = rebirthCost(state.stats.rebirths);
  return state.resources.gold >= cost;
}

/** Perform a rebirth */
export function performRebirth(state: GameState): GameState {
  const cost = rebirthCost(state.stats.rebirths);
  if (state.resources.gold < cost) return state;

  const pointsEarned = rebirthPointsEarned(state.stats.highestWave);

  // Calculate starting conditions from rebirth upgrades
  const retainWaveLevel = state.rebirthUpgrades.retainWave || 0;
  const starterGoldLevel = state.rebirthUpgrades.starterGold || 0;

  const startWave = Math.max(1, Math.floor(
    state.stats.highestWave * (REBIRTH_UPGRADES.retainWave.effect(retainWaveLevel))
  ));
  const startGold = REBIRTH_UPGRADES.starterGold.effect(starterGoldLevel);

  const fresh = createFreshState();
  const startEnemy = getEnemyStats(startWave, 0, null);

  return {
    ...fresh,
    stats: {
      ...fresh.stats,
      rebirths: state.stats.rebirths + 1,
      ascensions: state.stats.ascensions,
      highestWave: Math.max(1, startWave),
      totalKills: state.stats.totalKills,
      totalGold: state.stats.totalGold,
      totalClicks: state.stats.totalClicks,
      timePlayed: state.stats.timePlayed,
      totalItemsCrafted: state.stats.totalItemsCrafted,
      totalRunesForged: state.stats.totalRunesForged,
      playerLevel: state.stats.playerLevel,
      playerXp: state.stats.playerXp,
      playerXpToNext: state.stats.playerXpToNext,
      lastSaveTime: Date.now(),
    },
    resources: {
      ...fresh.resources,
      gold: startGold,
      gems: state.resources.gems,
      dust: state.resources.dust,
      bossKeys: state.resources.bossKeys,
      rebirthPoints: (state.resources.rebirthPoints || 0) + pointsEarned,
      skillPoints: state.resources.skillPoints,
      researchPoints: state.resources.researchPoints,
    },
    achievements: state.achievements,
    titles: state.titles,
    rebirthUpgrades: state.rebirthUpgrades,
    skillTree: state.skillTree, // Skill tree persists through rebirth
    runes: state.runes,        // Runes persist through rebirth
    crafting: state.crafting,   // Blueprints persist
    combat: {
      ...fresh.combat,
      currentWave: Math.max(1, startWave),
      currentEnemyHp: startEnemy.maxHp,
      currentEnemyMaxHp: startEnemy.maxHp,
    },
    settings: state.settings,
  };
}

/** Buy a rebirth upgrade */
export function buyRebirthUpgrade(state: GameState, upgradeId: string): GameState | null {
  const upgrade = REBIRTH_UPGRADES[upgradeId as keyof typeof REBIRTH_UPGRADES];
  if (!upgrade) return null;

  const currentLevel = state.rebirthUpgrades[upgradeId] || 0;
  if (currentLevel >= upgrade.maxLevel) return null;

  const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
  if (state.resources.rebirthPoints < cost) return null;

  return {
    ...state,
    resources: {
      ...state.resources,
      rebirthPoints: state.resources.rebirthPoints - cost,
    },
    rebirthUpgrades: {
      ...state.rebirthUpgrades,
      [upgradeId]: currentLevel + 1,
    },
  };
}

// ============================================================
// OFFLINE PROGRESS
// ============================================================

/** Calculate offline earnings */
export function calculateOfflineProgress(state: GameState): {
  goldEarned: number;
  timePassed: number;
} {
  const now = Date.now();
  const lastSave = state.stats.lastSaveTime || now;
  const diffSeconds = (now - lastSave) / 1000;

  if (diffSeconds < 60) {
    return { goldEarned: 0, timePassed: 0 };
  }

  // Cap offline time
  const maxHours = offlineMaxHours(state.upgrades.offlineProgress || 0);
  const cappedSeconds = Math.min(diffSeconds, maxHours * 3600);

  // Calculate estimated gold
  const dps = calculateDPS(state);
  const efficiency = OFFLINE_BASE_EFFICIENCY;

  // Skill tree: Commander offline efficiency
  const offlineBonus = (state.skillTree.nodes['c_logistics'] || 0) * 0.10;
  const totalEfficiency = efficiency + offlineBonus;

  const goldEarned = dps * cappedSeconds * totalEfficiency;

  return {
    goldEarned,
    timePassed: cappedSeconds,
  };
}
