"use client";

import React, { useState } from 'react';
import type { GameState, Item } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { calculateItemPower, getItemDef, getQualityDef, getScrapValue } from '@/engine/items';
import { QUALITIES, ENCHANTS, RUNE_TYPES, MATERIALS, CHESTS, POTIONS } from '@/lib/gameConfig';
import { itemUpgradeCostGold, itemUpgradeCostDust, itemEvolveCostDust, itemEvolveCostGems, itemRefineCostGold, itemRefineCostDust, itemEnchantCostGold, itemEnchantCostDust } from '@/engine/scaling';
import Twemoji from './Twemoji';

interface InventoryViewProps {
  state: GameState;
  equipItem: (item: Item) => void;
  unequipItem: (slot: 'head' | 'body' | 'feet' | 'hand') => void;
  equipBest: () => void;
  deleteItem: (itemInstanceId: string) => void;
  upgradeItemLevel: (itemInstanceId: string) => void;
  evolveItem: (itemInstanceId: string) => void;
  refineItem: (itemInstanceId: string) => void;
  enchantItem: (itemInstanceId: string) => void;
  activateOverdrive: (itemInstanceId: string) => void;
  overdriveRefine: (itemInstanceId: string, sacrificeIds: string[]) => void;
  usePotion: (potionId: string, itemInstanceId: string) => void;
  openChest: (itemInstanceId: string) => void;
  startUnlockChest: (itemInstanceId: string) => void;
  handleSocketRune: (itemId: string, runeId: string) => void;
  handleUnsocketRune: (itemId: string, socketIndex: number) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
}

export function getTierColor(tier: number): string {
  if (tier <= 10) return '#a1a1aa'; // Tier 1-10: Zinc/Iron Grey
  if (tier <= 20) return '#f59e0b'; // Tier 11-20: Gilded/Bronze Gold
  if (tier <= 30) return '#3b82f6'; // Tier 21-30: Cobalt/Ice Blue
  if (tier <= 40) return '#10b981'; // Tier 31-40: Emerald/Nature Green
  if (tier <= 50) return '#f43f5e'; // Tier 41-50: Ruby/Fire Red-Pink
  if (tier <= 60) return '#8b5cf6'; // Tier 51-60: Amethyst/Dark Purple
  if (tier <= 70) return '#06b6d4'; // Tier 61-70: Diamond/Cyan
  if (tier <= 80) return '#f472b6'; // Tier 71-80: Celestial Pink
  if (tier <= 90) return '#eab308'; // Tier 81-90: Astral Gold
  return '#c084fc'; // Tier 91-100: Cosmic Lavender/Purple
}

