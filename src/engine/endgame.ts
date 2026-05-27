/**
 * Zikki Incremental — Endgame Systems Engine (Dungeons, Time Rifts, World Bosses, Corruption)
 * 
 * Pure functions for late-game loops.
 */

import type { GameState, ActiveDungeon, WorldBossState } from './gameState';
import { DUNGEONS, WORLD_BOSSES } from '@/lib/gameConfig';
import { createPetEgg } from './pets';
import { dungeonEnemyHp, worldBossHp } from './scaling';

// ============================================================
// DUNGEONS
// ============================================================

export function startDungeon(state: GameState, dungeonId: string): GameState {
  if (state.activeDungeon) return state;

  const dun = DUNGEONS.find(d => d.id === dungeonId);
  if (!dun) return state;
  if (state.stats.ascensions < dun.reqAscension) return state;
  if (state.resources.dungeonKeys < dun.keyCost) return state;

  const activeDungeon: ActiveDungeon = {
    dungeonId,
    name: dun.name,
    timeLeft: dun.timeLimit,
    wave: 1,
    kills: 0,
    modifiers: [...dun.modifiers],
  };

  return {
    ...state,
    resources: {
      ...state.resources,
      dungeonKeys: state.resources.dungeonKeys - dun.keyCost,
    },
    activeDungeon,
    // Reset temporary HP/combat stats for the dungeon
    combat: {
      ...state.combat,
      currentEnemyHp: dungeonEnemyHp(state.stats.highestWave, dungeonId, activeDungeon.wave),
      currentEnemyMaxHp: dungeonEnemyHp(state.stats.highestWave, dungeonId, activeDungeon.wave),
      enemiesDefeated: 0,
    },
  };
}

/** Process dungeon time ticks and kills */
export function tickDungeon(state: GameState, seconds: number): { state: GameState; event: string | null } {
  const ad = state.activeDungeon;
  if (!ad) return { state, event: null };

  const timeLeft = Math.max(0, ad.timeLeft - seconds);
  if (timeLeft <= 0) {
    // FAILED - exit dungeon
    return {
      state: {
        ...state,
        activeDungeon: null,
      },
      event: 'DUNGEON_FAILED',
    };
  }

  const updatedDungeon = { ...ad, timeLeft };

  // If wave reaches 10, dungeon is COMPLETED!
  if (ad.wave >= 10 && state.combat.enemiesDefeated >= 5) {
    // Earn rewards: Purity Orbs, Time Crystals, or Pet Eggs
    let purityOrbsEarned = 1;
    let crystalsEarned = 2;
    let eggs = [...state.pets.eggs];

    if (ad.dungeonId === 'dragon_hoard') {
      purityOrbsEarned = 3;
      crystalsEarned = 5;
      eggs.push(createPetEgg('dungeon'));
    } else if (ad.dungeonId === 'lich_crypt') {
      purityOrbsEarned = 2;
      crystalsEarned = 3;
      eggs.push(createPetEgg('rare'));
    } else {
      eggs.push(createPetEgg('standard'));
    }

    return {
      state: {
        ...state,
        resources: {
          ...state.resources,
          purityOrbs: state.resources.purityOrbs + purityOrbsEarned,
          timeCrystals: state.resources.timeCrystals + crystalsEarned,
        },
        pets: {
          ...state.pets,
          eggs,
        },
        activeDungeon: null,
      },
      event: 'DUNGEON_SUCCESS',
    };
  }

  return {
    state: {
      ...state,
      activeDungeon: updatedDungeon,
    },
    event: null,
  };
}

// ============================================================
// TIME RIFTS
// ============================================================

export function startTimeRift(state: GameState, riftType: 'minor' | 'major' | 'storm'): GameState {
  if (state.timeRiftActive) return state;

  const costs = { minor: 5, major: 20, storm: 100 };
  const durations = { minor: 30 * 60, major: 15 * 60, storm: 10 * 60 }; // in seconds

  const cost = costs[riftType];
  if (state.resources.timeCrystals < cost) return state;

  const durationMs = durations[riftType] * 1000;

  return {
    ...state,
    resources: {
      ...state.resources,
      timeCrystals: state.resources.timeCrystals - cost,
    },
    timeRiftActive: {
      type: riftType,
      endTimestamp: Date.now() + durationMs,
    },
  };
}

export function getTimeRiftMultiplier(state: GameState): number {
  const tr = state.timeRiftActive;
  if (!tr) return 1.0;

  if (Date.now() >= tr.endTimestamp) {
    return 1.0; // Expired
  }

  // Multiplier: minor = 2x, major = 5x, storm = 10x
  if (tr.type === 'minor') return 2.0;
  if (tr.type === 'major') return 5.0;
  return 10.0;
}

// ============================================================
// WORLD BOSSES
// ============================================================

export function summonWorldBoss(state: GameState, bossId: string): GameState {
  if (state.worldBoss) return state;

  const boss = WORLD_BOSSES.find(b => b.id === bossId);
  if (!boss) return state;

  const hp = worldBossHp(state.combat.currentWave, boss.hpMultiplier);

  const worldBoss: WorldBossState = {
    active: true,
    bossId,
    name: boss.name,
    hp,
    maxHp: hp,
    timeLimit: boss.timeLimit,
    elapsed: 0,
  };

  return {
    ...state,
    worldBoss,
  };
}

export function tickWorldBoss(state: GameState, seconds: number): { state: GameState; event: string | null } {
  const wb = state.worldBoss;
  if (!wb) return { state, event: null };

  const elapsed = wb.elapsed + seconds;
  if (elapsed >= wb.timeLimit) {
    // Time out - failed
    return {
      state: {
        ...state,
        worldBoss: null,
      },
      event: 'WORLD_BOSS_FAILED',
    };
  }

  // Handle boss defeat
  if (wb.hp <= 0) {
    // Reward: Purity Orbs, Gems, and Dust
    return {
      state: {
        ...state,
        resources: {
          ...state.resources,
          purityOrbs: state.resources.purityOrbs + 5,
          gems: state.resources.gems + 150,
          dust: state.resources.dust + 2000,
        },
        worldBoss: null,
      },
      event: 'WORLD_BOSS_SUCCESS',
    };
  }

  return {
    state: {
      ...state,
      worldBoss: {
        ...wb,
        elapsed,
      },
    },
    event: null,
  };
}

// ============================================================
// CORRUPTION & PURITY
// ============================================================

export function cleanseCorruption(state: GameState): GameState {
  if (state.resources.purityOrbs < 1) return state;

  return {
    ...state,
    resources: {
      ...state.resources,
      purityOrbs: state.resources.purityOrbs - 1,
    },
    corruption: Math.max(0, state.corruption - 25),
  };
}
