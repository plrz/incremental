/**
 * Zikki Incremental — Pet Companion Engine
 * 
 * Pure functions for hatching, leveling, and equipping pets.
 */

import type { GameState, Pet, PetEgg } from './gameState';
import { PETS_CONFIG, PetConfigDef } from '@/lib/gameConfig';

/** Hatch weight roll helper */
function rollPetRarity(eggType: 'standard' | 'rare' | 'dungeon'): Pet['rarity'] {
  const rand = Math.random();
  if (eggType === 'standard') {
    if (rand < 0.70) return 'common';
    if (rand < 0.95) return 'rare';
    return 'epic';
  } else if (eggType === 'rare') {
    if (rand < 0.40) return 'rare';
    if (rand < 0.85) return 'epic';
    if (rand < 0.99) return 'legendary';
    return 'mythic';
  } else {
    if (rand < 0.20) return 'epic';
    if (rand < 0.70) return 'legendary';
    if (rand < 0.95) return 'mythic';
    return 'celestial';
  }
}

/** Hatching list helper */
const RARITY_MULTIPLIERS = {
  common: 1.0,
  rare: 1.5,
  epic: 2.2,
  legendary: 3.5,
  mythic: 6.0,
  celestial: 12.0,
};

/** Create a new Pet Egg */
export function createPetEgg(eggType: 'standard' | 'rare' | 'dungeon'): PetEgg {
  const wavesToHatch = eggType === 'standard' ? 50 : eggType === 'rare' ? 150 : 300;
  return {
    instanceId: crypto.randomUUID(),
    eggType,
    wavesToHatch,
  };
}

/** Hatch an egg */
export function hatchPetEgg(state: GameState, eggInstanceId: string): GameState {
  const egg = state.pets.eggs.find(e => e.instanceId === eggInstanceId);
  if (!egg) return state;

  const rarity = rollPetRarity(egg.eggType);
  
  // Pick random configured pet config
  const petConfig = PETS_CONFIG[Math.floor(Math.random() * PETS_CONFIG.length)];

  const newPet: Pet = {
    instanceId: crypto.randomUUID(),
    petId: petConfig.id,
    level: 1,
    xp: 0,
    rarity,
  };

  return {
    ...state,
    pets: {
      ...state.pets,
      eggs: state.pets.eggs.filter(e => e.instanceId !== eggInstanceId),
      inventory: [...state.pets.inventory, newPet],
    },
  };
}

/** Max active pet slots */
export function maxPetSlots(state: GameState): number {
  return Math.min(5, 1 + state.stats.ascensions);
}

/** Equip a pet */
export function equipPet(state: GameState, petInstanceId: string): GameState {
  const pet = state.pets.inventory.find(p => p.instanceId === petInstanceId);
  if (!pet) return state;

  const maxSlots = maxPetSlots(state);
  if (state.pets.active.length >= maxSlots) return state;
  if (state.pets.active.includes(petInstanceId)) return state;

  return {
    ...state,
    pets: {
      ...state.pets,
      active: [...state.pets.active, petInstanceId],
    },
  };
}

/** Unequip a pet */
export function unequipPet(state: GameState, petInstanceId: string): GameState {
  return {
    ...state,
    pets: {
      ...state.pets,
      active: state.pets.active.filter(id => id !== petInstanceId),
    },
  };
}

/** Check and level up pets, return updated list */
export function processPetTick(state: GameState, killsDelta: number): GameState {
  if (killsDelta <= 0) return state;

  // Progress eggs hatching
  const updatedEggs = state.pets.eggs.map(egg => ({
    ...egg,
    wavesToHatch: Math.max(0, egg.wavesToHatch - killsDelta),
  }));

  // Active pets gain 1 XP per kill
  // Inactive pets gain 0.1 XP per kill
  const activeSet = new Set(state.pets.active);
  const updatedInventory = state.pets.inventory.map(pet => {
    const isActive = activeSet.has(pet.instanceId);
    const xpGained = isActive ? killsDelta : killsDelta * 0.1;
    if (xpGained <= 0) return pet;

    let xp = pet.xp + xpGained;
    let level = pet.level;
    let xpNeeded = level * 100;

    while (xp >= xpNeeded) {
      xp -= xpNeeded;
      level += 1;
      xpNeeded = level * 100;
    }

    return { ...pet, level, xp };
  });

  return {
    ...state,
    pets: {
      ...state.pets,
      eggs: updatedEggs,
      inventory: updatedInventory,
    },
  };
}

/** Calculate total stat multiplier from pets */
export function calculatePetStatBonus(state: GameState, statType: PetConfigDef['statType']): number {
  let bonusMult = 1.0;
  const activePets = state.pets.active.map(id => state.pets.inventory.find(p => p.instanceId === id)).filter(Boolean) as Pet[];

  activePets.forEach(pet => {
    const config = PETS_CONFIG.find(c => c.id === pet.petId);
    if (config && config.statType === statType) {
      const rarityMult = RARITY_MULTIPLIERS[pet.rarity] || 1.0;
      const petBonus = config.baseEffectValue * pet.level * rarityMult;
      bonusMult += petBonus;
    }
  });

  return bonusMult;
}
