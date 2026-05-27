"use client";

import React from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { ASCENSION_PERKS } from '@/lib/gameConfig';
import { canAscend, calculateAscensionPointsEarned, ASCENSION_THRESHOLD } from '@/engine/ascension';
import Twemoji from './Twemoji';

interface AscensionViewProps {
  state: GameState;
  handleAscend: () => void;
  buyAscensionPerkInstance: (perkId: string) => void;
  chooseFactionInstance: (factionId: string) => void;
}

export default function AscensionView({
  state,
  handleAscend,
  buyAscensionPerkInstance,
  chooseFactionInstance,
}: AscensionViewProps) {
  const { resources, stats, ascensionPerks, faction } = state;

  const pointsEarned = calculateAscensionPointsEarned(state);
  const ascendPossible = canAscend(state);

  const factionsList = [
    {
      id: 'blade',
      name: 'Order of the Blade',
      emoji: '⚔️',
      desc: '+50% click damage, but -25% worker DPS.',
      color: '#f87171',
    },
    {
      id: 'merchant',
      name: "Merchant's Guild",
      emoji: '🏛️',
      desc: '+100% gold gain, but -25% click damage.',
      color: '#fbbf24',
    },
    {
      id: 'conclave',
      name: 'Arcane Conclave',
      emoji: '🔮',
      desc: '-50% skill cooldowns, but -25% max HP/defense.',
      color: '#a78bfa',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-title"><Twemoji emoji="🌟" /> Ascension prestige (Meta Progression)</div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-skill-point)', fontWeight: 'bold' }}>
          AP: {resources.ascensionPoints}
        </div>
      </div>

      {/* Ascension Main Trigger Card */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '24px', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Perform Ascension</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            Ascend beyond Rebirth. This will reset your Rebirth Points, upgrades, items, workers, and skills, but unlocks permanent meta-progression perks and factions.
          </p>
          <div style={{ display: 'flex', gap: '24px', fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Rebirth Points:</span>{' '}
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {formatNumber(resources.rebirthPoints)} / {formatNumber(ASCENSION_THRESHOLD)}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Ascension count:</span>{' '}
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{stats.ascensions}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-health)', fontWeight: 'bold', marginBottom: 8 }}>
            {ascendPossible ? `+${pointsEarned} Ascension Points` : 'Rebirth Points insufficient'}
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={handleAscend}
            disabled={!ascendPossible}
          >
            <Twemoji emoji="🌟" /> Ascend Now
          </button>
        </div>
      </div>

      {/* Factions Section */}
      <div className="glass-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Faction Choice</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
          Choose a faction once you have Ascended at least once. Your choice will shape your playstyle strengths.
        </p>

        {stats.ascensions < 1 ? (
          <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13 }}>
            <Twemoji emoji="🔒" /> Locked. Requires at least 1 Ascension to choose a Faction.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {factionsList.map(f => {
              const active = faction === f.id;
              return (
                <div
                  key={f.id}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    background: active ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
                    border: active ? `2px solid ${f.color}` : '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    boxShadow: active ? `0 0 12px ${f.color}33` : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 4 }}><Twemoji emoji={f.emoji} /></div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: f.color }}>{f.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{f.desc}</div>
                  </div>
                  <button
                    className={`btn ${active ? 'btn-success' : 'btn-secondary'} btn-sm`}
                    style={{ width: '100%' }}
                    onClick={() => chooseFactionInstance(f.id)}
                    disabled={active}
                  >
                    {active ? 'Selected' : 'Enlist'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Perks Grid */}
      <div className="glass-card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Ascension Perks</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {ASCENSION_PERKS.map(perk => {
            const currentLevel = ascensionPerks[perk.id] || 0;
            const maxed = currentLevel >= perk.maxLevel;
            const cost = perk.baseCost + (currentLevel * perk.costMult);
            const canAfford = resources.ascensionPoints >= cost;

            return (
              <div
                key={perk.id}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{perk.name}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      Lv.{currentLevel} / {perk.maxLevel}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{perk.description}</p>
                </div>
                <button
                  className={`btn ${maxed ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  style={{ width: '100%' }}
                  onClick={() => buyAscensionPerkInstance(perk.id)}
                  disabled={maxed || !canAfford}
                >
                  {maxed ? 'MAX LEVEL' : `Upgrade: ${cost} AP`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
