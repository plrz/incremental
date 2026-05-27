/**
 * Zikki Incremental — Ascension & Faction Prestige Engine
 * 
 * Pure functions for Ascension resetting, perk buying, and Factions.
 */

import type { GameState } from './gameState';
import { createFreshState } from './gameState';
import { ASCENSION_PERKS } from '@/lib/gameConfig';

/** Rebirth points threshold required to ascend */
export const ASCENSION_THRESHOLD = 50000;

/** Check if player can ascend */
export function canAscend(state: GameState): boolean {
  return state.resources.rebirthPoints >= ASCENSION_THRESHOLD;
}

/** Calculate how many Ascension Points will be earned */
export function calculateAscensionPointsEarned(state: GameState): number {
  if (state.resources.rebirthPoints < ASCENSION_THRESHOLD) return 0;
  return Math.floor(Math.sqrt(state.resources.rebirthPoints / ASCENSION_THRESHOLD));
}

/** Perform an Ascension reset */
export function performAscension(state: GameState): GameState {
  if (!canAscend(state)) return state;

  const apEarned = calculateAscensionPointsEarned(state);
  const nextAscensionCount = state.stats.ascensions + 1;

  // Create a fresh template state
  const fresh = createFreshState();

  // Retain meta progression
  return {
    ...fresh,
    resources: {
      ...fresh.resources,
      ascensionPoints: state.resources.ascensionPoints + apEarned,
      // Retain key milestone values if needed
    },
    stats: {
      ...fresh.stats,
      ascensions: nextAscensionCount,
      highestWave: state.stats.highestWave,
      totalKills: state.stats.totalKills,
      totalGold: state.stats.totalGold,
      totalClicks: state.stats.totalClicks,
      timePlayed: state.stats.timePlayed,
      totalItemsCrafted: state.stats.totalItemsCrafted,
      totalRunesForged: state.stats.totalRunesForged,
      factionRep: { ...state.stats.factionRep },
      elementalMastery: { ...state.stats.elementalMastery },
      elementalKills: { ...state.stats.elementalKills },
      playerLevel: 1,
      playerXp: 0,
      playerXpToNext: 100,
    },
    ascensionPerks: { ...state.ascensionPerks },
    faction: state.faction,
    pets: {
      active: [...state.pets.active],
      inventory: [...state.pets.inventory],
      eggs: [...state.pets.eggs],
    },
    research: {
      nodes: { ...state.research.nodes },
      activeResearchId: null,
      activeResearchEnd: null,
    },
    // Carry over blueprints
    crafting: {
      ...state.crafting,
    },
    settings: {
      ...state.settings,
    },
    titles: {
      ...state.titles,
    },
  };
}

/** Buy an ascension perk */
export function buyAscensionPerk(state: GameState, perkId: string): GameState | null {
  const perk = ASCENSION_PERKS.find(p => p.id === perkId);
  if (!perk) return null;

  const currentLevel = state.ascensionPerks[perkId] || 0;
  if (currentLevel >= perk.maxLevel) return null;

  const cost = perk.baseCost + (currentLevel * perk.costMult);
  if (state.resources.ascensionPoints < cost) return null;

  return {
    ...state,
    resources: {
      ...state.resources,
      ascensionPoints: state.resources.ascensionPoints - cost,
    },
    ascensionPerks: {
      ...state.ascensionPerks,
      [perkId]: currentLevel + 1,
    },
  };
}

/** Choose or swap faction */
export function selectFaction(state: GameState, factionId: string): GameState | null {
  if (state.stats.ascensions < 1) return null; // Unlocked at A1
  const allowed = ['blade', 'merchant', 'conclave'];
  if (!allowed.includes(factionId)) return null;

  return {
    ...state,
    faction: factionId,
  };
}
