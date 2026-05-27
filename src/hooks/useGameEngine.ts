/**
 * Zikki Incremental — Main Game Engine Hook
 * 
 * Orchestrates the game loop, combining all engine modules.
 * This is the single source of truth for game state in React.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, GameEvent, Item } from '@/engine/gameState';
import { createFreshState } from '@/engine/gameState';
import { loadGame, saveGame, exportSave, importSave, wipeSave } from '@/lib/saveManager';
import { processCombatTick, processClick, getEnemyStats, rollModifier } from '@/engine/combat';
import { calculateClickDamage, calculateDPS, calculateMaxHp, generateItemFromChest, getScrapValue, getItemDef, getQualityDef, getQualityIndex } from '@/engine/items';
import { generateQuest, updateQuestProgress, claimCompletedQuests } from '@/engine/quests';
import { checkAchievements, checkTitles } from '@/engine/achievements';
import { calculateOfflineProgress, performRebirth, canRebirth, buyRebirthUpgrade } from '@/engine/progression';
import { purchaseNode, respecSkillTree, canPurchaseNode } from '@/engine/skillTree';
import { forgeRune, combineRunes, socketRune, unsocketRune, canForgeRune } from '@/engine/runes';
import { combineItems, transmuteMaterials, salvageItem, canTransmute } from '@/engine/crafting';
import { performAscension, buyAscensionPerk, selectFaction } from '@/engine/ascension';
import { hatchPetEgg, equipPet, unequipPet } from '@/engine/pets';
import { startResearch, cancelResearch } from '@/engine/research';
import { startDungeon, startTimeRift, summonWorldBoss, cleanseCorruption, getTimeRiftMultiplier } from '@/engine/endgame';
import { UPGRADES, SKILLS, CHESTS, POTIONS, WORKERS, QUALITIES, ENCHANTS, REBIRTH_UPGRADES } from '@/lib/gameConfig';
import { upgradeCost, workerCost, rebirthCost, itemUpgradeCostGold, itemUpgradeCostDust, itemRefineCostGold, itemRefineCostDust, itemEnchantCostGold, itemEnchantCostDust, itemEvolveCostDust, itemEvolveCostGems, overdriveDestructionChance, sacrificeRiskReduction, getChestCost, getChestUnlockDuration } from '@/engine/scaling';
import { formatNumber } from '@/lib/formatters';
import { sounds } from '@/lib/sound';

export interface EffectPopup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export type Tab = 'combat' | 'inventory' | 'army' | 'shop' | 'skills' | 'runes' | 'crafting' | 'quests' | 'ascension' | 'pets' | 'research' | 'endgame' | 'menu';

export function useGameEngine() {
  const [state, setState] = useState<GameState>(createFreshState());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('combat');
  const [effects, setEffects] = useState<EffectPopup[]>([]);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [chestReveal, setChestReveal] = useState<any>(null);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // ─── EFFECTS ───
  const addEffect = useCallback((x: number, y: number, text: string, color: string) => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev.slice(-20), { id, x, y, text, color }]);
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== id));
    }, 1200);
  }, []);

  // ─── LOAD GAME ───
  useEffect(() => {
    const load = async () => {
      const { state: loaded, source } = await loadGame();

      // Calculate offline progress
      const offline = calculateOfflineProgress(loaded);
      if (offline.goldEarned > 0) {
        loaded.resources.gold += offline.goldEarned;
        setOfflineEarnings(offline.goldEarned);
      }

      loaded.stats.lastSaveTime = Date.now();
      setState(loaded);
      setLoading(false);
    };
    load();
  }, []);

  // ─── AUTO-SAVE ───
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      saveGame(stateRef.current);
    }, 30000);
    return () => clearInterval(interval);
  }, [loading]);

  // ─── AUDIO MUSIC SYSTEM SYNC ───
  useEffect(() => {
    if (loading) return;
    sounds.setMusicEnabled(state.settings.musicEnabled);
    sounds.setMusicVolume(state.settings.musicVolume);
    return () => {
      sounds.setMusicEnabled(false);
    };
  }, [loading, state.settings.musicEnabled, state.settings.musicVolume]);

  // ─── GAME LOOP (100ms tick) ──
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      let killsHappened = false;
      setState(prev => {
        // Clear expired time rift
        let newState = prev;
        if (prev.timeRiftActive && Date.now() >= prev.timeRiftActive.endTimestamp) {
          newState = { ...prev, timeRiftActive: null };
        }

        // Parallel battle speed from Multiverse perk (A.P.) and Time Rift speedup
        const multiverseLevel = newState.ascensionPerks['multiverse'] || 0;
        const riftMult = getTimeRiftMultiplier(newState);
        const ticksCount = (1 + (multiverseLevel * 0.2)) * riftMult;
        
        let killDelta = 0;
        let goldDelta = 0;
        let clickDelta = 0;
        let tickEvents: any[] = [];

        // Perform standard combat ticks
        for (let i = 0; i < Math.floor(ticksCount); i++) {
          const stepCombat = processCombatTick(newState);
          const stepState = stepCombat.state;
          killDelta += (stepState.stats.totalKills || 0) - (newState.stats.totalKills || 0);
          goldDelta += stepState.resources.gold - newState.resources.gold;
          clickDelta += (stepState.stats.totalClicks || 0) - (newState.stats.totalClicks || 0);
          newState = stepState;
          tickEvents = [...tickEvents, ...stepCombat.events];
        }

        const fractional = ticksCount % 1;
        if (Math.random() < fractional) {
          const stepCombat = processCombatTick(newState);
          const stepState = stepCombat.state;
          killDelta += (stepState.stats.totalKills || 0) - (newState.stats.totalKills || 0);
          goldDelta += stepState.resources.gold - newState.resources.gold;
          clickDelta += (stepState.stats.totalClicks || 0) - (newState.stats.totalClicks || 0);
          newState = stepState;
          tickEvents = [...tickEvents, ...stepCombat.events];
        }

        if (killDelta > 0) {
          killsHappened = true;
        }

        // 2. Quest fill + progress
        if (newState.quests.active.length < 3) {
          const active = [...newState.quests.active];
          while (active.length < 3) {
            active.push(generateQuest(newState.combat.currentWave));
          }
          newState = { ...newState, quests: { ...newState.quests, active } };
        }

        const updatedQuests = updateQuestProgress(newState.quests.active, {
          kills: killDelta,
          gold: goldDelta,
          clicks: clickDelta,
          wave: newState.combat.currentWave,
        });
        newState = { ...newState, quests: { ...newState.quests, active: updatedQuests } };

        // 3. Auto-claim quests
        const questResult = claimCompletedQuests(newState);
        newState = questResult.state;

        // 4. Achievements
        const achResult = checkAchievements(newState);
        newState = achResult.state;

        // 5. Titles
        const newTitles = checkTitles(newState);
        if (newTitles) {
          newState = { ...newState, titles: { ...newState.titles, unlocked: newTitles } };
        }

        // 6. Pets tick
        if (killDelta > 0) {
          const { processPetTick } = require('@/engine/pets');
          newState = processPetTick(newState, killDelta);
        }

        // 7. Research tick
        const { tickResearch } = require('@/engine/research');
        const researchTickResult = tickResearch(newState);
        newState = researchTickResult.state;

        // 8. Dungeon tick (runs 10 times a second, so 0.1s elapsed per tick)
        if (newState.activeDungeon) {
          const { tickDungeon } = require('@/engine/endgame');
          const dunResult = tickDungeon(newState, 0.1);
          newState = dunResult.state;
        }

        // 9. World boss tick
        if (newState.worldBoss) {
          const { tickWorldBoss } = require('@/engine/endgame');
          const wbResult = tickWorldBoss(newState, 0.1);
          newState = wbResult.state;
        }

        // 9.5 Auto-cast skills if unlocked and enabled
        if (newState.upgrades.autoSkill > 0 && newState.settings.autoSkills) {
          const currentTime = Date.now();
          SKILLS.forEach((skill) => {
            if (newState.combat.currentWave >= skill.unlockWave) {
              const cooldownEnd = newState.skills[skill.id] || 0;
              if (currentTime >= cooldownEnd) {
                if (skill.id === 'heavy_strike') {
                  const dmg = calculateClickDamage(newState) * 5;
                  let activeWorldBoss = newState.worldBoss ? { ...newState.worldBoss } : null;
                  if (activeWorldBoss) {
                    activeWorldBoss.hp = Math.max(0, activeWorldBoss.hp - dmg);
                    newState.worldBoss = activeWorldBoss;
                    newState.combat = { ...newState.combat, currentEnemyHp: activeWorldBoss.hp };
                  } else {
                    newState.combat = { ...newState.combat, currentEnemyHp: newState.combat.currentEnemyHp - dmg };
                  }
                  tickEvents.push({ type: 'skill_cast', data: { skillId: 'heavy_strike' } });
                }
                if (skill.id === 'rage') {
                  newState.activePotions = { ...newState.activePotions, rage: currentTime + 5000 };
                  tickEvents.push({ type: 'skill_cast', data: { skillId: 'rage' } });
                }
                if (skill.id === 'heal') {
                  const maxHp = calculateMaxHp(newState);
                  newState.combat = { ...newState.combat, playerHp: Math.min(maxHp, newState.combat.playerHp + maxHp * 0.5) };
                  tickEvents.push({ type: 'skill_cast', data: { skillId: 'heal' } });
                }
                if (skill.id === 'midas_touch') {
                  newState.activePotions = { ...newState.activePotions, midas_touch: currentTime + 999999 };
                  tickEvents.push({ type: 'skill_cast', data: { skillId: 'midas_touch' } });
                }

                const cooldownMult = newState.faction === 'conclave' ? 0.5 : 1.0;
                newState.skills = { ...newState.skills, [skill.id]: currentTime + (skill.cooldown * 1000 * cooldownMult) };
              }
            }
          });
        }

        // 10. Collect events
        const allEvents: GameEvent[] = [
          ...tickEvents.map(e => ({ type: e.type, data: e.data })),
          ...questResult.claimedNames.map(name => ({ type: 'quest_complete', data: { name } })),
          ...achResult.newAchievements.map(id => ({ type: 'achievement', data: { id } })),
        ];
        if (researchTickResult.completedTechId) {
          allEvents.push({ type: 'research_complete', data: { techId: researchTickResult.completedTechId } });
        }

        newState = { ...newState, events: [...newState.events, ...allEvents] as GameEvent[] };

        return newState;
      });

      // Play soft defeat pop outside setState callback
      if (killsHappened && activeTab === 'combat') {
        sounds.playKill();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [loading]);

  // ─── EVENT PROCESSOR ───
  useEffect(() => {
    if (state.events.length === 0) return;

    state.events.forEach(event => {
      const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
      const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;

      const isCombat = activeTab === 'combat';
      switch (event.type) {
        case 'chest_drop':
          if (isCombat) {
            addEffect(cx, cy - 100, `${event.data.chestName} Drop!`, '#eab308');
            sounds.playReveal('rare');
          }
          break;
        case 'boss_defeated':
          if (isCombat) {
            addEffect(cx, cy, `BOSS DEFEATED! +${event.data.gems} 💎 +${event.data.dust} ✨`, '#facc15');
            sounds.playReveal('epic');
          }
          break;
        case 'boss_failed':
          if (isCombat) {
            addEffect(cx, cy, 'BOSS FAILED!', '#dc2626');
            sounds.playReveal('poor');
          }
          break;
        case 'level_up':
          if (isCombat) {
            addEffect(cx, cy - 150, `LEVEL UP! Lv.${event.data.level}`, '#22d3ee');
            addEffect(cx, cy - 110, `+${event.data.skillPoints} Skill Points`, '#a78bfa');
            sounds.playLevelUp();
          }
          break;
        case 'quest_complete':
          if (isCombat) {
            addEffect(cx, cy - 200, `Quest Complete!`, '#4ade80');
            sounds.playBuy();
          }
          break;
        case 'achievement':
          if (isCombat) {
            addEffect(cx, cy - 150, '🏆 Achievement Unlocked!', '#facc15');
            sounds.playReveal('legendary');
          }
          break;
        case 'research_complete':
          if (isCombat) {
            addEffect(cx, cy - 120, '🔬 Research Completed!', '#06b6d4');
            sounds.playLevelUp();
          }
          break;
        case 'skill_cast':
          if (isCombat) {
            const skillId = event.data.skillId as string;
            if (skillId === 'heavy_strike') addEffect(cx, cy, '💥 SMASH!', '#dc2626');
            if (skillId === 'heal') addEffect(cx, cy, '💚 HEAL!', '#22c55e');
            sounds.playSkill(skillId);
          }
          break;
      }
    });

    setState(prev => ({ ...prev, events: [] }));
  }, [state.events, addEffect, activeTab]);

  // ─── AUTO-CLICKER ───
  useEffect(() => {
    if (loading || !state.upgrades.autoClicker) return;
    const temporalLevel = state.ascensionPerks['temporal'] || 0;
    const riftMult = getTimeRiftMultiplier(state);
    
    // Check rage active potion to dynamically adjust auto-click rate
    const rageExp = state.activePotions.rage || 0;
    const hasRage = Date.now() < rageExp;
    const baseSpeed = 1000 / Math.pow(2, temporalLevel);
    const speed = hasRage ? baseSpeed / 2 : baseSpeed;
    const intervalSpeed = speed / riftMult;

    const interval = setInterval(() => {
      setState(prev => {
        const result = processClick(prev);
        return result.state;
      });
    }, intervalSpeed);
    return () => clearInterval(interval);
  }, [loading, state.upgrades.autoClicker, state.ascensionPerks.temporal, state.timeRiftActive, state.activePotions.rage]);

  // ─── GLOBAL AUTO-BATTLE COMBAT LOOP ───
  useEffect(() => {
    if (loading || !state.settings.autoBattle) return;

    const runAutoAttack = () => {
      setState(prev => {
        const result = processClick(prev);
        return result.state;
      });
      if (activeTab === 'combat') {
        sounds.playHit();
      }
    };

    const getSpeed = () => {
      const rageExp = stateRef.current.activePotions.rage || 0;
      const hasRage = Date.now() < rageExp;
      const attackSpeed = hasRage ? 150 : 300;
      const riftMult = getTimeRiftMultiplier(stateRef.current);
      return attackSpeed / riftMult;
    };

    let timerId = setTimeout(function tick() {
      runAutoAttack();
      timerId = setTimeout(tick, getSpeed());
    }, getSpeed());

    return () => clearTimeout(timerId);
  }, [loading, state.settings.autoBattle, activeTab]);

  // ─── ACTIONS ───

  const handleAttack = useCallback((e?: { clientX?: number; clientY?: number }) => {
    const now = Date.now();
    const rageExp = stateRef.current.activePotions.rage || 0;
    const hasRage = now < rageExp;
    const baseCooldown = 1000 * (1 - ((stateRef.current.upgrades.attackSpeed || 0) * 0.05));
    const cooldown = hasRage ? baseCooldown / 2 : baseCooldown;
    const actualCooldown = Math.max(50, cooldown);
    if (now - lastClickTime < actualCooldown) return;
    setLastClickTime(now);

    sounds.playHit();

    setState(prev => {
      const result = processClick(prev);
      if (result.isCrit && e?.clientX) {
        addEffect(e.clientX, (e.clientY || 300) - 50, 'CRIT!', '#dc2626');
      }
      return result.state;
    });
  }, [lastClickTime, addEffect]);

  const buyWorker = useCallback((workerId: string) => {
    const currentState = stateRef.current;
    const worker = WORKERS.find(w => w.id === workerId);
    if (!worker) return;
    const count = currentState.workers[workerId] || 0;
    const reduction = (currentState.skillTree.nodes['c_bulkHire'] || 0) * 0.03;
    const cost = workerCost(worker.cost, count, reduction);
    if (currentState.resources.gold < cost) return;

    sounds.playBuy();

    setState(prev => {
      const countInner = prev.workers[workerId] || 0;
      const reductionInner = (prev.skillTree.nodes['c_bulkHire'] || 0) * 0.03;
      const costInner = workerCost(worker.cost, countInner, reductionInner);
      return {
        ...prev,
        resources: { ...prev.resources, gold: prev.resources.gold - costInner },
        workers: { ...prev.workers, [workerId]: countInner + 1 },
      };
    });
  }, []);

  const handleUpgrade = useCallback((upgradeId: string) => {
    const currentState = stateRef.current;
    const upgrade = UPGRADES[upgradeId];
    if (!upgrade) return;
    const currentLevel = currentState.upgrades[upgradeId as keyof typeof currentState.upgrades] || 0;
    if (currentLevel >= upgrade.maxLevel) return;
    const cost = upgradeCost(upgrade.baseCost, upgrade.costMultiplier, currentLevel);
    if (currentState.resources.gold < cost) return;

    sounds.playBuy();

    setState(prev => {
      const currentLevelInner = prev.upgrades[upgradeId as keyof typeof prev.upgrades] || 0;
      const costInner = upgradeCost(upgrade.baseCost, upgrade.costMultiplier, currentLevelInner);
      return {
        ...prev,
        resources: { ...prev.resources, gold: prev.resources.gold - costInner },
        upgrades: { ...prev.upgrades, [upgradeId]: currentLevelInner + 1 },
      };
    });
  }, []);

  const handleRebirth = useCallback(() => {
    if (canRebirth(stateRef.current)) {
      sounds.playRebirth();
    }
    setState(prev => performRebirth(prev));
  }, []);

  const handleBuyRebirthUpgrade = useCallback((upgradeId: string) => {
    const currentState = stateRef.current;
    const upgrade = REBIRTH_UPGRADES[upgradeId as keyof typeof REBIRTH_UPGRADES];
    if (!upgrade) return;
    const currentLevel = currentState.rebirthUpgrades[upgradeId] || 0;
    if (currentLevel >= upgrade.maxLevel) return;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    if (currentState.resources.rebirthPoints < cost) return;

    sounds.playBuy();

    setState(prev => buyRebirthUpgrade(prev, upgradeId) || prev);
  }, []);

  const summonBoss = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.resources.bossKeys >= 1) {
      sounds.playAscension();
    }
    setState(prev => {
      if (prev.resources.bossKeys < 1) return prev;
      const bossHp = Math.pow(1.1, prev.combat.currentWave) * 10000;
      addEffect(
        typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
        typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
        'BOSS SUMMONED!', '#dc2626'
      );
      return {
        ...prev,
        resources: { ...prev.resources, bossKeys: prev.resources.bossKeys - 1 },
        combat: {
          ...prev.combat,
          bossFightActive: true,
          isBossGate: false,
          currentEnemyHp: bossHp,
          currentEnemyMaxHp: bossHp,
          playerHp: calculateMaxHp(prev),
        },
      };
    });
  }, [addEffect]);

  const buyChest = useCallback((chestId: string) => {
    const chest = CHESTS.find(c => c.id === chestId);
    if (!chest) return;

    const currentState = stateRef.current;
    const cost = getChestCost(chestId, currentState.stats.highestWave);
    if (currentState.resources.gold < cost) return;
    if (currentState.inventory.items.length >= 200) return; // Inventory full

    sounds.playBuy();

    setState(prev => {
      const costInner = getChestCost(chestId, prev.stats.highestWave);
      const chestIndex = CHESTS.findIndex(c => c.id === chestId);
      const chestItem: Item = {
        id: crypto.randomUUID(),
        instanceId: crypto.randomUUID(),
        type: 'consumable',
        itemId: chestId,
        quality: 'common',
        qualityValue: 0,
        isOverdrive: false,
        level: 1,
        starLevel: 0,
        enchants: [],
        tier: chestIndex,
        runes: [],
      };
      return {
        ...prev,
        resources: {
          ...prev.resources,
          gold: prev.resources.gold - costInner,
        },
        inventory: {
          ...prev.inventory,
          items: [...prev.inventory.items, chestItem],
        },
      };
    });
  }, []);

  const startUnlockChest = useCallback((itemInstanceId: string) => {
    sounds.playTick();
    setState(prev => {
      const item = prev.inventory.items.find(i => i.instanceId === itemInstanceId);
      if (!item || item.type !== 'consumable') return prev;

      // Restrict to simultaneously unlocking chests limit
      const maxSimultaneous = 1 + (prev.upgrades.chestSlots || 0);
      const currentlyUnlocking = prev.inventory.items.filter(i =>
        i.type === 'consumable' &&
        i.unlockEndTimestamp &&
        Date.now() < i.unlockEndTimestamp
      ).length;
      if (currentlyUnlocking >= maxSimultaneous) return prev;

      const duration = getChestUnlockDuration(item.itemId, prev.upgrades.chestUnlockSpeed || 0);
      const unlockEndTimestamp = Date.now() + (duration * 1000);

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          items: prev.inventory.items.map(i =>
            i.instanceId === itemInstanceId ? { ...i, unlockEndTimestamp } : i
          ),
        },
      };
    });
  }, []);

  const openChest = useCallback((itemInstanceId: string) => {
    const currentState = stateRef.current;
    const item = currentState.inventory.items.find(i => i.instanceId === itemInstanceId);
    if (!item || item.type !== 'consumable') return;

    const chestId = item.itemId;
    const chest = CHESTS.find(c => c.id === chestId);
    if (!chest) return;

    // Must be finished unlocking
    if (!item.unlockEndTimestamp || Date.now() < item.unlockEndTimestamp) return;

    const result = generateItemFromChest(chestId, currentState);
    if (!result) return;

    const scrap = getScrapValue(result.item);
    const isAutoScrapped = result.isAutoScrapped || (!result.isAutoScrapped && currentState.inventory.items.length >= 200);

    setState(prev => {
      let newItems = prev.inventory.items.filter(i => i.instanceId !== itemInstanceId);
      let newResources = { ...prev.resources };

      if (!result.isAutoScrapped) {
        if (newItems.length < 200) {
          newItems.push(result.item);
        } else {
          newResources.dust += scrap.dust;
          newResources.gold += scrap.gold;
        }
      } else {
        newResources.dust += scrap.dust;
        newResources.gold += scrap.gold;
      }

      return {
        ...prev,
        resources: newResources,
        inventory: { ...prev.inventory, items: newItems },
      };
    });

    sounds.playDrumroll();

    setChestReveal({
      item: result.item,
      isAutoScrapped,
      scrapGold: scrap.gold,
      scrapDust: scrap.dust,
      chestName: chest.name,
      chestId,
    });
  }, []);

  const equipItem = useCallback((item: Item) => {
    if (item.type === 'consumable') return;
    sounds.playTick();
    setState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        equipped: { ...prev.inventory.equipped, [item.type]: item.instanceId },
      },
    }));
  }, []);

  const unequipItem = useCallback((slot: 'head' | 'body' | 'feet' | 'hand') => {
    sounds.playTick();
    setState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        equipped: { ...prev.inventory.equipped, [slot]: null },
      },
    }));
  }, []);

  const equipBest = useCallback(() => {
    sounds.playTick();
    setState(prev => {
      const newEquipped = { ...prev.inventory.equipped };
      const slots = ['head', 'body', 'feet', 'hand'] as const;
      slots.forEach(slot => {
        const items = prev.inventory.items.filter(i => i.type === slot);
        if (items.length > 0) {
          items.sort((a, b) => {
            if (b.tier !== a.tier) return b.tier - a.tier;
            const { calculateItemPower } = require('@/engine/items');
            return calculateItemPower(b, prev) - calculateItemPower(a, prev);
          });
          newEquipped[slot] = items[0].instanceId;
        }
      });
      return { ...prev, inventory: { ...prev.inventory, equipped: newEquipped } };
    });
  }, []);

  const upgradeItemLevel = useCallback((itemInstanceId: string) => {
    const currentState = stateRef.current;
    const item = currentState.inventory.items.find(i => i.instanceId === itemInstanceId);
    if (!item) return;
    const costGold = itemUpgradeCostGold(item.level);
    const costDust = itemUpgradeCostDust(item.level);
    if (currentState.resources.gold < costGold || currentState.resources.dust < costDust) return;

    sounds.playCraft();

    setState(prev => {
      const itemInner = prev.inventory.items.find(i => i.instanceId === itemInstanceId);
      if (!itemInner) return prev;
      const costGoldInner = itemUpgradeCostGold(itemInner.level);
      const costDustInner = itemUpgradeCostDust(itemInner.level);
      return {
        ...prev,
        resources: { ...prev.resources, gold: prev.resources.gold - costGoldInner, dust: prev.resources.dust - costDustInner },
        inventory: {
          ...prev.inventory,
          items: prev.inventory.items.map(i =>
            i.instanceId === itemInstanceId ? { ...i, level: i.level + 1 } : i
          ),
        },
      };
    });
  }, []);

  const evolveItem = useCallback((itemInstanceId: string) => {
    const currentState = stateRef.current;
    const item = currentState.inventory.items.find(i => i.instanceId === itemInstanceId);
    if (!item || item.starLevel >= 5) return;
    const costDust = itemEvolveCostDust(item.starLevel);
    const costGems = itemEvolveCostGems(item.starLevel);
    if (currentState.resources.dust < costDust || currentState.resources.gems < costGems) return;

    sounds.playCraft();

    setState(prev => {
      const itemInner = prev.inventory.items.find(i => i.instanceId === itemInstanceId);
      if (!itemInner || itemInner.starLevel >= 5) return prev;
      const costDustInner = itemEvolveCostDust(itemInner.starLevel);
      const costGemsInner = itemEvolveCostGems(itemInner.starLevel);
      addEffect(
        typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
        typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
        '⭐ Item Evolved!', '#eab308'
      );
      return {
        ...prev,
        resources: { ...prev.resources, dust: prev.resources.dust - costDustInner, gems: prev.resources.gems - costGemsInner },
        inventory: {
          ...prev.inventory,
          items: prev.inventory.items.map(i =>
            i.instanceId === itemInstanceId ? { ...i, starLevel: i.starLevel + 1 } : i
          ),
        },
      };
    });
  }, [addEffect]);

  const refineItem = useCallback((itemInstanceId: string) => {
    const currentState = stateRef.current;
    const item = currentState.inventory.items.find(i => i.instanceId === itemInstanceId);
    if (!item) return;
    const tier = item.tier || 1;
    const costGold = itemRefineCostGold(tier);
    const costDust = itemRefineCostDust(tier);
    if (currentState.resources.gold < costGold || currentState.resources.dust < costDust) return;

    sounds.playCraft();

    setState(prev => {
      const itemInner = prev.inventory.items.find(i => i.instanceId === itemInstanceId);
      if (!itemInner) return prev;
      const tierInner = itemInner.tier || 1;
      const costGoldInner = itemRefineCostGold(tierInner);
      const costDustInner = itemRefineCostDust(tierInner);
      const increase = Math.floor(Math.random() * 5) + 1;
      const newValue = itemInner.isOverdrive
        ? itemInner.qualityValue + increase
        : Math.min(100, itemInner.qualityValue + increase);

      return {
        ...prev,
        resources: { ...prev.resources, gold: prev.resources.gold - costGoldInner, dust: prev.resources.dust - costDustInner },
        inventory: {
          ...prev.inventory,
          items: prev.inventory.items.map(i =>
            i.instanceId === itemInstanceId ? { ...i, qualityValue: newValue } : i
          ),
        },
      };
    });
  }, []);

  const activateOverdrive = useCallback((itemInstanceId: string) => {
    sounds.playSkill('generic');
    setState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        items: prev.inventory.items.map(i =>
          i.instanceId === itemInstanceId ? { ...i, isOverdrive: true } : i
        ),
      },
    }));
  }, []);

  const overdriveRefine = useCallback((itemInstanceId: string, sacrificeIds: string[]) => {
    const currentState = stateRef.current;
    const item = currentState.inventory.items.find(i => i.instanceId === itemInstanceId);
    if (!item) return;
    const tier = item.tier || 1;
    const costGold = itemRefineCostGold(tier);
    const costDust = itemRefineCostDust(tier);
    if (currentState.resources.gold < costGold || currentState.resources.dust < costDust) return;

    let destructionChance = overdriveDestructionChance(item.qualityValue);

    // Apply sacrifices
    sacrificeIds.forEach(sacId => {
      const sac = currentState.inventory.items.find(i => i.instanceId === sacId);
      if (sac) {
        destructionChance -= sacrificeRiskReduction(sac.tier || 1, tier, sac.qualityValue);
      }
    });
    destructionChance = Math.max(0.01, destructionChance);

    const isDestroyed = Math.random() < destructionChance;
    const increase = Math.floor(Math.random() * 5) + 1;

    const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
    const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;

    if (isDestroyed) {
      sounds.playReveal('poor');
      addEffect(cx, cy, '💥 ITEM DESTROYED!', '#dc2626');
    } else {
      sounds.playReveal('epic');
      addEffect(cx, cy, '✨ OVERDRIVE SUCCESS!', '#22c55e');
    }

    setState(prev => {
      const innerItem = prev.inventory.items.find(i => i.instanceId === itemInstanceId);
      if (!innerItem) return prev;

      const innerTier = innerItem.tier || 1;
      const costGoldInner = itemRefineCostGold(innerTier);
      const costDustInner = itemRefineCostDust(innerTier);

      // Remove sacrifices
      let newItems = prev.inventory.items.filter(i => !sacrificeIds.includes(i.instanceId));

      if (isDestroyed) {
        // DESTROYED
        newItems = newItems.filter(i => i.instanceId !== itemInstanceId);
      } else {
        // SUCCESS
        newItems = newItems.map(i =>
          i.instanceId === itemInstanceId
            ? { ...i, qualityValue: i.qualityValue + increase }
            : i
        );
      }

      return {
        ...prev,
        resources: { ...prev.resources, gold: prev.resources.gold - costGoldInner, dust: prev.resources.dust - costDustInner },
        inventory: { ...prev.inventory, items: newItems },
      };
    });
  }, [addEffect]);

  const enchantItem = useCallback((itemInstanceId: string) => {
    const currentState = stateRef.current;
    const item = currentState.inventory.items.find(i => i.instanceId === itemInstanceId);
    if (!item) return;
    const costGold = itemEnchantCostGold(item.tier || 1);
    const costDust = itemEnchantCostDust(item.tier || 1);
    if (currentState.resources.gold < costGold || currentState.resources.dust < costDust) return;

    sounds.playCraft();

    setState(prev => {
      const itemInner = prev.inventory.items.find(i => i.instanceId === itemInstanceId);
      if (!itemInner) return prev;
      const tierInner = itemInner.tier || 1;
      const costGoldInner = itemEnchantCostGold(tierInner);
      const costDustInner = itemEnchantCostDust(tierInner);

      const enchants: string[] = [];
      const enchantChanceUpgrade = prev.upgrades.enchantChance || 0;
      const baseEnchantChance = 0.5;
      const totalEnchantChance = baseEnchantChance + (enchantChanceUpgrade * 0.05);

      for (let i = 0; i < 3; i++) {
        if (Math.random() < totalEnchantChance / (i + 1)) {
          const possibleEnchants = ENCHANTS.filter(
            e => e.type === 'all' || e.type === (itemInner.type === 'hand' ? 'weapon' : 'armor')
          );
          const enchant = possibleEnchants[Math.floor(Math.random() * possibleEnchants.length)];
          if (enchant && !enchants.includes(enchant.id)) enchants.push(enchant.id);
        }
      }

      return {
        ...prev,
        resources: { ...prev.resources, gold: prev.resources.gold - costGoldInner, dust: prev.resources.dust - costDustInner },
        inventory: {
          ...prev.inventory,
          items: prev.inventory.items.map(i =>
            i.instanceId === itemInstanceId ? { ...i, enchants } : i
          ),
        },
      };
    });
  }, []);

  const deleteItem = useCallback((itemInstanceId: string) => {
    const currentState = stateRef.current;
    const item = currentState.inventory.items.find(i => i.instanceId === itemInstanceId);
    if (item) {
      sounds.playCraft();
    }
    setState(prev => salvageItem(prev, itemInstanceId) || prev);
  }, []);

  const usePotion = useCallback((potionId: string, itemInstanceId: string) => {
    const currentState = stateRef.current;
    const potion = POTIONS.find(p => p.id === potionId);
    if (potion) {
      sounds.playTick();
    }
    setState(prev => {
      const potionInner = POTIONS.find(p => p.id === potionId);
      if (!potionInner) return prev;

      let newCombat = { ...prev.combat };
      const newPotions = { ...prev.activePotions };
      const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
      const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;

      if (potionInner.effect?.type === 'heal') {
        const maxHp = calculateMaxHp(prev);
        newCombat.playerHp = Math.min(maxHp, prev.combat.playerHp + (maxHp * potionInner.effect.value));
        addEffect(cx, cy, '💚 Healed!', '#22c55e');
      } else if (potionInner.duration) {
        newPotions[potionInner.id] = Date.now() + (potionInner.duration * 1000);
        addEffect(cx, cy, `${potionInner.name} Active!`, '#ec4899');
      }

      return {
        ...prev,
        activePotions: newPotions,
        combat: newCombat,
        inventory: {
          ...prev.inventory,
          items: prev.inventory.items.filter(i => i.instanceId !== itemInstanceId),
        },
      };
    });
  }, [addEffect]);

  const activateSkill = useCallback((skillId: string) => {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    // Check unlock wave requirement
    if (stateRef.current.combat.currentWave < skill.unlockWave) return;

    const now = Date.now();
    const cooldownEnd = stateRef.current.skills[skillId] || 0;
    if (now < cooldownEnd) return;

    sounds.playSkill(skillId);

    setState(prev => {
      const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
      const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
      let newState = { ...prev };

      if (skill.id === 'heavy_strike') {
        const dmg = calculateClickDamage(prev) * 5;
        let activeWorldBoss = prev.worldBoss ? { ...prev.worldBoss } : null;
        if (activeWorldBoss) {
          activeWorldBoss.hp = Math.max(0, activeWorldBoss.hp - dmg);
          newState.worldBoss = activeWorldBoss;
          newState.combat = { ...newState.combat, currentEnemyHp: activeWorldBoss.hp };
        } else {
          newState.combat = { ...newState.combat, currentEnemyHp: newState.combat.currentEnemyHp - dmg };
        }
        addEffect(cx, cy, '💥 SMASH!', '#dc2626');
      }
      if (skill.id === 'rage') {
        newState.activePotions = { ...newState.activePotions, rage: now + 5000 };
      }
      if (skill.id === 'heal') {
        const maxHp = calculateMaxHp(prev);
        newState.combat = { ...newState.combat, playerHp: Math.min(maxHp, prev.combat.playerHp + maxHp * 0.5) };
        addEffect(cx, cy, '💚 HEAL!', '#22c55e');
      }
      if (skill.id === 'midas_touch') {
        newState.activePotions = { ...newState.activePotions, midas_touch: now + 999999 };
      }

      // Conclave faction reduces skill cooldowns by 50%
      const cooldownMult = prev.faction === 'conclave' ? 0.5 : 1.0;
      newState.skills = { ...newState.skills, [skillId]: now + (skill.cooldown * 1000 * cooldownMult) };
      return newState;
    });
  }, [addEffect]);

  const refreshQuests = useCallback(() => {
    if (state.resources.gems < 5) return;
    sounds.playBuy();
    setState(prev => ({
      ...prev,
      resources: { ...prev.resources, gems: prev.resources.gems - 5 },
      quests: {
        ...prev.quests,
        active: Array.from({ length: 3 }, () => generateQuest(prev.combat.currentWave)),
      },
    }));
  }, [state.resources.gems]);

  // ─── SKILL TREE ACTIONS ───
  const buySkillNode = useCallback((nodeId: string) => {
    const currentState = stateRef.current;
    if (canPurchaseNode(currentState, nodeId).canBuy) {
      sounds.playBuy();
    }
    setState(prev => purchaseNode(prev, nodeId) || prev);
  }, []);

  const handleRespec = useCallback(() => {
    const currentState = stateRef.current;
    const respecCost = 10 * Math.pow(2, currentState.skillTree.respecCount);
    if (currentState.resources.gems >= respecCost) {
      sounds.playRebirth();
    }
    setState(prev => respecSkillTree(prev) || prev);
  }, []);

  // ─── RUNE ACTIONS ───
  const handleForgeRune = useCallback((runeId: string) => {
    if (canForgeRune(stateRef.current, runeId)) {
      sounds.playCraft();
    }
    setState(prev => forgeRune(prev, runeId) || prev);
  }, []);

  const handleCombineRunes = useCallback((ids: [string, string, string]) => {
    if (combineRunes(stateRef.current, ids)) {
      sounds.playCraft();
    }
    setState(prev => combineRunes(prev, ids) || prev);
  }, []);

  const handleSocketRune = useCallback((itemId: string, runeId: string) => {
    if (socketRune(stateRef.current, itemId, runeId)) {
      sounds.playCraft();
    }
    setState(prev => socketRune(prev, itemId, runeId) || prev);
  }, []);

  const handleUnsocketRune = useCallback((itemId: string, socketIndex: number) => {
    const currentState = stateRef.current;
    const result = unsocketRune(currentState, itemId, socketIndex);
    if (!result) return;

    if (result.success) {
      sounds.playCraft();
      addEffect(
        typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
        typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
        'Rune Removed!', '#22c55e'
      );
    } else {
      sounds.playReveal('poor');
      addEffect(
        typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
        typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
        'Rune Destroyed!', '#dc2626'
      );
    }

    setState(result.state);
  }, [addEffect]);

  // ─── CRAFTING ACTIONS ───
  const handleCombineItems = useCallback((ids: [string, string, string]) => {
    if (combineItems(stateRef.current, ids)) {
      sounds.playCraft();
    }
    setState(prev => {
      const result = combineItems(prev, ids);
      if (result) {
        addEffect(
          typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
          typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
          '⚒️ Item Crafted!', '#2dd4bf'
        );
      }
      return result || prev;
    });
  }, [addEffect]);

  const handleTransmute = useCallback((recipeId: string) => {
    if (canTransmute(stateRef.current, recipeId)) {
      sounds.playCraft();
    }
    setState(prev => transmuteMaterials(prev, recipeId) || prev);
  }, []);

  // ─── SETTINGS ───
  const updateSettings = useCallback((updates: Partial<GameState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const selectTitle = useCallback((titleId: string) => {
    setState(prev => ({
      ...prev,
      titles: { ...prev.titles, selected: titleId },
    }));
  }, []);

  const buyBossKey = useCallback((currency: 'gold' | 'gems') => {
    const currentState = stateRef.current;
    const goldCost = Math.max(500, Math.floor(currentState.stats.highestWave * 100));

    if (currency === 'gold') {
      if (currentState.resources.gold < goldCost) return;
      sounds.playBuy();
      setState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          gold: prev.resources.gold - goldCost,
          bossKeys: prev.resources.bossKeys + 1,
        }
      }));
    } else {
      if (currentState.resources.gems < 10) return;
      sounds.playBuy();
      setState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          gems: prev.resources.gems - 10,
          bossKeys: prev.resources.bossKeys + 1,
        }
      }));
    }
  }, []);

  // ─── KEYBOARD HOTKEYS FOR ACTIVE SKILLS ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }
      const key = e.key;
      if (key === '1') {
        activateSkill('heavy_strike');
      } else if (key === '2') {
        activateSkill('heal');
      } else if (key === '3') {
        activateSkill('rage');
      } else if (key === '4') {
        activateSkill('midas_touch');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activateSkill]);

  // ─── SAVE MANAGEMENT ───
  const handleExport = useCallback(() => exportSave(stateRef.current), []);

  const handleImport = useCallback((base64: string) => {
    const imported = importSave(base64);
    if (imported) {
      setState(imported);
      saveGame(imported);
      return true;
    }
    return false;
  }, []);

  const handleWipe = useCallback(() => {
    wipeSave();
    const fresh = createFreshState();
    setState(fresh);
  }, []);

  const handleManualSave = useCallback(() => {
    saveGame(stateRef.current);
  }, []);

  const dismissOffline = useCallback(() => setOfflineEarnings(0), []);

  return {
    state,
    loading,
    effects,
    offlineEarnings,
    chestReveal,
    dismissChestReveal: useCallback(() => setChestReveal(null), []),

    // Actions
    handleAttack,
    buyWorker,
    handleUpgrade,
    handleRebirth,
    handleBuyRebirthUpgrade,
    summonBoss,
    buyBossKey,
    openChest,
    buyChest,
    startUnlockChest,
    equipItem,
    unequipItem,
    equipBest,
    upgradeItemLevel,
    evolveItem,
    refineItem,
    activateOverdrive,
    overdriveRefine,
    enchantItem,
    deleteItem,
    usePotion,
    activateSkill,
    refreshQuests,
    buySkillNode,
    handleRespec,
    handleForgeRune,
    handleCombineRunes,
    handleSocketRune,
    handleUnsocketRune,
    handleCombineItems,
    handleTransmute,
    updateSettings,
    selectTitle,

    // Phase 2 & 3 Actions
    handleAscend: useCallback(() => {
      const currentState = stateRef.current;
      const nextState = performAscension(currentState);
      if (nextState !== currentState) {
        sounds.playAscension();
        addEffect(
          typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
          typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
          '🌟 ASCENSION PRESTIGE!', '#a855f7'
        );
        setState(nextState);
      }
    }, [addEffect]),

    buyAscensionPerkInstance: useCallback((perkId: string) => {
      const currentState = stateRef.current;
      const nextState = buyAscensionPerk(currentState, perkId);
      if (nextState && nextState !== currentState) {
        sounds.playBuy();
        setState(nextState);
      }
    }, []),

    chooseFactionInstance: useCallback((factionId: string) => {
      const currentState = stateRef.current;
      const nextState = selectFaction(currentState, factionId);
      if (nextState && nextState !== currentState) {
        sounds.playAscension();
        setState(nextState);
      }
    }, []),

    hatchPetEggInstance: useCallback((eggInstanceId: string) => {
      const currentState = stateRef.current;
      const nextState = hatchPetEgg(currentState, eggInstanceId);
      if (nextState !== currentState) {
        const beforeCount = currentState.pets.inventory.length;
        if (nextState.pets.inventory.length > beforeCount) {
          const newPet = nextState.pets.inventory[nextState.pets.inventory.length - 1];
          sounds.playReveal(newPet.rarity);
          addEffect(
            typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
            typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
            `🐉 Hatched: ${newPet.rarity.toUpperCase()} ${newPet.petId}!`, '#14b8a6'
          );
        }
        setState(nextState);
      }
    }, [addEffect]),

    equipPetInstance: useCallback((petInstanceId: string) => {
      const currentState = stateRef.current;
      const nextState = equipPet(currentState, petInstanceId);
      if (nextState !== currentState) {
        sounds.playTick();
        setState(nextState);
      }
    }, []),

    unequipPetInstance: useCallback((petInstanceId: string) => {
      const currentState = stateRef.current;
      const nextState = unequipPet(currentState, petInstanceId);
      if (nextState !== currentState) {
        sounds.playTick();
        setState(nextState);
      }
    }, []),

    startResearchTech: useCallback((techId: string) => {
      const currentState = stateRef.current;
      const nextState = startResearch(currentState, techId);
      if (nextState !== currentState) {
        sounds.playBuy();
        setState(nextState);
      }
    }, []),

    cancelResearchTech: useCallback(() => {
      const currentState = stateRef.current;
      const nextState = cancelResearch(currentState);
      if (nextState !== currentState) {
        sounds.playTick();
        setState(nextState);
      }
    }, []),

    startDungeonInstance: useCallback((dungeonId: string) => {
      const currentState = stateRef.current;
      const nextState = startDungeon(currentState, dungeonId);
      if (nextState !== currentState) {
        sounds.playRebirth();
        addEffect(
          typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
          typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
          '🛡️ ENTERED DUNGEON!', '#3b82f6'
        );
        setState(nextState);
      }
    }, [addEffect]),

    startTimeRiftInstance: useCallback((riftType: 'minor' | 'major' | 'storm') => {
      const currentState = stateRef.current;
      const nextState = startTimeRift(currentState, riftType);
      if (nextState !== currentState) {
        sounds.playRebirth();
        addEffect(
          typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
          typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
          '⏳ TIME WARP ACTIVATED!', '#06b6d4'
        );
        setState(nextState);
      }
    }, [addEffect]),

    summonWorldBossInstance: useCallback((bossId: string) => {
      const currentState = stateRef.current;
      const nextState = summonWorldBoss(currentState, bossId);
      if (nextState !== currentState) {
        sounds.playAscension();
        addEffect(
          typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
          typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
          '👹 WORLD BOSS SUMMONED!', '#ef4444'
        );
        setState(nextState);
      }
    }, [addEffect]),

    cleanseCorruptionInstance: useCallback(() => {
      const currentState = stateRef.current;
      const nextState = cleanseCorruption(currentState);
      if (nextState !== currentState) {
        sounds.playRebirth();
        setState(nextState);
      }
    }, []),

    // Save management
    handleExport,
    handleImport,
    handleWipe,
    handleManualSave,
    dismissOffline,

    // Tab state
    activeTab,
    setActiveTab,

    // Utils
    addEffect,
  };
}
