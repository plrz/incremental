/**
 * Zikki Incremental — Combat Engine
 * 
 * Handles enemy stats, combat tick processing, and skill activation.
 * Pure functions — no React, no side effects.
 */

import type { GameState, CombatState, Item } from './gameState';
import {
  ENEMIES, ENEMY_MODIFIERS, ELEMENTS, DROPS,
  CHESTS, CHEST_DROP_CHANCE, MATERIALS,
  type EnemyDef,
} from '@/lib/gameConfig';
import {
  enemyHpForWave, enemyGoldForWave, enemyDamageForWave,
  bossHpForWave, enemiesPerWave, isBossGateWave,
  MODIFIER_CHANCE,
} from './scaling';
import { calculateClickDamage, calculateDPS, calculateMaxHp, getPlayerElement, getElementalMultiplier } from './items';

// ============================================================
// ENEMY STAT GENERATION
// ============================================================

export interface EnemyStats {
  name: string;
  emoji: string;
  maxHp: number;
  gold: number;
  damage: number;
  color: string;
  element: string;
  modifier: string | null;
}

/** Get enemy stats for a specific wave and position */
export function getEnemyStats(wave: number, enemyNum: number, modifier: string | null, isBossGateFarming = false): EnemyStats {
  const isBoss = wave % 5 === 0 && !isBossGateFarming;
  let enemyBase: EnemyDef;

  if (isBoss) {
    enemyBase = ENEMIES[ENEMIES.length - 1];
  } else {
    const index = (wave + enemyNum) % (ENEMIES.length - 1);
    enemyBase = ENEMIES[index];
  }

  let maxHp = enemyHpForWave(wave, enemyBase.hpMult);
  let gold = enemyGoldForWave(wave, enemyBase.goldMult);
  let damage = enemyDamageForWave(wave);
  let name = enemyBase.name;
  let emoji = enemyBase.emoji;
  let color = '';

  // Named bosses
  if (isBoss) {
    if (wave === 5) { name = "Goblin King"; emoji = "👑"; color = "#22c55e"; }
    else if (wave === 10) { name = "Orc Warlord"; emoji = "🪓"; color = "#b91c1c"; }
    else if (wave === 20) { name = "Dark Knight"; emoji = "🛡️"; color = "#9ca3af"; }
    else if (wave === 50) { name = "Dragon"; emoji = "🐉"; color = "#ea580c"; }
    else if (wave === 100) { name = "Void Lord"; emoji = "💀"; color = "#9333ea"; }
  }

  // Apply modifier
  if (modifier) {
    const mod = ENEMY_MODIFIERS.find(m => m.id === modifier);
    if (mod) {
      maxHp *= mod.statMod.hp || 1;
      damage *= mod.statMod.dmg || 1;
      gold *= mod.statMod.gold || 1;
      name = `${mod.prefix} ${name}`;
      color = mod.color;
      emoji = mod.emoji;
    }
  }

  // Random element for the wave
  const elementIndex = wave % ELEMENTS.length;
  const element = ELEMENTS[elementIndex].id;

  return {
    name,
    emoji,
    maxHp: Math.floor(maxHp),
    gold: Math.floor(gold),
    damage: Math.floor(damage),
    color,
    element,
    modifier,
  };
}

/** Roll a random modifier (or null) for a new enemy */
export function rollModifier(): string | null {
  if (Math.random() < MODIFIER_CHANCE) {
    const mod = ENEMY_MODIFIERS[Math.floor(Math.random() * ENEMY_MODIFIERS.length)];
    return mod.id;
  }
  return null;
}

// ============================================================
// COMBAT PROCESSING
// ============================================================

export interface CombatTickResult {
  state: GameState;
  events: { type: string; data: Record<string, unknown> }[];
}

