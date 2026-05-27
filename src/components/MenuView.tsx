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
  const [tab, setTab] = useState<'stats' | 'achievements' | 'titles' | 'settings' | 'help'>('stats');
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
        <button className={`tab ${tab === 'help' ? 'active' : ''}`} onClick={() => setTab('help')}><Twemoji emoji="❓" /> Help Guide</button>
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

      {tab === 'help' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <Twemoji emoji="🛡️" /> Dungeon Trial Keys
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Dungeon Keys are used to enter the challenge Dungeons located in the **Endgame** tab. You can acquire Dungeon Keys in a few ways:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0 16px', lineHeight: '1.4' }}>
              <li><strong>Boss Drops:</strong> Defeating any Boss in the main Combat waves has a 20% chance to drop a Dungeon Key. Standard Boss Gate fights (every 50 waves) have a 100% guaranteed drop!</li>
              <li><strong>Key Merchant:</strong> Visit the Key Merchant in the **Shop** tab. You can buy Dungeon Keys with Gold, Gems, or by trading in 5 Boss Keys.</li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <Twemoji emoji="⏳" /> Time Crystals & Time Rifts
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Time Crystals are precious temporal gems. They are earned by completing Dungeon runs (clearing wave 10 in a Dungeon).
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '8px' }}>
              Use Time Crystals in the **Endgame ➔ Time Rifts** tab to tear open spacetime rifts:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0 16px', lineHeight: '1.4' }}>
              <li><strong>Minor Rift:</strong> 2x tick speed boost for 30 minutes.</li>
              <li><strong>Major Rift:</strong> 5x tick speed boost for 15 minutes.</li>
              <li><strong>Temporal Storm:</strong> 10x tick speed boost for 10 minutes.</li>
            </ul>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '8px' }}>
              <em>Note: Speed rifts accelerate combat ticks, egg hatching, worker DPS ticks, and active skill cooldowns!</em>
            </p>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <Twemoji emoji="💀" /> Purity Orbs & Corruption
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Purity Orbs are gained from completing Dungeons (1-3 orbs depending on tier) or by summoning and defeating World Bosses (+5 orbs).
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '8px' }}>
              Purity Orbs have two primary uses:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0 16px', lineHeight: '1.4' }}>
              <li><strong>Cleanse Corruption:</strong> Every 50 waves cleared, the game's corruption level increases. Higher corruption boosts enemy HP, damage, and gear drops but cuts gold rewards. Cleanse 25% corruption using 1 Purity Orb in the **Endgame ➔ Corruption** tab.</li>
              <li><strong>Purity Altar Exchange:</strong> Trade Purity Orbs at the Altar (Corruption subtab) for Time Crystals, Rare Eggs, Dungeon Eggs, permanent Rune pouch capacity slots, Gems, or Stardust!</li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <Twemoji emoji="🐉" /> Pets & Companions
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Pets are hatched from eggs that drop upon completing Dungeons. Hatching requires defeating monsters (kills) in active combat. Once hatched, equip them to gain massive multipliers to click damage, gold, XP, stardust, or worker DPS.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '8px' }}>
              To equip more pets simultaneously, purchase the <strong>Tamer</strong> rebirth upgrade in the **Shop** tab. This expands active slots up to a maximum of 5. Further slots are unlocked permanently by Ascending!
            </p>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <Twemoji emoji="⬆️" /> Tier Synthesis Crafting
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Synthesis is a powerful crafting option in the **Craft** tab:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0 16px', lineHeight: '1.4' }}>
              <li>Combine 3 unequipped gear items of the exact same slot and tier (e.g., 3 Tier 4 weapons).</li>
              <li>Fusing them yields 1 item of the next tier (e.g., a Tier 5 weapon).</li>
              <li><strong>Loot Cap Bypass:</strong> The tier dropped by standard chests is capped by your highest wave reached. Fusing items allows you to access higher tier stats early!</li>
              <li><strong>Inherited Quality:</strong> The synthesized output item is guaranteed to inherit the highest quality of the three components. (For example, fusing 1 Epic and 2 Common items guarantees an Epic outcome!)</li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <Twemoji emoji="👛" /> Runes & Forge Cap
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Runes can be socketed into your gear to grant powerful element-aligned attributes.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '8px' }}>
              Your base rune pouch capacity is capped at 50 runes. You can increase this cap permanently by:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0 16px', lineHeight: '1.4' }}>
              <li>Upgrading the **Rune Pouch** in the Upgrades shop (uses Gold, up to +100 slots).</li>
              <li>Exchanging Purity Orbs at the **Purity Altar** in the Endgame corruption tab (+10 slots per exchange, unlimited).</li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <Twemoji emoji="♻️" /> Rebirth & Ascension Prestige
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              When progress slows down, it is time to prestige:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 0 16px', lineHeight: '1.4' }}>
              <li><strong>Rebirth:</strong> Spend gold to rebirth, resetting gold and items but awarding Rebirth Points (RP). Rebirth Points scale quadratically with your wave depth, and are multiplied by your total rebirth count. Spend RP on powerful permanent upgrades in the shop.</li>
              <li><strong>Ascension:</strong> Reaching 50,000 Rebirth Points unlocks the option to Ascend. This resets Rebirth progression but awards Ascension Points (AP). AP is spent on meta perks like Factions, Offline efficiency boosts, and passive research multipliers!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
