"use client";

import React from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import Twemoji from './Twemoji';

interface TopBarProps {
  state: GameState;
}

export default function TopBar({ state }: TopBarProps) {
  const { resources, stats } = state;

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <div className="resource-badge gold">
          <span className="emoji"><Twemoji emoji="💰" /></span>
          <span className="value">{formatNumber(resources.gold)}</span>
        </div>
        <div className="resource-badge gem">
          <span className="emoji"><Twemoji emoji="💎" /></span>
          <span className="value">{formatNumber(resources.gems)}</span>
        </div>
        <div className="resource-badge dust">
          <span className="emoji"><Twemoji emoji="✨" /></span>
          <span className="value">{formatNumber(resources.dust)}</span>
        </div>
        <div className="resource-badge boss-key">
          <span className="emoji"><Twemoji emoji="🔑" /></span>
          <span className="value">{resources.bossKeys}</span>
        </div>
        {stats.rebirths > 0 && (
          <div className="resource-badge rebirth-point">
            <span className="emoji"><Twemoji emoji="♻️" /></span>
            <span className="value">{formatNumber(resources.rebirthPoints)}</span>
          </div>
        )}
        <div className="resource-badge skill-point">
          <span className="emoji"><Twemoji emoji="🧠" /></span>
          <span className="value">{resources.skillPoints}</span>
        </div>
      </div>
      <div className="top-bar-right">
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Lv.{stats.playerLevel}
        </div>
        <div className="progress-bar xp" style={{ width: 80, height: 6 }}>
          <div className="fill" style={{ width: `${(stats.playerXp / stats.playerXpToNext) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
