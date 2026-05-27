"use client";

import React from 'react';
import type { GameState, Pet, PetEgg } from '@/engine/gameState';
import { PETS_CONFIG } from '@/lib/gameConfig';
import { maxPetSlots } from '@/engine/pets';
import Twemoji from './Twemoji';

interface PetsViewProps {
  state: GameState;
  hatchPetEggInstance: (eggInstanceId: string) => void;
  equipPetInstance: (petInstanceId: string) => void;
  unequipPetInstance: (petInstanceId: string) => void;
}

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#60a5fa',
  epic: '#c084fc',
  legendary: '#fb923c',
  mythic: '#ef4444',
  celestial: '#ec4899',
};

export default function PetsView({
  state,
  hatchPetEggInstance,
  equipPetInstance,
  unequipPetInstance,
}: PetsViewProps) {
  const { pets } = state;
  const maxSlots = maxPetSlots(state);

  const activePets = pets.active
    .map(id => pets.inventory.find(p => p.instanceId === id))
    .filter(Boolean) as Pet[];

  const renderPetCard = (pet: Pet, inSlot = false) => {
    const config = PETS_CONFIG.find(c => c.id === pet.petId);
    if (!config) return null;

    const isActive = pets.active.includes(pet.instanceId);
    const color = RARITY_COLORS[pet.rarity] || '#9ca3af';
    const xpPercent = Math.min(100, (pet.xp / (pet.level * 100)) * 100);

    return (
      <div
        key={pet.instanceId}
        style={{
          padding: 12,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 32 }}><Twemoji emoji={config.emoji} /></div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {config.name}
            </div>
            <div style={{ fontSize: 10, color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {pet.rarity} • Lv.{pet.level}
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div className="progress-bar xp" style={{ height: 4 }}>
            <div className="fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          {config.description.replace('{value}', (config.baseEffectValue * pet.level * (pet.rarity === 'common' ? 1 : pet.rarity === 'rare' ? 1.5 : pet.rarity === 'epic' ? 2.2 : pet.rarity === 'legendary' ? 3.5 : pet.rarity === 'mythic' ? 6 : 12) * 100).toFixed(1))}
        </div>

        <div style={{ marginTop: 4 }}>
          {isActive ? (
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={() => unequipPetInstance(pet.instanceId)}
            >
              Unequip
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              onClick={() => equipPetInstance(pet.instanceId)}
              disabled={pets.active.length >= maxSlots}
            >
              Equip
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="section-header">
        <div className="section-title"><Twemoji emoji="🐉" /> Pet Companion System</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Active Slots: {pets.active.length} / {maxSlots}
        </div>
      </div>

      {/* Active Slots Display */}
      <div className="glass-card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Active Companions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${maxSlots}, 1fr)`, gap: '12px' }}>
          {Array.from({ length: maxSlots }).map((_, i) => {
            const pet = activePets[i];
            if (pet) {
              const config = PETS_CONFIG.find(c => c.id === pet.petId);
              return (
                <div
                  key={pet.instanceId}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid var(--accent-primary)',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => unequipPetInstance(pet.instanceId)}
                  title="Click to unequip"
                >
                  <div style={{ fontSize: 32 }}>{config?.emoji && <Twemoji emoji={config.emoji} />}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{config?.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Lv.{pet.level}</div>
                </div>
              );
            } else {
              return (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px dashed var(--glass-border)',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 82,
                    color: 'var(--text-muted)',
                    fontSize: 11,
                  }}
                >
                  Empty Slot
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Hatching Eggs Section */}
      <div className="glass-card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Incubator</h3>
        {pets.eggs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
            No eggs currently incubating. Earn eggs in Dungeons or Boss fights!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {pets.eggs.map(egg => {
              const baseWaves = egg.eggType === 'standard' ? 50 : egg.eggType === 'rare' ? 150 : 300;
              const progress = Math.max(0, baseWaves - egg.wavesToHatch);
              const percent = (progress / baseWaves) * 100;
              const hatched = egg.wavesToHatch <= 0;

              return (
                <div
                  key={egg.instanceId}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 28 }}><Twemoji emoji="🥚" /></div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>
                        {egg.eggType.toUpperCase()} EGG
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {hatched ? 'Ready to hatch!' : `${egg.wavesToHatch} kills left`}
                      </div>
                    </div>
                  </div>

                  {!hatched && (
                    <div className="progress-bar quest" style={{ height: 4 }}>
                      <div className="fill" style={{ width: `${percent}%` }} />
                    </div>
                  )}

                  {hatched ? (
                    <button
                      className="btn btn-success btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => hatchPetEggInstance(egg.instanceId)}
                    >
                      <Twemoji emoji="✨" /> Hatch Egg
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} disabled>
                      Incubating...
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pet Inventory */}
      <div className="glass-card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>My Companions ({pets.inventory.length})</h3>
        {pets.inventory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            Hatch eggs to collect pets and earn active buffs!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {pets.inventory.map(p => renderPetCard(p))}
          </div>
        )}
      </div>
    </div>
  );
}