export default function InventoryView({
  state, equipItem, unequipItem, equipBest, deleteItem,
  upgradeItemLevel, evolveItem, refineItem, enchantItem,
  activateOverdrive, overdriveRefine, usePotion, openChest,
  startUnlockChest, handleSocketRune, handleUnsocketRune, updateSettings,
}: InventoryViewProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [tab, setTab] = useState<'all' | 'head' | 'body' | 'feet' | 'hand' | 'consumable'>('all');
  const [sortBy, setSortBy] = useState<'tier' | 'power' | 'level' | 'quality'>('tier');

  const equippedIds = new Set(Object.values(state.inventory.equipped).filter(Boolean));

  const filteredItems = tab === 'all'
    ? state.inventory.items
    : state.inventory.items.filter(i => i.type === tab);

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aEquipped = equippedIds.has(a.instanceId) ? 1 : 0;
    const bEquipped = equippedIds.has(b.instanceId) ? 1 : 0;
    if (aEquipped !== bEquipped) return bEquipped - aEquipped;

    if (sortBy === 'tier') {
      if (b.tier !== a.tier) return b.tier - a.tier;
      return calculateItemPower(b, state) - calculateItemPower(a, state);
    }
    if (sortBy === 'power') {
      const powA = calculateItemPower(a, state);
      const powB = calculateItemPower(b, state);
      if (powB !== powA) return powB - powA;
      return b.tier - a.tier;
    }
    if (sortBy === 'level') {
      if (b.level !== a.level) return b.level - a.level;
      return b.tier - a.tier;
    }
    if (sortBy === 'quality') {
      const indexA = QUALITIES.findIndex(q => q.id === a.quality);
      const indexB = QUALITIES.findIndex(q => q.id === b.quality);
      if (indexB !== indexA) return indexB - indexA;
      return b.tier - a.tier;
    }
    return 0;
  });

  const renderItemCard = (item: Item) => {
    const isEquipped = equippedIds.has(item.instanceId);
    const quality = getQualityDef(item.quality);
    const itemDef = getItemDef(item.itemId);
    const power = calculateItemPower(item, state);
    const isChest = item.type === 'consumable' && item.itemId?.includes('chest');
    const isPotion = item.type === 'consumable' && !isChest;

    // Resolve proper names for consumables to fix raw ID displays
    let displayName = itemDef?.name || item.itemId;
    if (isChest) {
      displayName = CHESTS.find(c => c.id === item.itemId)?.name || item.itemId;
    } else if (isPotion) {
      displayName = POTIONS.find(p => p.id === item.itemId)?.name || item.itemId;
    }

    const isUnlocking = isChest && item.unlockEndTimestamp && Date.now() < item.unlockEndTimestamp;
    const isReadyToOpen = isChest && item.unlockEndTimestamp && Date.now() >= item.unlockEndTimestamp;

    return (
      <div
        key={item.instanceId}
        className={`item-card ${isEquipped ? 'equipped' : ''}`}
        onClick={() => {
          if (isChest) {
            if (!item.unlockEndTimestamp) {
              startUnlockChest(item.instanceId);
            } else if (isReadyToOpen) {
              openChest(item.instanceId);
            }
          } else if (isPotion) {
            usePotion(item.itemId, item.instanceId);
          } else {
            // Quick Salvage active -> instantly salvage gear on click
            if (state.settings.quickSalvage && !isEquipped) {
              deleteItem(item.instanceId);
            } else {
              setSelectedItem(item);
            }
          }
        }}
        style={{
          position: 'relative',
          borderLeft: (isChest || isPotion) ? undefined : `4px solid ${getTierColor(item.tier)}`
        }}
      >
        <div className="item-name" style={{ color: (isChest || isPotion) ? quality.color : getTierColor(item.tier) }}>
          {displayName}
        </div>
        {!isChest && !isPotion && (
          <>
            <div className="item-stat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Twemoji emoji={item.type === 'hand' ? '⚔️' : '🛡️'} /> {formatNumber(power)}
              </span>
              <span className="item-tier-badge" style={{ color: getTierColor(item.tier), fontWeight: 800, fontSize: 10, border: `1px solid ${getTierColor(item.tier)}`, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }}>
                Tier {item.tier}
              </span>
            </div>
            <div className="item-quality" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              {quality.name} ({item.qualityValue}%) • Lv.{item.level}
              {item.isOverdrive && <span style={{ color: '#ef4444', marginLeft: 4 }}>🔥 OVERDRIVE</span>}
            </div>
            {item.starLevel > 0 && (
              <div className="item-stars" style={{ marginTop: 2 }}>
                {Array.from({ length: item.starLevel }).map((_, idx) => (
                  <Twemoji key={idx} emoji="⭐" />
                ))}
              </div>
            )}
            {item.enchants.length > 0 && (
              <div className="item-enchants" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {item.enchants.map(eId => {
                  const e = ENCHANTS.find(en => en.id === eId);
                  return e ? (
                    <span key={eId} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Twemoji emoji="✨" />{e.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            {item.runes.filter(Boolean).length > 0 && (
              <div className="item-runes">
                {item.runes.filter(Boolean).map((runeId, i) => {
                  const rune = state.runes.inventory.find(r => r.instanceId === runeId);
                  if (!rune) return null;
                  const def = RUNE_TYPES.find(r => r.id === rune.runeId);
                  return def?.emoji ? <Twemoji key={i} emoji={def.emoji} /> : null;
                })}
              </div>
            )}
          </>
        )}
        {isChest && (
          <div className="item-stat" style={{ marginTop: 8 }}>
            {!item.unlockEndTimestamp ? (
              <button
                className="btn btn-secondary btn-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  startUnlockChest(item.instanceId);
                }}
              >
                🔓 Start Unlock
              </button>
            ) : isUnlocking ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                ⏳ Unlocking ({Math.ceil((item.unlockEndTimestamp - Date.now()) / 1000)}s)
              </span>
            ) : (
              <button
                className="btn btn-gold btn-xs animate-pulse"
                onClick={(e) => {
                  e.stopPropagation();
                  openChest(item.instanceId);
                }}
              >
                🎁 Open Cache
              </button>
            )}
          </div>
        )}
        {isPotion && <div className="item-stat"><Twemoji emoji="🧪" /> Click to use</div>}
        {isEquipped && (
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>
            EQUIPPED
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Section Header */}
      <div className="section-header">
        <div className="section-title">🎒 Inventory ({state.inventory.items.length}/200)</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Sorting Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                width: 100,
                height: 30,
                padding: '0 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 12,
                outline: 'none',
              }}
            >
              <option value="tier">Tier</option>
              <option value="power">Power</option>
              <option value="level">Level</option>
              <option value="quality">Quality</option>
            </select>
          </div>

          <button
            className={`btn btn-sm ${state.settings.quickSalvage ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => updateSettings({ quickSalvage: !state.settings.quickSalvage })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Twemoji emoji="🗑️" /> {state.settings.quickSalvage ? 'Quick: ON' : 'Quick: OFF'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={equipBest}>
            ⚡ Equip Best
          </button>
        </div>
      </div>

      {/* Equipped slots */}
      <div className="equipped-slots">
        {(['head', 'body', 'feet', 'hand'] as const).map(slot => {
          const instanceId = state.inventory.equipped[slot];
          const item = instanceId ? state.inventory.items.find(i => i.instanceId === instanceId) : null;
          const quality = item ? getQualityDef(item.quality) : null;
          const power = item ? calculateItemPower(item, state) : 0;
          const itemDef = item ? getItemDef(item.itemId) : null;
          const slotEmojis = { head: '🪖', body: '🛡️', feet: '👢', hand: '⚔️' };

          return (
            <div
              key={slot}
              className={`equip-slot ${item ? 'filled' : ''}`}
              onClick={() => { if (item) setSelectedItem(item); }}
              style={{ cursor: item ? 'pointer' : 'default' }}
            >
              <div className="slot-label">{slot}</div>
              {item ? (
                <>
                  <div style={{ fontSize: 28 }}><Twemoji emoji={slotEmojis[slot]} /></div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: item ? getTierColor(item.tier) : undefined, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                    {itemDef?.name}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {formatNumber(power)}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 28, opacity: 0.2 }}><Twemoji emoji={slotEmojis[slot]} /></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {(['all', 'head', 'body', 'feet', 'hand', 'consumable'] as const).map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? 'All' : t === 'consumable' ? <Twemoji emoji="🧪" /> : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="inventory-grid">
        {sortedItems.map(renderItemCard)}
        {sortedItems.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            No items found. Open chests to get gear!
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <ItemDetailModal
              item={selectedItem}
              state={state}
              onClose={() => setSelectedItem(null)}
              onEquip={() => { equipItem(selectedItem); setSelectedItem(null); }}
              onUnequip={() => { unequipItem(selectedItem.type as any); setSelectedItem(null); }}
              onDelete={() => { deleteItem(selectedItem.instanceId); setSelectedItem(null); }}
              onUpgrade={() => upgradeItemLevel(selectedItem.instanceId)}
              onEvolve={() => evolveItem(selectedItem.instanceId)}
              onRefine={() => refineItem(selectedItem.instanceId)}
              onEnchant={() => enchantItem(selectedItem.instanceId)}
              onOverdrive={() => activateOverdrive(selectedItem.instanceId)}
              onOverdriveRefine={(sacs) => overdriveRefine(selectedItem.instanceId, sacs)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ITEM DETAIL MODAL ───

function ItemDetailModal({
  item, state, onClose, onEquip, onUnequip, onDelete,
  onUpgrade, onEvolve, onRefine, onEnchant,
  onOverdrive, onOverdriveRefine,
}: {
  item: Item;
  state: GameState;
  onClose: () => void;
  onEquip: () => void;
  onUnequip: () => void;
  onDelete: () => void;
  onUpgrade: () => void;
  onEvolve: () => void;
  onRefine: () => void;
  onEnchant: () => void;
  onOverdrive: () => void;
  onOverdriveRefine: (sacrificeIds: string[]) => void;
}) {
  const quality = getQualityDef(item.quality);
  const itemDef = getItemDef(item.itemId);
  const power = calculateItemPower(item, state);
  const scrap = getScrapValue(item);
  const isEquipped = Object.values(state.inventory.equipped).includes(item.instanceId);

  const upgCostGold = itemUpgradeCostGold(item.level);
  const upgCostDust = itemUpgradeCostDust(item.level);
  const evoCostDust = itemEvolveCostDust(item.starLevel);
  const evoCostGems = itemEvolveCostGems(item.starLevel);
  const refCostGold = itemRefineCostGold(item.tier || 1);
  const refCostDust = itemRefineCostDust(item.tier || 1);
  const enchCostGold = itemEnchantCostGold(item.tier || 1);
  const enchCostDust = itemEnchantCostDust(item.tier || 1);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: getTierColor(item.tier) }}>
            {itemDef?.name || item.itemId}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ color: getTierColor(item.tier), fontWeight: 700, border: `1px solid ${getTierColor(item.tier)}`, padding: '1px 5px', borderRadius: 4, fontSize: 11, background: 'rgba(255,255,255,0.03)' }}>
              Tier {item.tier}
            </span>
            <span>
              {quality.name} ({item.qualityValue}%) {item.isOverdrive && <span style={{ color: '#ef4444' }}>🔥 OVERDRIVE</span>}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 16 }}>
        <div><span style={{ color: 'var(--text-muted)' }}>Power:</span> <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatNumber(power)}</span></div>
        <div><span style={{ color: 'var(--text-muted)' }}>Level:</span> Lv.{item.level}</div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Stars:</span>{' '}
          {Array.from({ length: 5 }).map((_, idx) => (
            <Twemoji key={idx} emoji="⭐" style={{ opacity: idx < item.starLevel ? 1 : 0.2 }} />
          ))}
        </div>
        <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> {item.type.toUpperCase()}</div>
        <div><span style={{ color: 'var(--text-muted)' }}>Element:</span> {itemDef?.element ? itemDef.element.toUpperCase() : '—'}</div>
      </div>

      {item.enchants.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>ENCHANTS</div>
          {item.enchants.map(eId => {
            const e = ENCHANTS.find(en => en.id === eId);
            return e ? <div key={eId} style={{ fontSize: 12, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 4 }}><Twemoji emoji="✨" /> {e.name}: {e.description}</div> : null;
          })}
        </div>
      )}

      {item.starLevel > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
            RUNE SOCKETS ({item.runes.filter(Boolean).length}/{item.starLevel})
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: item.starLevel }).map((_, i) => {
              const runeInstanceId = item.runes[i];
              const rune = runeInstanceId ? state.runes.inventory.find(r => r.instanceId === runeInstanceId) : null;
              const def = rune ? RUNE_TYPES.find(r => r.id === rune.runeId) : null;
              return (
                <div key={i} style={{
                  width: 36, height: 36,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  {def?.emoji ? <Twemoji emoji={def.emoji} /> : '◇'}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {itemDef?.perk && (
        <div style={{ fontSize: 12, color: 'var(--color-gold)', fontStyle: 'italic', marginBottom: 16, padding: '8px 12px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: 8, border: '1px solid rgba(234, 179, 8, 0.15)' }}>
          <Twemoji emoji="⚡" /> {itemDef.perk}
        </div>
      )}

      <div className="item-detail-actions">
        {isEquipped ? (
          <button className="btn btn-secondary btn-sm" onClick={onUnequip}><Twemoji emoji="🛡️" /> Unequip</button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onEquip}><Twemoji emoji="⚔️" /> Equip</button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={onUpgrade}
          disabled={state.resources.gold < upgCostGold || state.resources.dust < upgCostDust}>
          <Twemoji emoji="⬆️" /> Level ({formatNumber(upgCostGold)}g + {formatNumber(upgCostDust)}<Twemoji emoji="✨" />)
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onEvolve}
          disabled={item.starLevel >= 5 || state.resources.dust < evoCostDust || state.resources.gems < evoCostGems}>
          <Twemoji emoji="⭐" /> Evolve ({formatNumber(evoCostDust)}<Twemoji emoji="✨" /> + {evoCostGems}<Twemoji emoji="💎" />)
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onRefine}
          disabled={state.resources.gold < refCostGold || state.resources.dust < refCostDust}>
          <Twemoji emoji="🔧" /> Refine ({formatNumber(refCostGold)}g + {formatNumber(refCostDust)}<Twemoji emoji="✨" />)
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onEnchant}
          disabled={state.resources.gold < enchCostGold || state.resources.dust < enchCostDust}>
          <Twemoji emoji="✨" /> Enchant ({formatNumber(enchCostGold)}g + {formatNumber(enchCostDust)}<Twemoji emoji="✨" />)
        </button>
        {!item.isOverdrive && item.qualityValue >= 100 && (
          <button className="btn btn-gold btn-sm" onClick={onOverdrive}>
            <Twemoji emoji="🔥" /> Activate Overdrive
          </button>
        )}
        <button className="btn btn-danger btn-sm" onClick={onDelete}>
          <Twemoji emoji="🗑️" /> Salvage (+{formatNumber(scrap.gold)}g +{formatNumber(scrap.dust)}<Twemoji emoji="✨" />)
        </button>
      </div>
    </div>
  );
}
