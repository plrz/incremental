"use client";

import React from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import Twemoji from './Twemoji';

interface QuestViewProps {
  state: GameState;
  refreshQuests: () => void;
}

export default function QuestView({ state, refreshQuests }: QuestViewProps) {
  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <Twemoji emoji="📜" /> Quests
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={refreshQuests}
          disabled={state.resources.gems < 5}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Twemoji emoji="🔄" /> Refresh (5 <Twemoji emoji="💎" />)
        </button>
      </div>

      <div className="quest-list">
        {state.quests.active.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            No active quests. They will appear as you play!
          </div>
        ) : (
          state.quests.active.map(quest => {
            const progress = Math.min(quest.progress, quest.target);
            const percent = (progress / quest.target) * 100;

            return (
              <div key={quest.id} className={`quest-card ${quest.isCompleted ? 'completed' : ''}`}>
                <div className="quest-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {quest.isCompleted && <Twemoji emoji="✅" />}{quest.name}
                </div>
                <div className="progress-bar quest" style={{ marginBottom: 8 }}>
                  <div className="fill" style={{ width: `${percent}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>{formatNumber(progress)} / {formatNumber(quest.target)}</span>
                  <span>{Math.floor(percent)}%</span>
                </div>
                <div className="quest-reward" style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {Object.entries(quest.reward).map(([key, value]) => {
                    const emojis: Record<string, string> = { gold: '💰', gems: '💎', dust: '✨', bossKeys: '🔑' };
                    return (
                      <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Twemoji emoji={emojis[key] || ''} /> {formatNumber(value as number)}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
