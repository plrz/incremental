/**
 * Zikki Incremental — Research Lab Engine
 * 
 * Pure functions for tech queueing and passive bonuses.
 */

import type { GameState } from './gameState';
import { RESEARCH_TECHS } from '@/lib/gameConfig';

/** Get research node cost */
export function getResearchCost(techId: string, currentLevel: number): number {
  const tech = RESEARCH_TECHS.find(t => t.id === techId);
  if (!tech) return 0;
  return Math.floor(tech.baseCost * Math.pow(tech.costMult, currentLevel));
}

/** Get research duration in seconds */
export function getResearchDuration(techId: string, currentLevel: number): number {
  return (currentLevel + 1) * 30; // 30s per level
}

/** Start a research node */
export function startResearch(state: GameState, techId: string): GameState {
  if (state.research.activeResearchId) return state; // Only one active

  const tech = RESEARCH_TECHS.find(t => t.id === techId);
  if (!tech) return state;

  const currentLevel = state.research.nodes[techId] || 0;
  if (currentLevel >= tech.maxLevel) return state;

  const cost = getResearchCost(techId, currentLevel);
  if (state.resources.researchPoints < cost) return state;

  const durationSec = getResearchDuration(techId, currentLevel);
  const activeResearchEnd = Date.now() + (durationSec * 1000);

  return {
    ...state,
    resources: {
      ...state.resources,
      researchPoints: state.resources.researchPoints - cost,
    },
    research: {
      ...state.research,
      activeResearchId: techId,
      activeResearchEnd,
    },
  };
}

/** Cancel active research (refunds cost) */
export function cancelResearch(state: GameState): GameState {
  const techId = state.research.activeResearchId;
  if (!techId) return state;

  const currentLevel = state.research.nodes[techId] || 0;
  const cost = getResearchCost(techId, currentLevel);

  return {
    ...state,
    resources: {
      ...state.resources,
      researchPoints: state.resources.researchPoints + cost,
    },
    research: {
      ...state.research,
      activeResearchId: null,
      activeResearchEnd: null,
    },
  };
}

/** Tick research queue */
export function tickResearch(state: GameState): { state: GameState; completedTechId: string | null } {
  const techId = state.research.activeResearchId;
  const endTime = state.research.activeResearchEnd;
  if (!techId || !endTime) return { state, completedTechId: null };

  if (Date.now() >= endTime) {
    const currentLevel = state.research.nodes[techId] || 0;
    return {
      state: {
        ...state,
        research: {
          ...state.research,
          nodes: {
            ...state.research.nodes,
            [techId]: currentLevel + 1,
          },
          activeResearchId: null,
          activeResearchEnd: null,
        },
      },
      completedTechId: techId,
    };
  }

  return { state, completedTechId: null };
}

/** Get research multiplier */
export function getResearchMultiplier(state: GameState, techId: string, valuePerLevel: number): number {
  const level = state.research.nodes[techId] || 0;
  return 1 + (level * valuePerLevel);
}
