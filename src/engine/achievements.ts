/**
 * Zikki Incremental — Achievement & Title Engine
 */

import type { GameState } from './gameState';
import { ACHIEVEMENTS, TITLES, type AchievementDef, type TitleDef } from '@/lib/gameConfig';

/** Check for newly earned achievements and apply rewards */
export function checkAchievements(state: GameState): {
  state: GameState;
  newAchievements: string[];
} {
  const newAchievements: string[] = [];
  let resources = { ...state.resources };
  let stats = { ...state.stats };
  const achieved = new Set(state.achievements);

  ACHIEVEMENTS.forEach(ach => {
    if (achieved.has(ach.id)) return;

    let earned = false;
    const val = ach.condition.value;

    switch (ach.condition.type) {
      case 'highestWave': earned = stats.highestWave >= val; break;
      case 'totalKills': earned = stats.totalKills >= val; break;
      case 'totalClicks': earned = stats.totalClicks >= val; break;
      case 'totalGold': earned = stats.totalGold >= val; break;
      case 'totalRunesForged': earned = stats.totalRunesForged >= val; break;
      case 'totalItemsCrafted': earned = stats.totalItemsCrafted >= val; break;
      case 'playerLevel': earned = stats.playerLevel >= val; break;
      case 'rebirths': earned = stats.rebirths >= val; break;
    }

    if (earned) {
      achieved.add(ach.id);
      newAchievements.push(ach.id);

      // Grant reward
      switch (ach.reward.type) {
        case 'gold':
          resources.gold += ach.reward.value;
          stats.totalGold += ach.reward.value;
          break;
        case 'gems': resources.gems += ach.reward.value; break;
        case 'dust': resources.dust += ach.reward.value; break;
        case 'bossKey': resources.bossKeys += ach.reward.value; break;
        case 'skillPoints': resources.skillPoints += ach.reward.value; break;
      }
    }
  });

  return {
    state: {
      ...state,
      achievements: Array.from(achieved),
      resources,
      stats,
    },
    newAchievements,
  };
}

/** Check for newly unlocked titles */
export function checkTitles(state: GameState): string[] | null {
  const unlocked = new Set(state.titles.unlocked);
  let changed = false;

  TITLES.forEach(t => {
    if (unlocked.has(t.id)) return;

    let earned = false;
    switch (t.req.type) {
      case 'wave': earned = state.stats.highestWave >= t.req.value; break;
      case 'kills': earned = state.stats.totalKills >= t.req.value; break;
      case 'gold': earned = state.stats.totalGold >= t.req.value; break;
      case 'items': earned = state.inventory.items.length >= t.req.value; break;
      case 'runesForged': earned = state.stats.totalRunesForged >= t.req.value; break;
      case 'itemsCrafted': earned = state.stats.totalItemsCrafted >= t.req.value; break;
    }

    if (earned) {
      unlocked.add(t.id);
      changed = true;
    }
  });

  return changed ? Array.from(unlocked) : null;
}
