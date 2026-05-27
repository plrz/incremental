"use client";

import React from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { WORKERS } from '@/lib/gameConfig';
import { workerCost } from '@/engine/scaling';
import { calculateDPS } from '@/engine/items';
import Twemoji from './Twemoji';

interface ArmyViewProps {
  state: GameState;
  buyWorker: (workerId: string) => void;
}

export default function ArmyView({ state, buyWorker }: ArmyViewProps) {
  const totalDPS = calculateDPS(state);
  const totalWorkers = Object.values(state.workers).reduce((sum, c) => sum + c, 0);
  const costReduction = (state.skillTree.nodes['c_bulkHire'] || 0) * 0.03;

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <Twemoji emoji="⚔️" /> Army
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          <span>Total: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{totalWorkers}</span></span>
          <span>DPS: <span style={{ color: 'var(--color-health)', fontWeight: 700 }}>{formatNumber(totalDPS)}</span></span>
        </div>
      </div>

      <div className="worker-list">
        {WORKERS.map(worker => {
          const count = state.workers[worker.id] || 0;
          const cost = workerCost(worker.cost, count, costReduction);
          const canAfford = state.resources.gold >= cost;
          const totalDps = count * worker.dps;

          return (
            <div key={worker.id} className="worker-row">
              <div className="worker-emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Twemoji emoji={worker.emoji} />
              </div>
              <div className="worker-info">
                <div className="worker-name">{worker.name}</div>
                <div className="worker-desc">{worker.description}</div>
                <div className="worker-stats">
                  {formatNumber(worker.dps)} DPS each • Total: {formatNumber(totalDps)} DPS
                </div>
              </div>
              <div className="worker-count">×{count}</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => buyWorker(worker.id)}
                disabled={!canAfford}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Twemoji emoji="💰" /> {formatNumber(cost)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
