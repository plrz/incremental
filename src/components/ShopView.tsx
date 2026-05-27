"use client";

import React from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { CHESTS, UPGRADES, POTIONS, REBIRTH_UPGRADES, QUALITIES } from '@/lib/gameConfig';
import { upgradeCost, rebirthCost, rebirthPointsEarned, getChestCost } from '@/engine/scaling';
import { canRebirth } from '@/engine/progression';
import Twemoji from './Twemoji';

interface ShopViewProps {
  state: GameState;
  buyChest: (chestId: string) => void;
  handleUpgrade: (upgradeId: string) => void;
  handleRebirth: () => void;
  handleBuyRebirthUpgrade: (upgradeId: string) => void;
  buyBossKey: (currency: 'gold' | 'gems') => void;
  buyDungeonKey: (currency: 'gold' | 'gems' | 'boss_key') => void;
}

export interface QualityOdds {
  name: string;
  color: string;
  chance: number;
}

export function calculateQualityOdds(chestPower: number, state: GameState): QualityOdds[] {
  const luckLevel = state.upgrades.luck || 0;
  const rebirthLuck = (state.stats.rebirths || 0) * 0.05;
  const corruptionQualityBonus = 1 + (state.corruption * 0.01);
  
  const chestPowerFactor = 5 / chestPower; // standard = 1, royal = 1.67, cosmic = 3.33
  const L = (1 + (luckLevel * 0.1) + rebirthLuck) * corruptionQualityBonus * chestPowerFactor;

  const gearWeight = 0.8;
  const consumableWeight = 0.2;

  const odds: QualityOdds[] = [];

  // Consumable odds
  const legC = 1 - Math.pow(0.99, L);
  const rareC = Math.pow(0.99, L) - Math.pow(0.9, L);
  const comC = Math.pow(0.9, L);

  // Gear odds
  const gearOdds: Record<string, number> = {
    poor: Math.pow(0.10, L),
    common: Math.pow(0.50, L) - Math.pow(0.10, L),
    uncommon: Math.pow(0.70, L) - Math.pow(0.50, L),
    rare: Math.pow(0.85, L) - Math.pow(0.70, L),
    epic: Math.pow(0.94, L) - Math.pow(0.85, L),
    legendary: Math.pow(0.97, L) - Math.pow(0.94, L),
    mythic: Math.pow(0.99, L) - Math.pow(0.97, L),
    divine: Math.pow(0.995, L) - Math.pow(0.99, L),
    celestial: Math.pow(0.998, L) - Math.pow(0.995, L),
    cosmic: Math.pow(0.9995, L) - Math.pow(0.998, L),
    transcendent: 1 - Math.pow(0.9995, L),
  };

  QUALITIES.forEach(q => {
    const gearChance = (gearOdds[q.id] || 0) * gearWeight;
    let consumableChance = 0;

    if (q.id === 'common') consumableChance = comC * consumableWeight;
    if (q.id === 'rare') consumableChance = rareC * consumableWeight;
    if (q.id === 'legendary') consumableChance = legC * consumableWeight;

    const totalChance = gearChance + consumableChance;
    if (totalChance > 0.0001) {
      odds.push({
        name: q.name,
        color: q.color,
        chance: totalChance,
      });
    }
  });

  return odds;
}

