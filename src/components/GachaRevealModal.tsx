"use client";

import React, { useState, useEffect } from 'react';
import type { GameState, Item } from '@/engine/gameState';
import { getQualityDef, getItemDef, calculateItemPower } from '@/engine/items';
import { sounds } from '@/lib/sound';
import { formatNumber } from '@/lib/formatters';
import Twemoji from './Twemoji';
import { CHESTS, POTIONS } from '@/lib/gameConfig';

interface GachaRevealModalProps {
  reveal: {
    item: Item;
    isAutoScrapped: boolean;
    scrapGold: number;
    scrapDust: number;
    chestName: string;
    chestId: string;
  };
  state: GameState;
  onClose: () => void;
}

export default function GachaRevealModal({ reveal, state, onClose }: GachaRevealModalProps) {
  const { item, isAutoScrapped, scrapGold, scrapDust, chestName } = reveal;
  const [phase, setPhase] = useState<'shaking' | 'revealed'>('shaking');

  const quality = getQualityDef(item.quality);
  const itemDef = getItemDef(item.itemId);
  const power = calculateItemPower(item, state);

  const isChest = item.type === 'consumable' && item.itemId?.includes('chest');
  const isPotion = item.type === 'consumable' && !isChest;

  let displayName = itemDef?.name || item.itemId;
  if (isChest) {
    displayName = CHESTS.find(c => c.id === item.itemId)?.name || item.itemId;
  } else if (isPotion) {
    displayName = POTIONS.find(p => p.id === item.itemId)?.name || item.itemId;
  }

  // Auto-reveal transition after chest shaking duration (1.2s)
  useEffect(() => {
    if (phase === 'shaking') {
      const timer = setTimeout(() => {
        setPhase('revealed');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Trigger reveal sounds when transitions to revealed
  useEffect(() => {
    if (phase === 'revealed') {
      sounds.playReveal(item.quality);
    }
  }, [phase, item.quality]);

  // Handle manual click skip/reveal
  const handleContainerClick = () => {
    if (phase === 'shaking') {
      setPhase('revealed');
    }
  };

  const getRarityBackground = () => {
    const qColor = quality?.color || '#a855f7';
    return `radial-gradient(circle at center, ${qColor}40 0%, transparent 70%)`;
  };

  const getChestEmoji = () => {
    if (reveal.chestId === 'cosmic_chest') return '🔮';
    if (reveal.chestId === 'royal_chest') return '👑';
    return '📦';
  };

  return (
    <div className="gacha-overlay" onClick={handleContainerClick}>
      {/* Dynamic CSS animations injected directly */}
      <style>{`
        .gacha-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(16px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          cursor: pointer;
        }

        .gacha-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
        }

        /* Ambient glowing background */
        .gacha-ambient-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          z-index: -1;
          transition: all 0.8s ease;
        }

        /* Rotating rays of light */
        .gacha-rays {
          position: absolute;
          width: 500px;
          height: 500px;
          background: repeating-conic-gradient(
            from 0deg,
            rgba(255,255,255,0) 0deg 15deg,
            rgba(255,255,255,0.04) 15deg 30deg
          );
          border-radius: 50%;
          animation: gacha-spin 20s linear infinite;
          z-index: -2;
        }

        .chest-anim-shaking {
          font-size: 110px;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
          animation: gacha-shake 0.15s ease infinite;
        }

        .chest-anim-opened {
          font-size: 120px;
          filter: drop-shadow(0 15px 30px rgba(0,0,0,0.8));
          animation: gacha-burst 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        /* 3D Flipping Card */
        .gacha-card-reveal {
          width: 320px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid ${quality?.color || 'var(--glass-border)'};
          box-shadow: 0 0 32px ${quality?.color || '#a855f7'}33, inset 0 0 16px ${quality?.color || '#a855f7'}11;
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(24px);
          animation: gacha-card-entry 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          transform-style: preserve-3d;
        }

        .gacha-auto-scrapped-banner {
          margin-top: 16px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px dashed rgba(239, 68, 68, 0.3);
          color: #f87171;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
        }

        .gacha-auto-scrapped-banner.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px dashed rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .gacha-stars-display {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin: 10px 0;
        }

        @keyframes gacha-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes gacha-shake {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(-4px, 2px) rotate(-3deg) scale(1.03); }
          50% { transform: translate(3px, -1px) rotate(2deg) scale(1.01); }
          75% { transform: translate(-2px, -3px) rotate(-1deg) scale(1.05); }
          100% { transform: translate(2px, 2px) rotate(1.5deg) scale(1); }
        }

        @keyframes gacha-burst {
          0% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.4); filter: brightness(2.5) blur(1px); }
          100% { transform: scale(0); opacity: 0; }
        }

        @keyframes gacha-card-entry {
          0% { transform: scale(0.4) rotateY(-90deg); opacity: 0; filter: brightness(3); }
          50% { filter: brightness(1.5); }
          100% { transform: scale(1) rotateY(0deg); opacity: 1; filter: brightness(1); }
        }

        .gacha-glow-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: ${quality?.color || '#fff'};
          border-radius: 50%;
          box-shadow: 0 0 10px ${quality?.color || '#fff'};
          opacity: 0.7;
          pointer-events: none;
        }
      `}</style>

      <div className="gacha-container" onClick={e => e.stopPropagation()}>
        {/* Glow & light ray animations */}
        <div
          className="gacha-ambient-glow"
          style={{
            background: phase === 'shaking' ? 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 60%)' : getRarityBackground(),
          }}
        />
        {phase === 'revealed' && <div className="gacha-rays" />}

        {phase === 'shaking' ? (
          <div>
            <div className="chest-anim-shaking">
              <Twemoji emoji={getChestEmoji()} style={{ width: 120, height: 120 }} />
            </div>
            <div style={{ marginTop: 24, fontSize: 16, fontWeight: 700, color: 'var(--color-gold)', letterSpacing: 1 }}>
              OPENING {chestName.toUpperCase()}...
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 8 }}>
              Click anywhere to skip
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
              Chest Unlocked!
            </div>

            {/* Revealed Item Card */}
            <div className="gacha-card-reveal">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: quality.color }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: 11, color: quality.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {quality.name} ({item.qualityValue}%)
                  </div>
                </div>
                <div style={{ fontSize: 24, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                  <Twemoji emoji={item.type === 'hand' ? '⚔️' : item.type === 'head' ? '🪖' : item.type === 'body' ? '🛡️' : item.type === 'feet' ? '👢' : '🧪'} />
                </div>
              </div>

              {/* Power / Stats badge */}
              <div style={{ margin: '16px 0', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Item Power</div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {formatNumber(power)}
                </div>
              </div>

              {/* Detail list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Slot:</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tier:</span>
                  <span style={{ fontWeight: 600 }}>T{item.tier}</span>
                </div>
                {itemDef?.element && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Element:</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{itemDef.element}</span>
                  </div>
                )}
                {itemDef?.perk && (
                  <div style={{ fontSize: 11, color: 'var(--color-gold)', fontStyle: 'italic', marginTop: 8, padding: '6px 8px', background: 'rgba(234, 179, 8, 0.05)', borderRadius: 6, border: '1px solid rgba(234, 179, 8, 0.1)' }}>
                    ⚡ {itemDef.perk}
                  </div>
                )}
              </div>

              {/* Auto scrapped banner */}
              {isAutoScrapped && (
                <div className="gacha-auto-scrapped-banner">
                  <Twemoji emoji="♻️" /> Auto-salvaged: +{formatNumber(scrapGold)}g, +{formatNumber(scrapDust)}✨
                </div>
              )}
            </div>

            {/* Collect action button */}
            <button
              className="btn btn-primary btn-lg"
              style={{
                marginTop: 24,
                width: '200px',
                boxShadow: `0 8px 24px ${quality?.color || '#a855f7'}44`,
                animation: 'pulse 2s infinite',
              }}
              onClick={onClose}
            >
              Collect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
