"use client";

import React, { useState } from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { RUNE_TYPES } from '@/lib/gameConfig';
import { canForgeRune, runeForgeRequirements, findCombinableRunes, getRuneDef } from '@/engine/runes';
import Twemoji from './Twemoji';

interface RuneForgeViewProps {
  state: GameState;
  handleForgeRune: (runeId: string) => void;
  handleCombineRunes: (ids: [string, string, string]) => void;
}

export default function RuneForgeView({ state, handleForgeRune, handleCombineRunes }: RuneForgeViewProps) {
  const [tab, setTab] = useState<'forge' | 'inventory' | 'combine'>('forge');
  const combinable = findCombinableRunes(state);

  // Check which runes are socketed
  const socketedIds = new Set<string>();
  state.inventory.items.forEach(item => {
    item.runes.forEach(id => { if (id) socketedIds.add(id); });
  });

  return (
    <div>
      <div className="section-header">
        <div className="section-title"><Twemoji emoji="🔮" /> Rune Forge</div>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {state.runes.inventory.length}/{state.runes.maxSlots} runes
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'forge' ? 'active' : ''}`} onClick={() => setTab('forge')}><Twemoji emoji="🔨" /> Forge</button>
        <button className={`tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}><Twemoji emoji="📦" /> Inventory</button>
        <button className={`tab ${tab === 'combine' ? 'active' : ''}`} onClick={() => setTab('combine')}>
          <Twemoji emoji="🔄" /> Combine {combinable.length > 0 && `(${combinable.length})`}
        </button>
      </div>

      {tab === 'forge' && (
        <div className="rune-grid">
          {RUNE_TYPES.map(rune => {
            const cost = runeForgeRequirements(rune, 1);
            const canForge = canForgeRune(state, rune.id);

            return (
              <div key={rune.id} className="glass-card rune-card" style={{ borderColor: canForge ? rune.color : undefined }}>
                <div className="rune-emoji"><Twemoji emoji={rune.emoji} /></div>
                <div className="rune-name" style={{ color: rune.color }}>{rune.name}</div>
                <div className="rune-desc">
                  {rune.description.replace('{value}', String(rune.baseValue))}
                </div>
                {rune.setBonus3 && (
                  <div style={{ fontSize: 10, color: 'var(--color-gold)', margin: '4px 0' }}>
                    3-set: {rune.setBonus3.name}
                  </div>
                )}
                <div className="rune-cost">
                  {formatNumber(cost.dust)} <Twemoji emoji="✨" /> + {cost.gems} <Twemoji emoji="💎" />
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleForgeRune(rune.id)}
                  disabled={!canForge}
                  style={{ width: '100%' }}
                >
                  <Twemoji emoji="🔨" /> Forge
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'inventory' && (
        <div className="rune-inventory-grid">
          {state.runes.inventory.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              No runes yet. Forge some in the Forge tab!
            </div>
          ) : (
            state.runes.inventory.map(rune => {
              const def = getRuneDef(rune.runeId);
              if (!def) return null;
              const isSocketed = socketedIds.has(rune.instanceId);
              return (
                <div key={rune.instanceId} className="rune-inventory-item" style={{
                  borderColor: isSocketed ? def.color : undefined,
                  opacity: isSocketed ? 0.6 : 1,
                }}>
                  <div style={{ fontSize: 20 }}><Twemoji emoji={def.emoji} /></div>
                  <div style={{ fontWeight: 700, color: def.color }}>{def.name}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Lv.{rune.level}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    +{def.baseValue * rune.level}% {def.statType}
                  </div>
                  {isSocketed && <div style={{ fontSize: 9, color: 'var(--accent-primary)' }}>SOCKETED</div>}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'combine' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {combinable.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              No runes to combine. Need 3 of the same type and level (not socketed).
            </div>
          ) : (
            combinable.map(group => {
              const def = getRuneDef(group.runeId);
              if (!def) return null;
              return (
                <div key={`${group.runeId}_${group.level}`} className="glass-card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ fontSize: 20 }}><Twemoji emoji={def.emoji} /></div>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: def.color }}>3× {def.name} Lv.{group.level}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      → {def.name} Lv.{group.level + 1} (+{def.baseValue * (group.level + 1)}%)
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleCombineRunes(
                      group.instances.slice(0, 3).map(r => r.instanceId) as [string, string, string]
                    )}
                  >
                    <Twemoji emoji="🔄" /> Combine
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
