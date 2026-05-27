"use client";

import React, { useState, useEffect } from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { DUNGEONS, WORLD_BOSSES } from '@/lib/gameConfig';
import { getResearchMultiplier } from '@/engine/research';
import Twemoji from './Twemoji';

interface EndgameViewProps {
  state: GameState;
  startDungeonInstance: (dungeonId: string) => void;
  startTimeRiftInstance: (riftType: 'minor' | 'major' | 'storm') => void;
  summonWorldBossInstance: (bossId: string) => void;
  cleanseCorruptionInstance: () => void;
}

export default function EndgameView({
  state,
  startDungeonInstance,
  startTimeRiftInstance,
  summonWorldBossInstance,
  cleanseCorruptionInstance,
}: EndgameViewProps) {
  const { resources, activeDungeon, worldBoss, corruption, timeRiftActive } = state;
  const [subTab, setSubTab] = useState<'dungeons' | 'rifts' | 'bosses' | 'corruption'>('dungeons');

  // Timers for rifts & bosses
  const [riftSeconds, setRiftSeconds] = useState(0);
  const [bossSeconds, setBossSeconds] = useState(0);

  useEffect(() => {
    const update = () => {
      if (timeRiftActive) {
        const remaining = Math.max(0, Math.ceil((timeRiftActive.endTimestamp - Date.now()) / 1000));
        setRiftSeconds(remaining);
      } else {
        setRiftSeconds(0);
      }

      if (worldBoss) {
        const remaining = Math.max(0, worldBoss.timeLimit - worldBoss.elapsed);
        setBossSeconds(Math.ceil(remaining));
      } else {
        setBossSeconds(0);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timeRiftActive, worldBoss]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Subtab Navigation */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        <button className={`tab ${subTab === 'dungeons' ? 'active' : ''}`} onClick={() => setSubTab('dungeons')}>
          <Twemoji emoji="🛡️" /> Dungeons
        </button>
        <button className={`tab ${subTab === 'rifts' ? 'active' : ''}`} onClick={() => setSubTab('rifts')}>
          <Twemoji emoji="⏳" /> Time Rifts
        </button>
        <button className={`tab ${subTab === 'bosses' ? 'active' : ''}`} onClick={() => setSubTab('bosses')}>
          <Twemoji emoji="👹" /> World Bosses
        </button>
        <button className={`tab ${subTab === 'corruption' ? 'active' : ''}`} onClick={() => setSubTab('corruption')}>
          <Twemoji emoji="💀" /> Corruption
        </button>
      </div>

      {/* SUBTAB: DUNGEONS */}
      {subTab === 'dungeons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-header">
            <div className="section-title"><Twemoji emoji="🛡️" /> Dungeon Challenge Trials</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-boss-key)', fontWeight: 'bold' }}>
              Keys: {resources.dungeonKeys}
            </div>
          </div>

          {/* Active Dungeon Panel */}
          {activeDungeon && (
            <div className="glass-card" style={{ border: '2px solid var(--color-info)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-info)', marginBottom: 8 }}>
                ACTIVE RUN: {activeDungeon.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Wave: {activeDungeon.wave}/10</span>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}><Twemoji emoji="⏳" /> {Math.ceil(activeDungeon.timeLeft)}s left</span>
                </div>
                <div className="progress-bar hp" style={{ height: 6 }}>
                  <div className="fill" style={{ width: `${(activeDungeon.wave / 10) * 100}%` }} />
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Enemies Cleared in current wave: {state.combat.enemiesDefeated} / 5
                </div>
              </div>
            </div>
          )}

          {/* Dungeons List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {DUNGEONS.map(d => {
              const locked = state.stats.ascensions < d.reqAscension;
              const canAfford = resources.dungeonKeys >= d.keyCost;

              return (
                <div
                  key={d.id}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    opacity: locked ? 0.6 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 24 }}><Twemoji emoji={d.emoji} /></span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</span>
                    </div>
                    {locked ? (
                      <div style={{ fontSize: 10, color: 'var(--color-error)', fontWeight: 'bold', marginTop: 4 }}>
                        <Twemoji emoji="🔒" /> Requires Ascension {d.reqAscension}
                      </div>
                    ) : (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                        Cost: {d.keyCost} Dungeon Key • Time Limit: {d.timeLimit}s
                      </div>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{d.description}</p>
                    <div style={{ fontSize: 11, color: 'var(--color-damage)', fontWeight: 'bold', marginTop: 8 }}>
                      Modifiers: {d.modifiers.join(', ')}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => startDungeonInstance(d.id)}
                    disabled={locked || activeDungeon !== null || !canAfford}
                  >
                    {activeDungeon ? 'IN OTHER RUN' : locked ? 'LOCKED' : `Enter Dungeon`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB: TIME RIFTS */}
      {subTab === 'rifts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-header">
            <div className="section-title"><Twemoji emoji="⏳" /> Time Rift Speedups</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-dust)', fontWeight: 'bold' }}>
              Time Crystals: {resources.timeCrystals}
            </div>
          </div>

          {/* Active Rift countdown */}
          {timeRiftActive && riftSeconds > 0 && (
            <div className="glass-card" style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--color-dust)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}><Twemoji emoji="🌀" /></div>
              <h4 style={{ fontWeight: 800 }}>Time Rift Active!</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
                Speed factor is boosted. Remaining time:
              </p>
              <div style={{ fontSize: 24, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-dust)', marginTop: 8 }}>
                {Math.floor(riftSeconds / 60)}m {riftSeconds % 60}s
              </div>
            </div>
          )}

          {/* Rifts Config List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { id: 'minor', name: 'Minor Time Rift', cost: 5, duration: '30 min', mult: '2x' },
              { id: 'major', name: 'Major Time Rift', cost: 20, duration: '15 min', mult: '5x' },
              { id: 'storm', name: 'Temporal Storm', cost: 100, duration: '10 min', mult: '10x' },
            ].map(r => {
              const canAfford = resources.timeCrystals >= r.cost;
              return (
                <div
                  key={r.id}
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
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Cost: {r.cost} Time Crystals
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                      Accelerates the game speed by <strong style={{ color: 'var(--color-dust)' }}>{r.mult}</strong> for {r.duration}.
                    </p>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => startTimeRiftInstance(r.id as 'minor' | 'major' | 'storm')}
                    disabled={timeRiftActive !== null || !canAfford}
                  >
                    Activate ({r.cost} crystals)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB: WORLD BOSSES */}
      {subTab === 'bosses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-header">
            <div className="section-title"><Twemoji emoji="👹" /> World Boss Mega Battles</div>
          </div>

          {/* Active Boss Fight */}
          {worldBoss && (() => {
            const bossDef = WORLD_BOSSES.find(b => b.id === worldBoss.bossId);
            return (
              <div className="glass-card" style={{ border: '2px solid var(--color-damage)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 48 }}><Twemoji emoji={bossDef?.emoji || '👹'} /></div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 800, color: 'var(--color-damage)' }}>{worldBoss.name}</h4>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Time Limit: {worldBoss.timeLimit}s • ⏳ {bossSeconds}s remaining
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span>Boss HP</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatNumber(worldBoss.hp)} / {formatNumber(worldBoss.maxHp)}
                    </span>
                  </div>
                  <div className="progress-bar progress-bar-lg enemy">
                    <div className="fill" style={{ width: `${(worldBoss.hp / worldBoss.maxHp) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* World Boss List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {WORLD_BOSSES.map(wb => (
              <div
                key={wb.id}
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
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 24 }}><Twemoji emoji={wb.emoji} /></span>
                    <span style={{ fontWeight: 700 }}>{wb.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    HP multiplier: {wb.hpMultiplier}x • Element: {wb.element.toUpperCase()}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    A colossal legendary beast. Defeating it yields 5 Purity Orbs, Gems, and Stardust.
                  </p>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => summonWorldBossInstance(wb.id)}
                  disabled={worldBoss !== null}
                >
                  Challenge Boss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB: CORRUPTION & PURITY */}
      {subTab === 'corruption' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-header">
            <div className="section-title"><Twemoji emoji="💀" /> Corruption & Purity</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-skill-point)', fontWeight: 'bold' }}>
              Orbs: {resources.purityOrbs}
            </div>
          </div>

          <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '24px', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Current Corruption: {corruption}%</h3>
              <div className="progress-bar enemy" style={{ height: 10, marginBottom: 16 }}>
                <div className="fill" style={{ width: `${corruption}%` }} />
              </div>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Enemy HP/Damage bonus:</span>{' '}
                  <span style={{ color: 'var(--color-damage)', fontWeight: 'bold' }}>+{corruption}%</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Gold reward penalty:</span>{' '}
                  <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>-{corruption / 2}%</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Loot drop quality chance:</span>{' '}
                  <span style={{ color: 'var(--color-health)', fontWeight: 'bold' }}>+{corruption}%</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                Spend 1 Purity Orb to cleanse 25% corruption.
              </p>
              <button
                className="btn btn-gold btn-lg"
                style={{ width: '100%' }}
                onClick={cleanseCorruptionInstance}
                disabled={corruption <= 0 || resources.purityOrbs < 1}
              >
                <Twemoji emoji="✨" /> Cleanse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
