"use client";

import React from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { findCombinableItems } from '@/engine/crafting';
import { canTransmute } from '@/engine/crafting';
import { CRAFTING_RECIPES, MATERIALS } from '@/lib/gameConfig';
import { getQualityDef, getItemDef } from '@/engine/items';
import Twemoji from './Twemoji';

interface CraftingViewProps {
  state: GameState;
  handleCombineItems: (ids: [string, string, string]) => void;
  handleTransmute: (recipeId: string) => void;
}

export default function CraftingView({ state, handleCombineItems, handleTransmute }: CraftingViewProps) {
  const combinable = findCombinableItems(state);
  const transmuteRecipes = CRAFTING_RECIPES.filter(r => r.category === 'transmute');

  return (
    <div>
      <div className="section-header">
        <div className="section-title"><Twemoji emoji="⚒️" /> Crafting</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {state.stats.totalItemsCrafted} items crafted
        </div>
      </div>

      {/* Crafting Materials */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-sm)' }}><Twemoji emoji="📦" /> Materials</div>
      <div className="crafting-materials">
        <div className="material-badge">
          <div className="material-name">Plating</div>
          <div className="material-count">{state.craftingMaterials.platingShards}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>from Head items</div>
        </div>
        <div className="material-badge">
          <div className="material-name">Fiber</div>
          <div className="material-count">{state.craftingMaterials.reinforcedFiber}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>from Body items</div>
        </div>
        <div className="material-badge">
          <div className="material-name">Crystals</div>
          <div className="material-count">{state.craftingMaterials.fluxCrystals}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>from Feet items</div>
        </div>
        <div className="material-badge">
          <div className="material-name">Cores</div>
          <div className="material-count">{state.craftingMaterials.essenceCores}</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>from Hand items</div>
        </div>
      </div>

      {/* Tier Synthesis */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-sm)' }}><Twemoji emoji="⬆️" /> Tier Synthesis</div>
      <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: 'var(--space-md)' }}>
        💡 <strong>Progression Tip:</strong> Tier Synthesis lets you fuse 3 unequipped gear items of the exact same slot and tier into a single item of the next tier. 
        <br />
        • The output item <strong>inherits the highest quality</strong> among the three components (e.g. 1 Epic + 2 Commons = guaranteed Epic outcome!).
        <br />
        • This allows you to <strong>bypass standard chest wave caps</strong> to get higher tier gear stats early!
      </div>

      {combinable.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', marginBottom: 'var(--space-2xl)' }}>
          No items can be combined. Need 3 unequipped items of the same type and tier.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--space-2xl)' }}>
          {combinable.map(group => {
            const nextTier = group.tier + 1;
            const material = MATERIALS[nextTier - 1];
            const bestQuality = group.items.reduce((best, item) => {
              const q = getQualityDef(item.quality);
              const bestQ = getQualityDef(best);
              return q.multiplier > bestQ.multiplier ? item.quality : best;
            }, group.items[0].quality);
            const quality = getQualityDef(bestQuality);

            return (
              <div key={`${group.type}_${group.tier}`} className="glass-card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>
                    3× T{group.tier} {group.type} → <span style={{ color: 'var(--color-health)' }}>T{nextTier} {material?.name || ''} {group.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: quality.color }}>
                    Quality: {quality.name}
                  </div>
                </div>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    const ids = group.items.slice(0, 3).map(i => i.instanceId) as [string, string, string];
                    handleCombineItems(ids);
                  }}
                >
                  <Twemoji emoji="⚒️" /> Craft
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Transmutation */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-sm)' }}><Twemoji emoji="🔄" /> Transmutation</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
        Convert crafting materials between types at a 3:1 ratio.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
        {transmuteRecipes.map(recipe => {
          const can = canTransmute(state, recipe.id);
          return (
            <div key={recipe.id} className="glass-card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{recipe.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{recipe.description}</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleTransmute(recipe.id)}
                disabled={!can}
              >
                <Twemoji emoji="🔄" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
