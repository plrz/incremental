"use client";

import React, { useState, useEffect } from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { RESEARCH_TECHS } from '@/lib/gameConfig';
import { getResearchCost, getResearchDuration } from '@/engine/research';
import Twemoji from './Twemoji';

interface ResearchViewProps {
  state: GameState;
  startResearchTech: (techId: string) => void;
  cancelResearchTech: () => void;
}

export default function ResearchView({
  state,
  startResearchTech,
  cancelResearchTech,
}: ResearchViewProps) {
  const { resources, research } = state;
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Sync remaining seconds for active research nuke timer
  useEffect(() => {
    if (!research.activeResearchId || !research.activeResearchEnd) {
      setTimeRemaining(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((research.activeResearchEnd! - Date.now()) / 1000));
      setTimeRemaining(remaining);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [research.activeResearchId, research.activeResearchEnd]);

  const activeTech = RESEARCH_TECHS.find(t => t.id === research.activeResearchId);
  const activeLevel = activeTech ? (research.nodes[activeTech.id] || 0) : 0;
  const activeDuration = activeTech ? getResearchDuration(activeTech.id, activeLevel) : 1;
  const percentComplete = activeTech ? Math.min(100, ((activeDuration - timeRemaining) / activeDuration) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-title"><Twemoji emoji="🔬" /> Technology Research Lab</div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dust)', fontWeight: 'bold' }}>
          RP: {formatNumber(resources.researchPoints)}
        </div>
      </div>

      {/* Active Research Card */}
      <div className="glass-card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Current Research</h3>
        {research.activeResearchId && activeTech ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700 }}>{activeTech.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                  Researching Level {activeLevel + 1}
                </span>
              </div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                <Twemoji emoji="⏳" /> {timeRemaining}s left
              </div>
            </div>
            <div className="progress-bar xp" style={{ height: 6 }}>
              <div className="fill" style={{ width: `${percentComplete}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-danger btn-sm" onClick={cancelResearchTech}>
                ✕ Abort Research
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
            Lab idle. Select a technology below to begin research.
          </p>
        )}
      </div>

      {/* Technologies List */}
      <div className="glass-card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Available Technologies</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {RESEARCH_TECHS.map(tech => {
            const currentLevel = research.nodes[tech.id] || 0;
            const maxed = currentLevel >= tech.maxLevel;
            const cost = getResearchCost(tech.id, currentLevel);
            const duration = getResearchDuration(tech.id, currentLevel);
            const canAfford = resources.researchPoints >= cost;
            const isResearchingThis = research.activeResearchId === tech.id;

            return (
              <div
                key={tech.id}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isResearchingThis ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tech.name}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Lv.{currentLevel} / {tech.maxLevel}
                    </span>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
                    {tech.category}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{tech.description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {!maxed && !isResearchingThis && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>Cost: {formatNumber(cost)} RP</span>
                      <span>Time: {duration}s</span>
                    </div>
                  )}
                  <button
                    className={`btn ${isResearchingThis ? 'btn-gold' : maxed ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    style={{ width: '100%' }}
                    onClick={() => startResearchTech(tech.id)}
                    disabled={maxed || isResearchingThis || research.activeResearchId !== null || !canAfford}
                  >
                    {isResearchingThis ? 'RESEARCHING' : maxed ? 'MAX LEVEL' : 'Start Research'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
