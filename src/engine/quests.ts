/**
 * Zikki Incremental — Quest Engine
 */

import type { GameState, Quest } from './gameState';
import { QUEST_TEMPLATES } from '@/lib/gameConfig';

/** Generate a new quest scaled to current wave */
export function generateQuest(currentWave: number): Quest {
  const template = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
  const scale = Math.max(1, Math.floor(currentWave / 10));
  const target = Math.floor(template.targetBase * scale * (0.8 + Math.random() * 0.4));

  const reward: Record<string, number> = {};
  Object.entries(template.rewardBase).forEach(([key, value]) => {
    reward[key] = Math.floor(value * scale);
  });

  let type = 'kill_count';
  if (template.type === 'gold') type = 'collect_gold';
  if (template.type === 'click') type = 'click_count';

  return {
    id: crypto.randomUUID(),
    templateIndex: QUEST_TEMPLATES.indexOf(template),
    name: template.name.replace('{target}', target.toLocaleString()),
    type,
    target,
    progress: 0,
    reward,
    isCompleted: false,
  };
}

/** Update quest progress based on deltas */
export function updateQuestProgress(
  quests: Quest[],
  deltas: { kills: number; gold: number; clicks: number; wave: number }
): Quest[] {
  return quests.map(q => {
    if (q.isCompleted) return q;

    let newProgress = q.progress;
    if (q.type === 'kill_count' && deltas.kills > 0) newProgress += deltas.kills;
    if (q.type === 'collect_gold' && deltas.gold > 0) newProgress += deltas.gold;
    if (q.type === 'click_count' && deltas.clicks > 0) newProgress += deltas.clicks;
    if (q.type === 'reach_wave' && deltas.wave > q.progress) newProgress = deltas.wave;

    return {
      ...q,
      progress: newProgress,
      isCompleted: newProgress >= q.target,
    };
  });
}

/** Claim completed quests and generate replacements */
export function claimCompletedQuests(state: GameState): {
  state: GameState;
  claimedNames: string[];
} {
  const claimedNames: string[] = [];
  let resources = { ...state.resources };
  let stats = { ...state.stats };

  const remainingQuests: Quest[] = [];

  for (const q of state.quests.active) {
    if (q.isCompleted) {
      claimedNames.push(q.name);

      if (q.reward.gold) {
        resources.gold += q.reward.gold;
        stats.totalGold += q.reward.gold;
      }
      if (q.reward.gems) resources.gems += q.reward.gems;
      if (q.reward.dust) resources.dust += q.reward.dust;
      if (q.reward.bossKeys) resources.bossKeys += q.reward.bossKeys;
    } else {
      remainingQuests.push(q);
    }
  }

  // Fill empty slots
  while (remainingQuests.length < 3) {
    remainingQuests.push(generateQuest(state.combat.currentWave));
  }

  return {
    state: {
      ...state,
      resources,
      stats,
      quests: { ...state.quests, active: remainingQuests },
    },
    claimedNames,
  };
}