/** Process one combat tick (called every 100ms) */
export function processCombatTick(state: GameState): CombatTickResult {
  const events: { type: string; data: Record<string, unknown> }[] = [];
  const now = Date.now();

  let combat = { ...state.combat };
  let resources = { ...state.resources };
  let stats = { ...state.stats };
  let inventory = { ...state.inventory, items: [...state.inventory.items] };
  let quests = { ...state.quests, active: [...state.quests.active] };
  let activeDungeon = state.activeDungeon ? { ...state.activeDungeon } : null;
  let worldBoss = state.worldBoss ? { ...state.worldBoss } : null;
  let corruption = state.corruption;
  let activePotions = { ...state.activePotions };

  // Update time played
  stats.timePlayed = (stats.timePlayed || 0) + 0.1;

  // Repair stuck boss gate states (e.g. wave 49 with 5/5 or 6/5 enemies defeated)
  const enemiesNeededCurrent = enemiesPerWave(combat.currentWave);
  if (combat.enemiesDefeated >= enemiesNeededCurrent && isBossGateWave(combat.currentWave + 1)) {
    combat.currentWave = combat.currentWave + 1;
    combat.enemiesDefeated = 0;
    combat.isBossGate = true;
  }

  // Boss Gate no longer skips combat, allowing players to farm keys and gold


  // Calculate tick DPS
  const dps = calculateDPS(state);
  const tickDps = dps / 10; // 100ms tick

  // Apply DPS to enemy/boss
  if (worldBoss) {
    worldBoss.hp = Math.max(0, worldBoss.hp - tickDps);
    combat.currentEnemyHp = worldBoss.hp;
  } else {
    combat.currentEnemyHp -= tickDps;
  }

  // Enemy is still alive — they attack player
  if (combat.currentEnemyHp > 0) {
    let damage = 0;
    if (activeDungeon) {
      // Dungeon enemy damage: 5 * wave
      damage = 5 * activeDungeon.wave;
    } else if (worldBoss) {
      // World boss damage: 20 * currentWave
      damage = 20 * combat.currentWave;
    } else {
      const enemyStats = getEnemyStats(combat.currentWave, combat.enemiesDefeated, combat.currentModifier, combat.isBossGate && !combat.bossFightActive);
      damage = enemyStats.damage;
    }

    // Apply corruption multiplier (+1% per corruption)
    const corruptionMultiplier = 1 + (corruption * 0.01);
    combat.playerHp -= ((damage * corruptionMultiplier) / 10);

    // Player death
    if (combat.playerHp <= 0) {
      if (activeDungeon) {
        activeDungeon = null;
        events.push({ type: 'boss_failed', data: {} }); // reuse fail effect
        combat.playerHp = calculateMaxHp(state);
        const enemy = getEnemyStats(combat.currentWave, 0, null);
        combat.currentEnemyHp = enemy.maxHp;
        combat.currentEnemyMaxHp = enemy.maxHp;
        combat.currentEnemyElement = enemy.element;
      } else if (worldBoss) {
        worldBoss = null;
        events.push({ type: 'boss_failed', data: {} });
        combat.playerHp = calculateMaxHp(state);
        const enemy = getEnemyStats(combat.currentWave, 0, null);
        combat.currentEnemyHp = enemy.maxHp;
        combat.currentEnemyMaxHp = enemy.maxHp;
        combat.currentEnemyElement = enemy.element;
      } else {
        if (combat.bossFightActive) {
          combat.bossFightActive = false;
          events.push({ type: 'boss_failed', data: {} });
        }

        combat.currentWave = Math.max(1, combat.currentWave - 1);
        combat.enemiesDefeated = 0;
        combat.isBossGate = isBossGateWave(combat.currentWave);
        const prevEnemy = getEnemyStats(combat.currentWave, 0, null, combat.isBossGate && !combat.bossFightActive);
        const corruptionMultiplierInner = 1 + (corruption * 0.01);
        combat.currentEnemyMaxHp = Math.floor(prevEnemy.maxHp * corruptionMultiplierInner);
        combat.currentEnemyHp = Math.floor(prevEnemy.maxHp * corruptionMultiplierInner);
        combat.currentEnemyElement = prevEnemy.element;
        combat.playerHp = calculateMaxHp(state);
        combat.currentModifier = null;
      }
    }
  } else {
    // Enemy defeated!

    if (activeDungeon) {
      // Dungeon enemy defeated
      combat.enemiesDefeated += 1;
      
      if (combat.enemiesDefeated >= 5) {
        if (activeDungeon.wave < 10) {
          activeDungeon.wave += 1;
          combat.enemiesDefeated = 0;
        }
      }

      // Spawn next dungeon enemy
      if (activeDungeon.wave <= 10) {
        combat.currentEnemyMaxHp = 50 * activeDungeon.wave;
        combat.currentEnemyHp = 50 * activeDungeon.wave;
      }

      return {
        state: { ...state, combat, stats, inventory, quests, activeDungeon, worldBoss },
        events,
      };
    }

    if (worldBoss) {
      // World boss defeated! (tickWorldBoss handles success rewards on next tick)
      return {
        state: { ...state, combat, stats, inventory, quests, activeDungeon, worldBoss },
        events,
      };
    }

    // Boss fight victory
    if (combat.bossFightActive) {
      combat.bossFightActive = false;

      const gemReward = Math.floor(combat.currentWave * 2);
      const dustReward = Math.floor(combat.currentWave * 50);
      resources.gems += gemReward;
      resources.dust += dustReward;

      events.push({
        type: 'boss_defeated',
        data: { gems: gemReward, dust: dustReward, wave: combat.currentWave },
      });

      // Guaranteed chest drop
      let chestIndex = 0;
      if (combat.currentWave >= 300) chestIndex = 2;
      else if (combat.currentWave >= 100) chestIndex = 1;

      const bossChest = CHESTS[chestIndex];
      if (bossChest && inventory.items.length < 200) {
        const chestItem: Item = {
          id: crypto.randomUUID(),
          instanceId: crypto.randomUUID(),
          type: 'consumable',
          itemId: bossChest.id,
          quality: 'divine',
          qualityValue: 0,
          isOverdrive: false,
          level: 1,
          starLevel: 0,
          enchants: [],
          tier: chestIndex,
          runes: [],
        };
        inventory.items.push(chestItem);
        events.push({ type: 'chest_drop', data: { chestName: bossChest.name } });
      }

      // Reset to normal combat but increment wave!
      combat.currentWave = combat.currentWave + 1;
      combat.enemiesDefeated = 0;
      if (combat.currentWave > stats.highestWave) {
        stats.highestWave = combat.currentWave;
      }

      const nextEnemy = getEnemyStats(combat.currentWave, combat.enemiesDefeated, null);
      const corruptionMultiplierInner = 1 + (corruption * 0.01);
      combat.currentEnemyMaxHp = Math.floor(nextEnemy.maxHp * corruptionMultiplierInner);
      combat.currentEnemyHp = Math.floor(nextEnemy.maxHp * corruptionMultiplierInner);
      combat.currentEnemyElement = nextEnemy.element;
      combat.currentModifier = null;

      return {
        state: { ...state, combat, resources, stats, inventory, quests, activeDungeon, worldBoss },
        events,
      };
    }

    // Normal enemy killed
    stats.totalKills = (stats.totalKills || 0) + 1;
    const enemyStats = getEnemyStats(combat.currentWave, combat.enemiesDefeated, combat.currentModifier, combat.isBossGate && !combat.bossFightActive);

    // Gold gain
    let goldGained = enemyStats.gold;
    goldGained *= (1 + (state.upgrades.goldMultiplier || 0) * 0.10); // Bounty Hunter upgrade
    goldGained *= (1 + (stats.rebirths * 0.1)); // Rebirth gold bonus
    
    // Reduce by corruption / 2%
    goldGained *= (1 - (corruption * 0.005));

    // Skill tree gold bonus
    const economics = state.skillTree.nodes['c_economics'] || 0;
    goldGained *= 1 + (economics * 0.05);

    // Midas Touch active skill (10x gold, expires on next kill)
    if (activePotions['midas_touch'] && activePotions['midas_touch'] > now) {
      goldGained *= 10;
      delete activePotions['midas_touch'];
    }

    // Midas enchant
    const weapon = state.inventory.items.find(i => i.instanceId === state.inventory.equipped.hand);
    if (weapon?.enchants.includes('midas')) {
      goldGained += enemyStats.gold * 0.2;
    }

    resources.gold += goldGained;
    stats.totalGold = (stats.totalGold || 0) + goldGained;

    // XP gain
    const xpGain = Math.floor(5 + combat.currentWave * 0.5);
    const finalXpGain = Math.floor(xpGain * (1 + (state.upgrades.xpMultiplier || 0) * 0.15)); // Scholar upgrade
    stats.playerXp += finalXpGain;

    // Level up check
    while (stats.playerXp >= stats.playerXpToNext) {
      stats.playerXp -= stats.playerXpToNext;
      stats.playerLevel += 1;
      stats.playerXpToNext = Math.floor(100 * Math.pow(1.15, stats.playerLevel - 1));

      // Award skill points
      const sp = stats.playerLevel % 10 === 0 ? 3 : 1;
      resources.skillPoints += sp;

      events.push({
        type: 'level_up',
        data: { level: stats.playerLevel, skillPoints: sp },
      });
    }

    // Drops
    const dropMultiplier = 1 + (corruption * 0.01);
    DROPS.forEach(drop => {
      let chance = drop.chance;
      if (drop.id === 'boss_key') {
        chance *= (1 + (state.upgrades.bossKeyChance || 0) * 0.20);
      }
      if (drop.id === 'gem') {
        chance *= (1 + (state.upgrades.gemDropChance || 0) * 0.10);
      }
      if (Math.random() < chance) {
        if (drop.id === 'gem') resources.gems += Math.floor(drop.value * dropMultiplier);
        if (drop.id === 'dust') resources.dust += Math.floor(drop.value * dropMultiplier);
        if (drop.id === 'boss_key') resources.bossKeys += drop.value;
        if (drop.id === 'gold_bag') {
          const bagGold = drop.value * enemyStats.gold * (1 + (stats.rebirths * 0.1)) * (1 - (corruption * 0.005));
          resources.gold += bagGold;
          stats.totalGold += bagGold;
        }
      }
    });

    // Chest drops
    const scavengerLevel = state.upgrades.chestDropChance || 0;
    const totalChestChance = CHEST_DROP_CHANCE + (scavengerLevel * 0.01);

    if (Math.random() < totalChestChance) {
      let maxChestIndex = 0;
      if (combat.currentWave >= 300) maxChestIndex = 2;
      else if (combat.currentWave >= 100) maxChestIndex = 1;

      let chestIndex = Math.floor(Math.random() * (maxChestIndex + 1));

      // Lucky drop
      if (Math.random() < 0.05 && maxChestIndex < CHESTS.length - 1) {
        chestIndex = maxChestIndex + 1;
      }
      chestIndex = Math.min(chestIndex, CHESTS.length - 1);

      const chest = CHESTS[chestIndex];
      if (chest && inventory.items.length < 200) {
        const chestItem: Item = {
          id: crypto.randomUUID(),
          instanceId: crypto.randomUUID(),
          type: 'consumable',
          itemId: chest.id,
          quality: 'common',
          qualityValue: 0,
          isOverdrive: false,
          level: 1,
          starLevel: 0,
          enchants: [],
          tier: chestIndex,
          runes: [],
        };
        inventory.items.push(chestItem);

        if (chestIndex >= 2) {
          events.push({ type: 'chest_drop', data: { chestName: chest.name } });
        }
      }
    }

    // Wave progression
    combat.enemiesDefeated += 1;
    const enemiesNeeded = enemiesPerWave(combat.currentWave);

    if (combat.enemiesDefeated >= enemiesNeeded) {
      if (combat.isBossGate) {
        // At Boss Gate, we keep farming normal enemies without advancing the wave!
        combat.enemiesDefeated = 0;
      } else {
        const nextWave = combat.currentWave + 1;

        // Increase corruption by 1% for every 50 waves cleared
        if (nextWave % 50 === 0) {
          corruption = Math.min(100, corruption + 1);
        }

        combat.currentWave = nextWave;
        combat.enemiesDefeated = 0;
        if (combat.currentWave > stats.highestWave) {
          stats.highestWave = combat.currentWave;
        }

        if (isBossGateWave(nextWave)) {
          combat.isBossGate = true;
        }
      }
    }

    // Spawn next enemy - even at Boss Gate, keep spawning normal mobs if the boss fight is not active
    if (!combat.isBossGate || !combat.bossFightActive) {
      combat.currentModifier = rollModifier();
      const nextEnemy = getEnemyStats(combat.currentWave, combat.enemiesDefeated, combat.currentModifier, combat.isBossGate && !combat.bossFightActive);
      const corruptionMultiplierInner = 1 + (corruption * 0.01);
      combat.currentEnemyMaxHp = Math.floor(nextEnemy.maxHp * corruptionMultiplierInner);
      combat.currentEnemyHp = Math.floor(nextEnemy.maxHp * corruptionMultiplierInner);
      combat.currentEnemyElement = nextEnemy.element;

      // Heal player slightly
      combat.playerHp = Math.min(
        calculateMaxHp(state),
        combat.playerHp + (calculateMaxHp(state) * 0.1)
      );
    }
  }

  // Gold interest
  const interestLevel = state.upgrades.goldInterest || 0;
  if (interestLevel > 0) {
    const interestRate = interestLevel * 0.001;
    const interestPerMinute = resources.gold * interestRate;
    const cappedInterest = Math.min(interestPerMinute, 10000);
    const interestPerTick = cappedInterest / 600;
    resources.gold += interestPerTick;
  }

  return {
    state: { ...state, combat, resources, stats, inventory, quests, activeDungeon, worldBoss, corruption, activePotions },
    events,
  };
}

