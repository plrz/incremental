"use client";

import React, { useState } from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber, formatTime } from '@/lib/formatters';
import { ACHIEVEMENTS, TITLES } from '@/lib/gameConfig';
import Twemoji from './Twemoji';

interface MenuViewProps {
  state: GameState;
  selectTitle: (titleId: string) => void;
  updateSettings: (updates: Partial<GameState['settings']>) => void;
  handleExport: () => string;
  handleImport: (base64: string) => boolean;
  handleWipe: () => void;
  handleManualSave: () => void;
}

export default function MenuView({
  state, selectTitle, updateSettings,
  handleExport, handleImport, handleWipe, handleManualSave,
}: MenuViewProps) {
  const [tab, setTab] = useState<'stats' | 'achievements' | 'titles' | 'settings'>('stats');
  const [importStr, setImportStr] = useState('');
  const [exportStr, setExportStr] = useState('');

  return (
    <div>
      <div className="section-header">
        <div className="section-title"><Twemoji emoji="📋" /> Menu</div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}><Twemoji emoji="📊" /> Stats</button>
        <button className={`tab ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}><Twemoji emoji="🏆" /> Achievements</button>
        <button className={`tab ${tab === 'titles' ? 'active' : ''}`} onClick={() => setTab('titles')}><Twemoji emoji="🎖️" /> Titles</button>
        <button className={`tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}><Twemoji emoji="⚙️" /> Settings</button>
      </div>

      {tab === 'stats' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{state.stats.highestWave}</div>
            <div className="stat-label">Highest Wave</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatNumber(state.stats.totalKills)}</div>
            <div className="stat-label">Total Kills</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatNumber(state.stats.totalGold)}</div>
            <div className="stat-label">Total Gold Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatNumber(state.stats.totalClicks)}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{state.stats.rebirths}</div>
            <div className="stat-label">Rebirths</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{state.stats.playerLevel}</div>
            <div className="stat-label">Player Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatTime(state.stats.timePlayed)}</div>
            <div className="stat-label">Time Played</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{state.inventory.items.length}</div>
            <div className="stat-label">Items Owned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{state.stats.totalRunesForged}</div>
            <div className="stat-label">Runes Forged</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{state.stats.totalItemsCrafted}</div>
            <div className="stat-label">Items Crafted</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{state.achievements.length}/{ACHIEVEMENTS.length}</div>
            <div className="stat-label">Achievements</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{state.runes.inventory.length}</div>
            <div className="stat-label">Runes Owned</div>
          </div>
        </div>
      )}

      {tab === 'achievements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACHIEVEMENTS.map(ach => {
            const earned = state.achievements.includes(ach.id);
            return (
              <div key={ach.id} className="glass-card" style={{
                padding: 'var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: earned ? 1 : 0.4,
                borderColor: earned ? 'var(--color-gold)' : undefined,
              }}>
                <div style={{ fontSize: 24 }}><Twemoji emoji={earned ? '🏆' : '🔒'} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{ach.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ach.description}</div>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>
                  {ach.reward.value} {ach.reward.type}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'titles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {TITLES.map(title => {
            const unlocked = state.titles.unlocked.includes(title.id);
            const selected = state.titles.selected === title.id;
            return (
              <div
                key={title.id}
                className="glass-card"
                onClick={() => { if (unlocked) selectTitle(title.id); }}
                style={{
                  padding: 'var(--space-md)',
                  textAlign: 'center',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.3,
                  borderColor: selected ? title.color : undefined,
                  boxShadow: selected ? `0 0 12px ${title.color}40` : undefined,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: title.color }}>{title.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {title.req.type}: {formatNumber(title.req.value)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Auto-scrap */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="card-title" style={{ marginBottom: 12 }}><Twemoji emoji="🗑️" /> Auto-Scrap</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, minWidth: 120 }}>Below Rarity:</span>
              <select
                value={state.settings.autoScrapRarity}
                onChange={e => updateSettings({ autoScrapRarity: e.target.value })}
                className="text-input"
                style={{ maxWidth: 200 }}
              >
                <option value="none">None</option>
                <option value="poor">Poor</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, minWidth: 120 }}>Below Tier:</span>
              <input
                type="number"
                value={state.settings.autoScrapTier}
                onChange={e => updateSettings({ autoScrapTier: parseInt(e.target.value) || 0 })}
                className="text-input"
                style={{ maxWidth: 200 }}
                min={0}
                max={100}
              />
            </div>
          </div>

          {/* Audio Settings */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="card-title" style={{ marginBottom: 12 }}><Twemoji emoji="🎵" /> Audio Settings</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 13, minWidth: 120 }}>Background Music:</span>
              <button
                className={`btn btn-sm ${state.settings.musicEnabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => updateSettings({ musicEnabled: !state.settings.musicEnabled })}
              >
                <Twemoji emoji={state.settings.musicEnabled ? '🔊 Enabled' : '🔇 Disabled'} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, minWidth: 120 }}>Music Volume:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={state.settings.musicVolume ?? 50}
                onChange={e => updateSettings({ musicVolume: parseInt(e.target.value) })}
                style={{ flex: 1, accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', minWidth: 32, textAlign: 'right' }}>
                {state.settings.musicVolume ?? 50}%
              </span>
            </div>
          </div>

          {/* Save Management */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <div className="card-title" style={{ marginBottom: 12 }}><Twemoji emoji="💾" /> Save Management</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={handleManualSave}><Twemoji emoji="💾" /> Save Now</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setExportStr(handleExport())}><Twemoji emoji="📤" /> Export</button>
            </div>
            {exportStr && (
              <div style={{ marginBottom: 12 }}>
                <textarea
                  className="text-input textarea"
                  value={exportStr}
                  readOnly
                  onClick={e => (e.target as HTMLTextAreaElement).select()}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Copy this string to back up your save.
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <input
                  className="text-input"
                  placeholder="Paste save string here..."
                  value={importStr}
                  onChange={e => setImportStr(e.target.value)}
                />
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (handleImport(importStr)) {
                    setImportStr('');
                    alert('Save imported!');
                  } else {
                    alert('Invalid save string.');
                  }
                }}
                disabled={!importStr}
              >
                <Twemoji emoji="📥" /> Import
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="card-title" style={{ color: 'var(--color-error)', marginBottom: 12 }}><Twemoji emoji="⚠️" /> Danger Zone</div>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (confirm('Are you SURE you want to delete ALL progress? This cannot be undone!')) {
                  handleWipe();
                }
              }}
            >
              <Twemoji emoji="🗑️" /> Wipe All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