export default function ShopView({
  state, buyChest, handleUpgrade, handleRebirth, handleBuyRebirthUpgrade, buyBossKey, buyDungeonKey,
}: ShopViewProps) {
  const canDoRebirth = canRebirth(state);
  const rbCost = rebirthCost(state.stats.rebirths);
  const rbPoints = rebirthPointsEarned(state.stats.highestWave, state.stats.rebirths);

  return (
    <div>
      {/* Chests */}
      <div className="section-header">
        <div className="section-title">
          <Twemoji emoji="📦" /> Chests
        </div>
      </div>
      <div className="shop-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
        {CHESTS.map(chest => {
          const cost = getChestCost(chest.id, state.stats.highestWave);
          return (
            <div
              key={chest.id}
              className="glass-card chest-card"
              onClick={() => buyChest(chest.id)}
              style={{ opacity: state.resources.gold < cost ? 0.5 : 1 }}
            >
              <span className="chest-emoji" style={{ display: 'flex', justifyContent: 'center' }}>
                <Twemoji emoji="📦" style={{ width: 48, height: 48 }} />
              </span>
              <div className="chest-name">{chest.name}</div>
              <div className="chest-desc">{chest.description}</div>
              <div className="chest-cost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                <Twemoji emoji="💰" /> {formatNumber(cost)}
              </div>
              <details className="chest-odds-details" onClick={(e) => e.stopPropagation()} style={{ width: '100%', marginTop: 8 }}>
                <summary style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', outline: 'none', textAlign: 'center' }}>
                  🔍 Quality Odds
                </summary>
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-tertiary)', borderRadius: 6, marginTop: 4 }}>
                  {calculateQualityOdds(chest.power, state).map(o => (
                    <div key={o.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                      <span style={{ color: o.color }}>{o.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{(o.chance * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          );
        })}
      </div>

      {/* Key Merchant */}
      <div className="section-header">
        <div className="section-title">
          <Twemoji emoji="🔑" /> Key Merchant
        </div>
      </div>
      
      {/* Boss Key Dealer */}
      <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ fontSize: '2rem', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Twemoji emoji="🗝️" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>Boss Key Dealer</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 450 }}>
              Need to summon the Boss Gate? Buy extra keys here.
              Gold cost scales with your highest wave reached.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => buyBossKey('gold')}
            disabled={state.resources.gold < Math.max(500, Math.floor(state.stats.highestWave * 100))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 140, justifyContent: 'center' }}
          >
            <Twemoji emoji="💰" /> {formatNumber(Math.max(500, Math.floor(state.stats.highestWave * 100)))} Gold
          </button>
          <button
            className="btn btn-primary"
            onClick={() => buyBossKey('gems')}
            disabled={state.resources.gems < 10}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 140, justifyContent: 'center' }}
          >
            <Twemoji emoji="💎" /> 10 Gems
          </button>
        </div>
      </div>

      {/* Dungeon Key Dealer */}
      <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-2xl)', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ fontSize: '2rem', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Twemoji emoji="🔑" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>Dungeon Key Dealer</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 450 }}>
              Unlock Dungeon trials to earn Crystals and eggs.
              Buy keys with gold, gems, or by trading in unused Boss Keys!
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => buyDungeonKey('gold')}
            disabled={state.resources.gold < Math.max(50000, Math.floor(state.stats.highestWave * 5000))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 140, justifyContent: 'center' }}
          >
            <Twemoji emoji="💰" /> {formatNumber(Math.max(50000, Math.floor(state.stats.highestWave * 5000)))} Gold
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => buyDungeonKey('gems')}
            disabled={state.resources.gems < 50}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 140, justifyContent: 'center' }}
          >
            <Twemoji emoji="💎" /> 50 Gems
          </button>
          <button
            className="btn btn-primary"
            onClick={() => buyDungeonKey('boss_key')}
            disabled={state.resources.bossKeys < 5}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 140, justifyContent: 'center' }}
          >
            <Twemoji emoji="🗝️" /> 5 Boss Keys
          </button>
        </div>
      </div>

      {/* Upgrades */}
      <div className="section-header">
        <div className="section-title">
          <Twemoji emoji="⬆️" /> Upgrades
        </div>
      </div>
      <div className="upgrade-list" style={{ marginBottom: 'var(--space-2xl)' }}>
        {Object.values(UPGRADES).map(upgrade => {
          const level = state.upgrades[upgrade.id as keyof typeof state.upgrades] || 0;
          const cost = upgradeCost(upgrade.baseCost, upgrade.costMultiplier, level);
          const maxed = level >= upgrade.maxLevel;
          return (
            <div key={upgrade.id} className="upgrade-row">
              <div className="upgrade-emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Twemoji emoji={upgrade.emoji} />
              </div>
              <div className="upgrade-info">
                <div className="upgrade-name">{upgrade.name}</div>
                <div className="upgrade-desc">{upgrade.description}</div>
              </div>
              <div className="upgrade-level">
                {level}/{upgrade.maxLevel}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleUpgrade(upgrade.id)}
                disabled={maxed || state.resources.gold < cost}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {maxed ? 'MAX' : (
                  <>
                    <Twemoji emoji="💰" /> {formatNumber(cost)}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Rebirth */}
      <div className="section-header">
        <div className="section-title">
          <Twemoji emoji="♻️" /> Rebirth
        </div>
      </div>
      <div className="glass-card glow" style={{ textAlign: 'center', padding: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)' }}>
        <div style={{ fontSize: 48, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <Twemoji emoji="♻️" style={{ width: 48, height: 48 }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Rebirth #{state.stats.rebirths + 1}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Reset your progress but gain permanent bonuses.
          <br />You will earn <span style={{ color: '#ec4899', fontWeight: 700 }}>{rbPoints} RP</span>.
        </div>
        <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 16 }}>
          Cost: {formatNumber(rbCost)} Gold
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleRebirth}
          disabled={!canDoRebirth}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Twemoji emoji="♻️" /> Rebirth Now
        </button>
      </div>

      {/* Rebirth Upgrades */}
      {state.stats.rebirths > 0 && (
        <>
          <div className="section-header">
            <div className="section-title">
              <Twemoji emoji="🌟" /> Rebirth Upgrades
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#ec4899', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Twemoji emoji="♻️" /> {formatNumber(state.resources.rebirthPoints)} RP
            </div>
          </div>
          <div className="upgrade-list">
            {Object.values(REBIRTH_UPGRADES).map(upgrade => {
              const level = state.rebirthUpgrades[upgrade.id] || 0;
              const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
              const maxed = level >= upgrade.maxLevel;
              return (
                <div key={upgrade.id} className="upgrade-row">
                  <div className="upgrade-emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Twemoji emoji="🌟" />
                  </div>
                  <div className="upgrade-info">
                    <div className="upgrade-name">{upgrade.name}</div>
                    <div className="upgrade-desc">{upgrade.description}</div>
                  </div>
                  <div className="upgrade-level">{level}/{upgrade.maxLevel}</div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleBuyRebirthUpgrade(upgrade.id)}
                    disabled={maxed || state.resources.rebirthPoints < cost}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {maxed ? 'MAX' : (
                      <>
                        <Twemoji emoji="♻️" /> {cost} RP
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