/** Process a player click attack */
export function processClick(state: GameState): {
  state: GameState;
  damage: number;
  isCrit: boolean;
} {
  let dmg = calculateClickDamage(state);

  // Crit check
  const critLevel = state.upgrades.criticalStrike || 0;
  const critChance = critLevel * 0.02;
  const skillTreeCrit = state.skillTree.nodes['w_critMastery'] || 0;
  const totalCritChance = critChance + (skillTreeCrit * 0.03);

  const isCrit = Math.random() < totalCritChance;
  if (isCrit) {
    let critMult = 2;
    const brutalForce = state.skillTree.nodes['w_brutalForce'] || 0;
    critMult += brutalForce * 0.10;
    dmg *= critMult;
  }

  // Multi-strike check
  const multiStrike = state.skillTree.nodes['w_multiStrike'] || 0;
  if (multiStrike > 0 && Math.random() < multiStrike * 0.05) {
    dmg *= 2;
  }

  // Elemental multiplier
  const playerElement = getPlayerElement(state);
  const enemyElement = state.combat.currentEnemyElement;
  dmg *= getElementalMultiplier(playerElement, enemyElement);

  // Lifesteal
  let heal = 0;
  const weapon = state.inventory.items.find(i => i.instanceId === state.inventory.equipped.hand);
  if (weapon?.enchants.includes('vampire')) {
    heal = dmg * 0.05;
  }

  let activeDungeon = state.activeDungeon ? { ...state.activeDungeon } : null;
  let activeWorldBoss = state.worldBoss ? { ...state.worldBoss } : null;

  if (activeWorldBoss) {
    activeWorldBoss.hp = Math.max(0, activeWorldBoss.hp - dmg);
  }

  const newState = {
    ...state,
    combat: {
      ...state.combat,
      currentEnemyHp: activeWorldBoss ? activeWorldBoss.hp : (state.combat.currentEnemyHp - dmg),
      playerHp: Math.min(calculateMaxHp(state), state.combat.playerHp + heal),
    },
    stats: {
      ...state.stats,
      totalClicks: (state.stats.totalClicks || 0) + 1,
    },
    activeDungeon,
    worldBoss: activeWorldBoss,
  };

  return { state: newState, damage: dmg, isCrit };
}
