/**
 * Zikki Incremental — Complete Game Configuration
 * 
 * All game data, constants, and static config.
 * Organized by system. No React components or side effects.
 */

// ============================================================
// MATERIALS (100 tiers)
// ============================================================

export interface MaterialDef {
  name: string;
  tier: number;
  armorPerk: string;
  swordPerk: string;
  element: string;
}

const ELEMENT_MAP: Record<number, string> = {
  0: 'fire', 1: 'ice', 2: 'lightning', 3: 'nature', 4: 'dark', 5: 'holy',
};

function getElement(tier: number): string {
  if (tier <= 17) return 'fire';
  if (tier <= 33) return 'ice';
  if (tier <= 50) return 'lightning';
  if (tier <= 67) return 'nature';
  if (tier <= 83) return 'dark';
  return 'holy';
}

const RAW_MATERIALS: Omit<MaterialDef, 'element'>[] = [
  { name: "Copper", tier: 1, armorPerk: "High weight, low protection.", swordPerk: "Very heavy, dull edge; low crit rate." },
  { name: "Iron", tier: 2, armorPerk: "Standard protection; easy to repair.", swordPerk: "Reliable; standard swing speed." },
  { name: "Bronze", tier: 3, armorPerk: "Pliable: Slightly better arrow resistance.", swordPerk: "Heavy Impact: Higher knockback." },
  { name: "Steel", tier: 4, armorPerk: "Balanced; reduces stamina cost.", swordPerk: "Sharpened: Increased critical hit damage." },
  { name: "Silver", tier: 5, armorPerk: "Purity: Resistance to Undead/Cursed damage.", swordPerk: "Purge: 2x damage against Vampires/Ghosts." },
  { name: "Gilded Iron", tier: 6, armorPerk: "Resonance: Increases Mana regeneration.", swordPerk: "Arcane Edge: Low magic damage on hit." },
  { name: "Meteorite", tier: 7, armorPerk: "Density: High resistance to knockback.", swordPerk: "Ignition: Small chance to Burn on hit." },
  { name: "Obsidian", tier: 8, armorPerk: "Heat Sink: High Fire/Magma resistance.", swordPerk: "Jagged: High Bleed chance; very fragile." },
  { name: "Cobalt", tier: 9, armorPerk: "Lightweight: Increases movement speed.", swordPerk: "Swift: Faster attack animation speed." },
  { name: "Mythril", tier: 10, armorPerk: "Weightless: No stamina penalty for sprinting.", swordPerk: "Thrust: Higher armor penetration." },
  { name: "Orichalcum", tier: 11, armorPerk: "Reflective: Small chance to reflect spells.", swordPerk: "Lifesteal: Heals wearer for 1% of damage." },
  { name: "Adamantite", tier: 12, armorPerk: "Unyielding: Higher overall physical defense.", swordPerk: "Sunder: Breaks enemy shields/guards faster." },
  { name: "Ebony", tier: 13, armorPerk: "Shadow Veil: Harder to detect while sneaking.", swordPerk: "Executioner: Extra damage to low-HP foes." },
  { name: "Dragon-Iron", tier: 14, armorPerk: "Aura: Nearby enemies take minor fire damage.", swordPerk: "Dragon-Breath: Heavy fire elemental damage." },
  { name: "Crystalite", tier: 15, armorPerk: "Mana Battery: Stores magic for a shield burst.", swordPerk: "Beam: Fires a projectile at full health." },
  { name: "Void-Ore", tier: 16, armorPerk: "Phase: Small chance to dodge (teleport) hits.", swordPerk: "Abyssal: Ignores 50% of enemy defense." },
  { name: "Living Metal", tier: 17, armorPerk: "Regen: Slowly repairs itself and the wearer.", swordPerk: "Adaptation: Damage type shifts to enemy weakness." },
  { name: "Etherium", tier: 18, armorPerk: "Flight: Low-gravity jump; hover capability.", swordPerk: "Ghost Blade: Can hit enemies through walls." },
  { name: "Neutronium", tier: 19, armorPerk: "Gravity: Creates a 'Heavy' field that slows foes.", swordPerk: "Collapsing: Hits cause small gravity implosions." },
  { name: "Zenith Gold", tier: 20, armorPerk: "Godhood: Massive boosts to all attributes.", swordPerk: "True Strike: Never misses; deals 'Pure' damage." },
  { name: "Star-Core Iron", tier: 21, armorPerk: "Radiance: Blinds nearby enemies on hit.", swordPerk: "Supernova: Crits cause a 5m AOE explosion." },
  { name: "Pulsar Shard", tier: 22, armorPerk: "Timed Barrier: Blocks 100% damage every 10s.", swordPerk: "High Frequency: Ignores all enemy block/parry." },
  { name: "Nebula Silk", tier: 23, armorPerk: "Weightless: 0 weight; double jump unlocked.", swordPerk: "Luminous: Blade grows longer with every hit." },
  { name: "Quasar Lead", tier: 24, armorPerk: "Inertia: Physical attacks cannot slow you down.", swordPerk: "Gravity Well: Pulls enemies toward the point of impact." },
  { name: "Event Horizon", tier: 25, armorPerk: "Singularity: Absorbs projectiles into mana.", swordPerk: "Spaghettification: Slows enemy attack speed by 50%." },
  { name: "Magma-Heart", tier: 26, armorPerk: "Revenge: Reflects 25% of damage as Fire.", swordPerk: "Volcanic: Every 5th hit spawns a lava pillar." },
  { name: "Glacial Cryo-Ore", tier: 27, armorPerk: "Frost Aura: Freezes enemies that touch you.", swordPerk: "Shatter: Deals 3x damage to frozen targets." },
  { name: "Storm-Silver", tier: 28, armorPerk: "Conductive: Lightning strikes attackers.", swordPerk: "Chain-Bolt: Attacks jump to 3 nearby targets." },
  { name: "Terra-Stone", tier: 29, armorPerk: "Stonewall: Massive health regeneration.", swordPerk: "Fissure: Ground slams create earthquakes." },
  { name: "Aetherite", tier: 30, armorPerk: "Spirit Form: Dash through enemies/walls.", swordPerk: "Soul-Bind: Slain enemies fight for you for 5s." },
  { name: "Chronomium", tier: 31, armorPerk: "Rewind: Fatal hits reset your HP to 5s ago.", swordPerk: "Haste: Each hit increases attack speed by 5%." },
  { name: "Warp-Steel", tier: 32, armorPerk: "Blink: Randomly teleports you away from danger.", swordPerk: "Rift-Cut: Attacks hit enemies from a distance." },
  { name: "Paradox Ore", tier: 33, armorPerk: "Probability: 10% chance to take 0 damage.", swordPerk: "Dual-Hit: Attacks hit twice simultaneously." },
  { name: "Null-Matter", tier: 34, armorPerk: "Stasis: Silences all enemy special abilities.", swordPerk: "Erasure: Removes all enemy buffs on hit." },
  { name: "Continuum Brass", tier: 35, armorPerk: "Echo: After-images mimic your movements.", swordPerk: "Timeless: Damage is dealt instantly over 1s." },
  { name: "Willpower", tier: 36, armorPerk: "Resolve: Defense increases as health drops.", swordPerk: "Drive: Damage increases with your combo count." },
  { name: "Memory Shard", tier: 37, armorPerk: "Adaptation: Gains resistance to the last hit.", swordPerk: "Recall: Can repeat the last skill used for free." },
  { name: "Nightmare Fuel", tier: 38, armorPerk: "Terror: Enemies flee when they see you.", swordPerk: "Vampiric: Heals for 10% of total damage." },
  { name: "Logic Metal", tier: 39, armorPerk: "Optimization: Reduces all cooldowns by 30%.", swordPerk: "Calculated: Crits are guaranteed on weak points." },
  { name: "Chaos-Essence", tier: 40, armorPerk: "Entropy: Randomly swaps armor resistances.", swordPerk: "Unpredictable: Randomly changes damage type." },
  { name: "Nexus Crystal", tier: 41, armorPerk: "Link: Shares damage with nearby enemies.", swordPerk: "Multicast: Fires 3 magic bolts per swing." },
  { name: "Fractal Lead", tier: 42, armorPerk: "Infinite: Armor health never depletes.", swordPerk: "Infinite Edge: Sword never loses durability." },
  { name: "Void-Walker", tier: 43, armorPerk: "Invisibility: Hidden until you take action.", swordPerk: "Eclipse: Blinds the entire screen for 1s on crit." },
  { name: "Reality-Splinter", tier: 44, armorPerk: "Mirror: Projectiles are reflected back at 2x.", swordPerk: "Split: Sword splits into two while attacking." },
  { name: "Omega-Iron", tier: 45, armorPerk: "Execution: Kills any non-boss under 20% HP.", swordPerk: "Finality: Deals more damage for every empty slot." },
  { name: "Code-Strand", tier: 46, armorPerk: "Bug: Enemies occasionally 'glitch' and miss.", swordPerk: "Script: Kills grant 2x XP and Gold." },
  { name: "Origin-Stone", tier: 47, armorPerk: "Rebirth: Instant respawn at location of death.", swordPerk: "Genesis: Hits spawn permanent friendly minions." },
  { name: "Existence-Clay", tier: 48, armorPerk: "Malleable: Can mimic any lower tier's perk.", swordPerk: "Mastery: Use any weapon skill in the game." },
  { name: "The End", tier: 49, armorPerk: "Oblivion: Immune to all status effects.", swordPerk: "Eraser: Hits permanently delete minor enemies." },
  { name: "Developer's Alloy", tier: 50, armorPerk: "Admin Mode: 99% damage reduction.", swordPerk: "One-Tap: Deals 999,999 'True Damage'." },
  { name: "Quantum Foam", tier: 51, armorPerk: "Superposition: Exists in two places; 50% dodge.", swordPerk: "Entanglement: Hits one enemy, damages all of that type." },
  { name: "Strong Force Lead", tier: 52, armorPerk: "Inseparable: Armor cannot be removed or broken.", swordPerk: "Atomic Split: Crits cause nuclear mini-explosions." },
  { name: "Tachyon Glass", tier: 53, armorPerk: "Precognition: See enemy intent before they move.", swordPerk: "Retroactive: Damage is dealt before the swing lands." },
  { name: "Antimatter", tier: 54, armorPerk: "Annihilation: Contact deals massive DMG to foes.", swordPerk: "Delete: Removes 5% of a boss's Max HP per hit." },
  { name: "Dark Energy", tier: 55, armorPerk: "Expansion: Your hitbox for collecting loot is 10x.", swordPerk: "Acceleration: Sword gets faster the longer you swing." },
  { name: "Strange Matter", tier: 56, armorPerk: "Conversion: Changes incoming DMG into healing.", swordPerk: "Infection: Enemies hit turn into Strange Matter." },
  { name: "Neutron Star Crust", tier: 57, armorPerk: "Weight: You are immune to all knockback/CC.", swordPerk: "Pressure: Enemies are flattened (stunned) on hit." },
  { name: "Hyper-String", tier: 58, armorPerk: "Vibration: Walk through thin walls and fences.", swordPerk: "Dimensional Cut: Hits enemies in different rooms." },
  { name: "White Hole Core", tier: 59, armorPerk: "Repulsion: Enemies literally cannot get near you.", swordPerk: "Overflow: Heals you for 100% of damage dealt." },
  { name: "Singularity Steel", tier: 60, armorPerk: "Gravity Mastery: You can fly and pull loot to you.", swordPerk: "Black Hole: Slain enemies collapse into a vacuum." },
  { name: "Pixel Dust", tier: 61, armorPerk: "Transparency: You can turn into a 2D sprite.", swordPerk: "Resolution: Each hit increases game brightness/clarity." },
  { name: "Save-State Shard", tier: 62, armorPerk: "Reset: Death sends you back 30s with full HP.", swordPerk: "Reload: Resets all ability cooldowns on a kill." },
  { name: "Buffer Iron", tier: 63, armorPerk: "No-Lag: Your animations can never be interrupted.", swordPerk: "Input Read: Sword parries automatically." },
  { name: "Glitch-Vein", tier: 64, armorPerk: "Corrupt: Enemies that hit you might despawn.", swordPerk: "Randomize: Changes enemy drops to high-tier loot." },
  { name: "UI Crystal", tier: 65, armorPerk: "Overhead: See enemy HP, Mana, and Weaknesses.", swordPerk: "Target Lock: Sword 'teleports' to the nearest foe." },
  { name: "Scripted Gold", tier: 66, armorPerk: "Plot Armor: You cannot die during boss fights.", swordPerk: "Main Character: Dialogue options always succeed." },
  { name: "Frame-Rate Ore", tier: 67, armorPerk: "Slow-Mo: The world slows down when you dodge.", swordPerk: "Multi-Frame: One swing counts as 60 hits." },
  { name: "Beta-Metal", tier: 68, armorPerk: "Unfinished: You can clip through the floor at will.", swordPerk: "Debug: Instantly kills any 'Glitch' or 'Error' mob." },
  { name: "Easter Egg Alloy", tier: 69, armorPerk: "Secret: Find hidden doors and invisible chests.", swordPerk: "Meme Strike: Hits play funny sound effects and stun." },
  { name: "Source Code", tier: 70, armorPerk: "Hardcode: You can change your own stat numbers.", swordPerk: "Rewrite: Change an enemy's faction to 'Friendly'." },
  { name: "Olympian Bolt", tier: 71, armorPerk: "Thunder-Step: Sprinting leaves lightning trails.", swordPerk: "Smite: Calls down a bolt of 10,000 DMG." },
  { name: "Valhallan Mead", tier: 72, armorPerk: "Drunken Master: Dodge increases with 'Chaos'.", swordPerk: "Einherjar: Summons ghost warriors to help you." },
  { name: "Yggdrasil Root", tier: 73, armorPerk: "Life-Tree: You heal all nearby allies constantly.", swordPerk: "Rooted: Enemies hit are stuck to the ground." },
  { name: "Styx-Mud", tier: 74, armorPerk: "Invulnerable: Only your 'heel' is a weak point.", swordPerk: "Soul-Reap: Permanently increases DMG per kill." },
  { name: "Ragnarok Ash", tier: 75, armorPerk: "Doomsday: Armor burns brighter as you take DMG.", swordPerk: "World-Eater: Sword grows to the size of the screen." },
  { name: "Nirvana Silk", tier: 76, armorPerk: "Peace: Passive mobs will never attack you.", swordPerk: "Enlightenment: Ignores all physical/magic armor." },
  { name: "Karma Chrome", tier: 77, armorPerk: "Return: 100% of damage taken is dealt back.", swordPerk: "Balance: Deals more DMG to 'Evil' aligned foes." },
  { name: "Atlas Marble", tier: 78, armorPerk: "Strength: You can carry infinite inventory.", swordPerk: "Heaven-Lifter: Can parry island-sized attacks." },
  { name: "Tartarus Chain", tier: 79, armorPerk: "Shackles: Enemies cannot flee or teleport away.", swordPerk: "Punishment: Damage multiplies on the same target." },
  { name: "Creator's Breath", tier: 80, armorPerk: "Ascension: You gain a permanent golden halo/wings.", swordPerk: "Genesis: Can create life (NPCs) out of thin air." },
  { name: "Light-Matter", tier: 81, armorPerk: "Speed of Light: Infinite movement speed.", swordPerk: "Photon: Sword travels instantly; no travel time." },
  { name: "Pure Silence", tier: 82, armorPerk: "Inaudible: Enemies cannot hear or track you.", swordPerk: "Mute: Hits prevent enemies from using magic." },
  { name: "Absolute Zero", tier: 83, armorPerk: "Stasis: Time stops for 1s when you are hit.", swordPerk: "Freeze-Frame: Stops enemy AI entirely on hit." },
  { name: "Infinite Geometry", tier: 84, armorPerk: "Fractal: You take 0.0001% DMG from all sources.", swordPerk: "Edge-Point: Sword has infinite sharpness." },
  { name: "Entropy Essence", tier: 85, armorPerk: "Decay: Nearby enemy armor rots away.", swordPerk: "Dust: Slain enemies turn to piles of sand." },
  { name: "Probability Gold", tier: 86, armorPerk: "Luck: Every hit you land is a Critical Hit.", swordPerk: "Jackpot: Every kill drops the rarest item possible." },
  { name: "Memory of All", tier: 87, armorPerk: "Legacy: Gain every perk of Tiers 1–50.", swordPerk: "Mastery: Sword adapts to any weapon type." },
  { name: "The Void Below", tier: 88, armorPerk: "Erasure: Projectiles that touch you vanish.", swordPerk: "Nullify: Deletes enemy projectiles on swing." },
  { name: "The Peak Above", tier: 89, armorPerk: "Authority: Low-level enemies die just by looking.", swordPerk: "Verdict: Instantly kills anything with lower level." },
  { name: "True Unity", tier: 90, armorPerk: "Oneness: You and the sword are one entity.", swordPerk: "Mind-Blade: Attacks by thinking; sword flies solo." },
  { name: "The Fourth Wall", tier: 91, armorPerk: "Perspective: You can see the 'Player's' room.", swordPerk: "Meta-Strike: Attacks hit the enemy's UI/Menu." },
  { name: "Developer's Coffee", tier: 92, armorPerk: "Burn: You are permanently at 200% speed.", swordPerk: "Crunch: Deals massive DMG but uses 'Stamina'." },
  { name: "Unused Asset", tier: 93, armorPerk: "Invisibility: You are a missing texture (purple/black).", swordPerk: "Glitch-Cutter: Deals 'NaN' (Not a Number) damage." },
  { name: "Legacy Code", tier: 94, armorPerk: "Old School: Reverts the game to 8-bit mode.", swordPerk: "One-Shot: Traditional 'Kill' command on hit." },
  { name: "The Archive", tier: 95, armorPerk: "Knowledge: You know where every item is.", swordPerk: "History: Sword grows stronger for every hour played." },
  { name: "Digital Soul", tier: 96, armorPerk: "Immortal: Your save file cannot be deleted.", swordPerk: "Vibe-Check: Enemies hit become 'Chilled Out'." },
  { name: "The Credits", tier: 97, armorPerk: "Finality: Names of devs scroll on your armor.", swordPerk: "The End: Enemies hit play their 'Death' animation." },
  { name: "The User's Will", tier: 98, armorPerk: "Focus: Armor changes color based on your mood.", swordPerk: "Click: Sword acts like a Mouse Cursor (Select/Delete)." },
  { name: "Aspiration", tier: 99, armorPerk: "Hope: You cannot be defeated while 'Trying'.", swordPerk: "Dream-Blade: Deals damage based on your imagination." },
  { name: "The Game", tier: 100, armorPerk: "The End: You become the game's executable file.", swordPerk: "Uninstall: (Joke) Deletes the target from the folder." },
];

export const MATERIALS: MaterialDef[] = RAW_MATERIALS.map(m => ({
  ...m,
  element: getElement(m.tier),
}));

// ============================================================
// ELEMENTS
// ============================================================

export interface ElementDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
  strongAgainst: string;
  weakAgainst: string;
}

export const ELEMENTS: ElementDef[] = [
  { id: 'fire', name: 'Fire', emoji: '🔥', color: '#ef4444', strongAgainst: 'ice', weakAgainst: 'holy' },
  { id: 'ice', name: 'Ice', emoji: '🧊', color: '#3b82f6', strongAgainst: 'lightning', weakAgainst: 'fire' },
  { id: 'lightning', name: 'Lightning', emoji: '⚡', color: '#eab308', strongAgainst: 'nature', weakAgainst: 'ice' },
  { id: 'nature', name: 'Nature', emoji: '🌿', color: '#22c55e', strongAgainst: 'dark', weakAgainst: 'lightning' },
  { id: 'dark', name: 'Dark', emoji: '💀', color: '#a855f7', strongAgainst: 'holy', weakAgainst: 'nature' },
  { id: 'holy', name: 'Holy', emoji: '✨', color: '#f59e0b', strongAgainst: 'fire', weakAgainst: 'dark' },
];

// ============================================================
// ITEM QUALITIES
// ============================================================

export interface QualityDef {
  id: string;
  name: string;
  multiplier: number;
  color: string;
  borderColor: string;
  glowColor: string;
}

export const QUALITIES: QualityDef[] = [
  { id: "poor", name: "Poor", multiplier: 0.8, color: "#6b7280", borderColor: "#4b5563", glowColor: "transparent" },
  { id: "common", name: "Common", multiplier: 1.0, color: "#d1d5db", borderColor: "#9ca3af", glowColor: "transparent" },
  { id: "uncommon", name: "Uncommon", multiplier: 1.2, color: "#4ade80", borderColor: "#22c55e", glowColor: "rgba(34,197,94,0.2)" },
  { id: "rare", name: "Rare", multiplier: 1.5, color: "#60a5fa", borderColor: "#3b82f6", glowColor: "rgba(59,130,246,0.25)" },
  { id: "epic", name: "Epic", multiplier: 2.0, color: "#c084fc", borderColor: "#a855f7", glowColor: "rgba(168,85,247,0.3)" },
  { id: "legendary", name: "Legendary", multiplier: 3.0, color: "#fb923c", borderColor: "#f97316", glowColor: "rgba(249,115,22,0.35)" },
  { id: "mythic", name: "Mythic", multiplier: 5.0, color: "#ef4444", borderColor: "#dc2626", glowColor: "rgba(239,68,68,0.35)" },
  { id: "divine", name: "Divine", multiplier: 8.0, color: "#22d3ee", borderColor: "#06b6d4", glowColor: "rgba(6,182,212,0.4)" },
  { id: "celestial", name: "Celestial", multiplier: 12.0, color: "#ec4899", borderColor: "#db2777", glowColor: "rgba(219,39,119,0.4)" },
  { id: "cosmic", name: "Cosmic", multiplier: 20.0, color: "#818cf8", borderColor: "#6366f1", glowColor: "rgba(99,102,241,0.45)" },
  { id: "transcendent", name: "Transcendent", multiplier: 50.0, color: "#fde68a", borderColor: "#fbbf24", glowColor: "rgba(251,191,36,0.5)" },
];

// ============================================================
// ENCHANTS
// ============================================================

export interface EnchantDef {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'all';
  statMod?: { damage?: number; defense?: number };
  effect?: string;
}

export const ENCHANTS: EnchantDef[] = [
  { id: "sharpness", name: "Sharpness", description: "+10% Damage", type: "weapon", statMod: { damage: 1.1 } },
  { id: "protection", name: "Protection", description: "+10% Defense", type: "armor", statMod: { defense: 1.1 } },
  { id: "vampire", name: "Vampire", description: "Lifesteal on hit", type: "weapon", effect: "lifesteal" },
  { id: "midas", name: "Midas", description: "+20% Gold Drops", type: "all", effect: "gold" },
  { id: "fury", name: "Fury", description: "+15% Attack Speed", type: "weapon", statMod: { damage: 1.15 } },
  { id: "fortify", name: "Fortify", description: "+15% Defense", type: "armor", statMod: { defense: 1.15 } },
  { id: "elemental", name: "Elemental", description: "+20% Elemental Damage", type: "weapon", statMod: { damage: 1.2 } },
  { id: "thorns", name: "Thorns", description: "Reflect 10% damage", type: "armor", effect: "thorns" },
];

// ============================================================
// ITEM DEFINITIONS (generated from materials)
// ============================================================

export interface ItemDef {
  id: string;
  name: string;
  damage?: number;
  defense?: number;
  cost: number;
  type: 'head' | 'body' | 'feet' | 'hand';
  perk: string;
  tier: number;
  element: string;
}

export const HELMETS: ItemDef[] = MATERIALS.map((m, i) => ({
  id: `helmet_${i}`,
  name: `${m.name} Helmet`,
  defense: Math.floor(2 * Math.pow(1.4, i)),
  cost: Math.floor(30 * Math.pow(1.7, i)),
  type: 'head' as const,
  perk: m.armorPerk,
  tier: m.tier,
  element: m.element,
}));

export const CHESTPLATES: ItemDef[] = MATERIALS.map((m, i) => ({
  id: `chest_${i}`,
  name: `${m.name} Chestplate`,
  defense: Math.floor(5 * Math.pow(1.4, i)),
  cost: Math.floor(50 * Math.pow(1.7, i)),
  type: 'body' as const,
  perk: m.armorPerk,
  tier: m.tier,
  element: m.element,
}));

export const BOOTS: ItemDef[] = MATERIALS.map((m, i) => ({
  id: `boots_${i}`,
  name: `${m.name} Boots`,
  defense: Math.floor(2 * Math.pow(1.4, i)),
  cost: Math.floor(30 * Math.pow(1.7, i)),
  type: 'feet' as const,
  perk: m.armorPerk,
  tier: m.tier,
  element: m.element,
}));

export const WEAPONS: ItemDef[] = MATERIALS.map((m, i) => ({
  id: `weapon_${i}`,
  name: `${m.name} Sword`,
  damage: Math.floor(3 * Math.pow(1.4, i)),
  cost: Math.floor(25 * Math.pow(1.7, i)),
  type: 'hand' as const,
  perk: m.swordPerk,
  tier: m.tier,
  element: m.element,
}));

export const ALL_ITEMS: ItemDef[] = [...HELMETS, ...CHESTPLATES, ...BOOTS, ...WEAPONS];

// ============================================================
// CHESTS
// ============================================================

export interface ChestDef {
  id: string;
  name: string;
  cost: number;
  power: number; // Lower = better drops
  description: string;
}

export const CHESTS: ChestDef[] = [
  { id: "standard_chest", name: "Novice Cache", cost: 1000, power: 5, description: "Common loot, rare treasures." },
  { id: "royal_chest", name: "Gilded Strongbox", cost: 100000, power: 3, description: "Balanced mix of gear." },
  { id: "cosmic_chest", name: "Astral Reliquary", cost: 10000000, power: 1.5, description: "High chance for legendary items." },
];

// ============================================================
// WORKERS / ARMY
// ============================================================

export interface WorkerDef {
  id: string;
  name: string;
  dps: number;
  cost: number;
  description: string;
  emoji: string;
}

export const WORKERS: WorkerDef[] = [
  { id: "peasant", name: "Peasant", dps: 1, cost: 10, description: "A simple helper.", emoji: "👤" },
  { id: "squire", name: "Squire", dps: 5, cost: 100, description: "Carries your gear.", emoji: "🛡️" },
  { id: "soldier", name: "Soldier", dps: 20, cost: 500, description: "Trained fighter.", emoji: "⚔️" },
  { id: "archer", name: "Archer", dps: 50, cost: 2000, description: "Ranged support.", emoji: "🏹" },
  { id: "knight", name: "Knight", dps: 150, cost: 8000, description: "Heavy hitter.", emoji: "🗡️" },
  { id: "mage", name: "Mage", dps: 500, cost: 30000, description: "Magic damage.", emoji: "🔮" },
  { id: "berserker", name: "Berserker", dps: 2000, cost: 150000, description: "Unstoppable force.", emoji: "🪓" },
  { id: "paladin", name: "Paladin", dps: 10000, cost: 1000000, description: "Holy warrior.", emoji: "👑" },
  { id: "dragon_tamer", name: "Dragon Tamer", dps: 50000, cost: 5000000, description: "Commands dragons.", emoji: "🐉" },
  { id: "void_walker", name: "Void Walker", dps: 250000, cost: 25000000, description: "Steps through shadows.", emoji: "👻" },
  { id: "time_keeper", name: "Time Keeper", dps: 1000000, cost: 100000000, description: "Manipulates time.", emoji: "⏳" },
  { id: "reality_bender", name: "Reality Bender", dps: 10000000, cost: 1000000000, description: "Reshapes existence.", emoji: "⭐" },
  { id: "celestial_architect", name: "Celestial Architect", dps: 50000000, cost: 10000000000, description: "Builds stars.", emoji: "🔨" },
  { id: "void_monarch", name: "Void Monarch", dps: 250000000, cost: 100000000000, description: "Rules the abyss.", emoji: "💀" },
  { id: "entropy_herald", name: "Entropy Herald", dps: 1000000000, cost: 1000000000000, description: "Brings the end.", emoji: "🌀" },
  { id: "cosmic_devourer", name: "Cosmic Devourer", dps: 5000000000, cost: 10000000000000, description: "Eats galaxies.", emoji: "🌌" },
];

// ============================================================
// ENEMIES
// ============================================================

export interface EnemyDef {
  name: string;
  hpMult: number;
  goldMult: number;
  emoji: string;
}

export const ENEMIES: EnemyDef[] = [
  { name: "Slime", hpMult: 1, goldMult: 1, emoji: "🟢" },
  { name: "Rat", hpMult: 1.2, goldMult: 1.2, emoji: "🐀" },
  { name: "Goblin", hpMult: 1.5, goldMult: 1.5, emoji: "👺" },
  { name: "Wolf", hpMult: 1.8, goldMult: 1.8, emoji: "🐺" },
  { name: "Orc", hpMult: 2.5, goldMult: 2.5, emoji: "👹" },
  { name: "Skeleton", hpMult: 4, goldMult: 4, emoji: "💀" },
  { name: "Zombie", hpMult: 5, goldMult: 5, emoji: "🧟" },
  { name: "Troll", hpMult: 8, goldMult: 8, emoji: "🧌" },
  { name: "Ogre", hpMult: 10, goldMult: 10, emoji: "👾" },
  { name: "Ghost", hpMult: 12, goldMult: 12, emoji: "👻" },
  { name: "Vampire", hpMult: 15, goldMult: 15, emoji: "🧛" },
  { name: "Dragon", hpMult: 20, goldMult: 20, emoji: "🐉" },
  { name: "Demon", hpMult: 25, goldMult: 25, emoji: "😈" },
  { name: "Lich", hpMult: 30, goldMult: 30, emoji: "☠️" },
];

export interface EnemyModifierDef {
  id: string;
  name: string;
  prefix: string;
  statMod: { hp?: number; dmg?: number; gold?: number };
  color: string;
  emoji: string;
}

export const ENEMY_MODIFIERS: EnemyModifierDef[] = [
  { id: 'tank', name: 'Tank', prefix: 'Armored', statMod: { hp: 1.5, dmg: 0.8 }, color: '#6b7280', emoji: '🛡️' },
  { id: 'deadly', name: 'Deadly', prefix: 'Fierce', statMod: { hp: 0.8, dmg: 1.5 }, color: '#ef4444', emoji: '⚔️' },
  { id: 'rich', name: 'Rich', prefix: 'Golden', statMod: { hp: 1.2, gold: 2.0 }, color: '#eab308', emoji: '💰' },
  { id: 'boss', name: 'Boss', prefix: 'Giant', statMod: { hp: 3.0, dmg: 1.5, gold: 5.0 }, color: '#a855f7', emoji: '👑' },
  { id: 'swift', name: 'Swift', prefix: 'Quick', statMod: { hp: 0.7, dmg: 1.2 }, color: '#3b82f6', emoji: '⚡' },
  { id: 'cursed', name: 'Cursed', prefix: 'Cursed', statMod: { hp: 2.0, dmg: 2.0, gold: 3.0 }, color: '#7c3aed', emoji: '😈' },
];

// ============================================================
// DROPS
// ============================================================

export interface DropDef {
  id: string;
  name: string;
  chance: number;
  emoji: string;
  value: number;
}

export const DROPS: DropDef[] = [
  { id: "gem", name: "Gem", chance: 0.05, emoji: "💎", value: 1 },
  { id: "gold_bag", name: "Bag of Gold", chance: 0.1, emoji: "💰", value: 50 },
  { id: "boss_key", name: "Boss Key", chance: 0.001, emoji: "🔑", value: 1 },
  { id: "dust", name: "Stardust", chance: 0.02, emoji: "✨", value: 10 },
];

export const CHEST_DROP_CHANCE = 0.01;

// ============================================================
// POTIONS
// ============================================================

export interface PotionDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'instant' | 'timed';
  duration?: number;
  effect: { type: string; value: number };
  emoji: string;
}

export const POTIONS: PotionDef[] = [
  { id: "health", name: "Elixir of Vitality", description: "Restore 50% HP", cost: 50, type: "instant", effect: { type: "heal", value: 0.5 }, emoji: "❤️" },
  { id: "strength", name: "Elixir of Might", description: "2x DMG for 2 mins", cost: 200, type: "timed", duration: 120, effect: { type: "damage", value: 2 }, emoji: "💪" },
];

// ============================================================
// UPGRADES
// ============================================================

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  emoji: string;
}

export const UPGRADES: Record<string, UpgradeDef> = {
  attackSpeed: { id: "attackSpeed", name: "Haste", description: "Reduces attack cooldown by 5%", baseCost: 50, costMultiplier: 1.5, maxLevel: 20, emoji: "⚡" },
  autoClicker: { id: "autoClicker", name: "Auto-Attacker", description: "Automatically attacks every 1s", baseCost: 100, costMultiplier: 2.0, maxLevel: 10, emoji: "🤖" },
  luck: { id: "luck", name: "Fortune", description: "Increases drop chance & quality", baseCost: 200, costMultiplier: 1.8, maxLevel: 10, emoji: "🍀" },
  enchantChance: { id: "enchantChance", name: "Mysticism", description: "+5% chance for items to be enchanted", baseCost: 500, costMultiplier: 2.0, maxLevel: 5, emoji: "🔮" },
  chestDropChance: { id: "chestDropChance", name: "Scavenger", description: "+1% chance for enemies to drop chests", baseCost: 1000, costMultiplier: 2.5, maxLevel: 5, emoji: "📦" },
  goldInterest: { id: "goldInterest", name: "Investment", description: "Gain 0.1% of current gold every minute", baseCost: 5000, costMultiplier: 3.0, maxLevel: 5, emoji: "📈" },
  criticalStrike: { id: "criticalStrike", name: "Precision", description: "+2% Critical Strike Chance (2x Dmg)", baseCost: 300, costMultiplier: 1.6, maxLevel: 10, emoji: "🎯" },
  offlineProgress: { id: "offlineProgress", name: "Time Bank", description: "Increases offline progress cap by 1 hour", baseCost: 1000, costMultiplier: 2.0, maxLevel: 5, emoji: "🕐" },
  chestSlots: { id: "chestSlots", name: "Keyring", description: "Allows unlocking +1 cache simultaneously per level", baseCost: 5000, costMultiplier: 4.0, maxLevel: 9, emoji: "🔑" },
  chestUnlockSpeed: { id: "chestUnlockSpeed", name: "Locksmith", description: "Reduces cache unlock duration by 10%", baseCost: 2000, costMultiplier: 2.2, maxLevel: 8, emoji: "🔓" },
  autoSkill: { id: "autoSkill", name: "Auto-Caster", description: "Unlocks auto-casting of active skills (toggle in Combat)", baseCost: 15000, costMultiplier: 3.0, maxLevel: 1, emoji: "🔮" },
  dpsMultiplier: { id: "dpsMultiplier", name: "War Academy", description: "Increases worker DPS by 15% per level", baseCost: 1500, costMultiplier: 1.8, maxLevel: 20, emoji: "🏫" },
  clickDmgMultiplier: { id: "clickDmgMultiplier", name: "Sharpening Stone", description: "Increases click damage by 15% per level", baseCost: 800, costMultiplier: 1.7, maxLevel: 25, emoji: "🪨" },
  goldMultiplier: { id: "goldMultiplier", name: "Bounty Hunter", description: "Increases gold from kills by 10% per level", baseCost: 1000, costMultiplier: 1.9, maxLevel: 20, emoji: "🎯" },
  xpMultiplier: { id: "xpMultiplier", name: "Scholar", description: "Increases XP gained by 15% per level", baseCost: 500, costMultiplier: 1.6, maxLevel: 20, emoji: "📖" },
  bossKeyChance: { id: "bossKeyChance", name: "Keymaster", description: "Increases Boss Key drop chance by 20% per level", baseCost: 3000, costMultiplier: 2.5, maxLevel: 5, emoji: "🗝️" },
  gemDropChance: { id: "gemDropChance", name: "Gemologist", description: "Increases Gem drop chance by 10% per level", baseCost: 5000, costMultiplier: 2.3, maxLevel: 5, emoji: "💎" },
  runeCap: { id: "runeCap", name: "Rune Pouch", description: "Increases rune storage by +10 slots per level", baseCost: 2000, costMultiplier: 2.2, maxLevel: 10, emoji: "👛" },
};

// ============================================================
// REBIRTH
// ============================================================

export const REBIRTH_REQ = 1000000;
export const REBIRTH_BONUS = 0.5;
export const REBIRTH_GOLD_BONUS = 0.1;
export const REBIRTH_LUCK_BONUS = 0.05;

export interface RebirthUpgradeDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effect: (level: number) => number;
}

export const REBIRTH_UPGRADES: Record<string, RebirthUpgradeDef> = {
  starterGold: { id: "starterGold", name: "Inheritance", description: "Start with +10,000 Gold per level", baseCost: 1, costMultiplier: 1.5, maxLevel: 50, effect: (level) => level * 10000 },
  gemLuck: { id: "gemLuck", name: "Gem Finder", description: "+1% Chance for Gem Drops", baseCost: 5, costMultiplier: 2.0, maxLevel: 10, effect: (level) => level * 0.01 },
  bossSlayer: { id: "bossSlayer", name: "Boss Slayer", description: "+10% Damage to Bosses", baseCost: 3, costMultiplier: 1.8, maxLevel: 20, effect: (level) => 1 + (level * 0.1) },
  xpBoost: { id: "xpBoost", name: "Knowledge", description: "+20% Experience Gain", baseCost: 2, costMultiplier: 1.6, maxLevel: 25, effect: (level) => 1 + (level * 0.2) },
  retainWave: { id: "retainWave", name: "Memory", description: "Start at 5% of your highest wave per level", baseCost: 10, costMultiplier: 2.5, maxLevel: 10, effect: (level) => level * 0.05 },
  maxPets: { id: "maxPets", name: "Tamer", description: "+1 Max Active Pet Slot per level", baseCost: 10, costMultiplier: 3.5, maxLevel: 4, effect: (level) => level },
};

// ============================================================
// SKILLS
// ============================================================

export interface SkillDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  unlockWave: number;
  emoji: string;
  color: string;
}

export const SKILLS: SkillDef[] = [
  { id: "heavy_strike", name: "Heavy Strike", description: "Deal 500% Damage instantly.", cooldown: 10, unlockWave: 5, emoji: "⚔️", color: "#ef4444" },
  { id: "rage", name: "Rage", description: "Double Attack Speed for 5s.", cooldown: 30, unlockWave: 15, emoji: "🔥", color: "#f97316" },
  { id: "heal", name: "Heal", description: "Restore 50% Max HP.", cooldown: 20, unlockWave: 10, emoji: "💚", color: "#22c55e" },
  { id: "midas_touch", name: "Midas Touch", description: "Next kill gives 10x Gold.", cooldown: 60, unlockWave: 25, emoji: "💰", color: "#eab308" },
];

// ============================================================
// SKILL TREE
// ============================================================

export interface SkillTreeNodeDef {
  id: string;
  name: string;
  description: string;
  branch: 'warrior' | 'commander' | 'arcane';
  tier: number;        // 1-5 (determines position in tree)
  maxLevel: number;
  costPerLevel: number; // Skill points per level
  requires?: string;   // Parent node ID
  effect: {
    type: string;
    valuePerLevel: number;
  };
  isKeystone: boolean; // Keystones unlock new abilities
}

export const SKILL_TREE_NODES: SkillTreeNodeDef[] = [
  // ─── WARRIOR BRANCH ───
  { id: "w_sharpEdge", name: "Sharp Edge", description: "+5% Click Damage per level", branch: "warrior", tier: 1, maxLevel: 10, costPerLevel: 1, effect: { type: "clickDamage", valuePerLevel: 0.05 }, isKeystone: false },
  { id: "w_critMastery", name: "Crit Mastery", description: "+3% Crit Chance per level", branch: "warrior", tier: 1, maxLevel: 10, costPerLevel: 1, effect: { type: "critChance", valuePerLevel: 0.03 }, isKeystone: false },
  { id: "w_brutalForce", name: "Brutal Force", description: "+10% Crit Damage per level", branch: "warrior", tier: 2, maxLevel: 10, costPerLevel: 2, requires: "w_sharpEdge", effect: { type: "critDamage", valuePerLevel: 0.10 }, isKeystone: false },
  { id: "w_multiStrike", name: "Multi-Strike", description: "+5% chance to hit twice per level", branch: "warrior", tier: 2, maxLevel: 5, costPerLevel: 2, requires: "w_critMastery", effect: { type: "multiHit", valuePerLevel: 0.05 }, isKeystone: false },
  { id: "w_cleave", name: "Cleave", description: "Each click hits ALL enemies in the wave", branch: "warrior", tier: 3, maxLevel: 1, costPerLevel: 10, requires: "w_brutalForce", effect: { type: "cleave", valuePerLevel: 1 }, isKeystone: true },
  { id: "w_berserkerRage", name: "Berserker Rage", description: "+2% damage per 1% missing HP", branch: "warrior", tier: 3, maxLevel: 5, costPerLevel: 3, requires: "w_multiStrike", effect: { type: "berserker", valuePerLevel: 0.02 }, isKeystone: false },
  { id: "w_deathBlow", name: "Death Blow", description: "+20% damage to enemies below 30% HP", branch: "warrior", tier: 4, maxLevel: 5, costPerLevel: 4, requires: "w_cleave", effect: { type: "execute", valuePerLevel: 0.20 }, isKeystone: false },
  { id: "w_bladestorm", name: "Bladestorm", description: "Unlock Bladestorm skill: Hit all enemies 20 times in 2s", branch: "warrior", tier: 5, maxLevel: 1, costPerLevel: 25, requires: "w_deathBlow", effect: { type: "unlockSkill", valuePerLevel: 1 }, isKeystone: true },

  // ─── COMMANDER BRANCH ───
  { id: "c_inspiration", name: "Inspiration", description: "+5% Worker DPS per level", branch: "commander", tier: 1, maxLevel: 10, costPerLevel: 1, effect: { type: "workerDps", valuePerLevel: 0.05 }, isKeystone: false },
  { id: "c_economics", name: "Economics", description: "+5% Gold Gain per level", branch: "commander", tier: 1, maxLevel: 10, costPerLevel: 1, effect: { type: "goldGain", valuePerLevel: 0.05 }, isKeystone: false },
  { id: "c_bulkHire", name: "Bulk Hire", description: "-3% Worker cost per level", branch: "commander", tier: 2, maxLevel: 10, costPerLevel: 2, requires: "c_inspiration", effect: { type: "workerCostReduction", valuePerLevel: 0.03 }, isKeystone: false },
  { id: "c_taxCollector", name: "Tax Collector", description: "+10% Gold from Quests per level", branch: "commander", tier: 2, maxLevel: 5, costPerLevel: 2, requires: "c_economics", effect: { type: "questGold", valuePerLevel: 0.10 }, isKeystone: false },
  { id: "c_rally", name: "Rally", description: "Unlock Rally skill: Workers gain 2x DPS for 60s", branch: "commander", tier: 3, maxLevel: 1, costPerLevel: 10, requires: "c_bulkHire", effect: { type: "unlockSkill", valuePerLevel: 1 }, isKeystone: true },
  { id: "c_warChest", name: "War Chest", description: "+2% Gold Interest rate per level", branch: "commander", tier: 3, maxLevel: 5, costPerLevel: 3, requires: "c_taxCollector", effect: { type: "goldInterest", valuePerLevel: 0.02 }, isKeystone: false },
  { id: "c_logistics", name: "Logistics", description: "+10% Offline Progress efficiency per level", branch: "commander", tier: 4, maxLevel: 5, costPerLevel: 4, requires: "c_rally", effect: { type: "offlineEfficiency", valuePerLevel: 0.10 }, isKeystone: false },
  { id: "c_empire", name: "Empire", description: "Workers gain compound scaling: 1.01^totalWorkers bonus", branch: "commander", tier: 5, maxLevel: 1, costPerLevel: 25, requires: "c_logistics", effect: { type: "compoundWorkers", valuePerLevel: 1 }, isKeystone: true },

  // ─── ARCANE BRANCH ───
  { id: "a_focus", name: "Focus", description: "-5% Skill Cooldowns per level", branch: "arcane", tier: 1, maxLevel: 10, costPerLevel: 1, effect: { type: "cooldownReduction", valuePerLevel: 0.05 }, isKeystone: false },
  { id: "a_spellPower", name: "Spell Power", description: "+10% Skill Damage per level", branch: "arcane", tier: 1, maxLevel: 10, costPerLevel: 1, effect: { type: "skillDamage", valuePerLevel: 0.10 }, isKeystone: false },
  { id: "a_overcharge", name: "Overcharge", description: "+5% chance to double skill effect", branch: "arcane", tier: 2, maxLevel: 5, costPerLevel: 2, requires: "a_focus", effect: { type: "doubleSkill", valuePerLevel: 0.05 }, isKeystone: false },
  { id: "a_runeAffinity", name: "Rune Affinity", description: "+5% Rune power per level", branch: "arcane", tier: 2, maxLevel: 10, costPerLevel: 2, requires: "a_spellPower", effect: { type: "runePower", valuePerLevel: 0.05 }, isKeystone: false },
  { id: "a_manaShield", name: "Mana Shield", description: "Absorb 10% damage as a shield per level", branch: "arcane", tier: 3, maxLevel: 5, costPerLevel: 3, requires: "a_overcharge", effect: { type: "manaShield", valuePerLevel: 0.10 }, isKeystone: false },
  { id: "a_meteor", name: "Meteor", description: "Unlock Meteor skill: Nuke wave for 10,000x damage", branch: "arcane", tier: 3, maxLevel: 1, costPerLevel: 10, requires: "a_runeAffinity", effect: { type: "unlockSkill", valuePerLevel: 1 }, isKeystone: true },
  { id: "a_enchantMaster", name: "Enchant Master", description: "+10% Enchant Power per level", branch: "arcane", tier: 4, maxLevel: 5, costPerLevel: 4, requires: "a_meteor", effect: { type: "enchantPower", valuePerLevel: 0.10 }, isKeystone: false },
  { id: "a_singularity", name: "Singularity", description: "Unlock Singularity: Freeze all enemies for 10s", branch: "arcane", tier: 5, maxLevel: 1, costPerLevel: 25, requires: "a_enchantMaster", effect: { type: "unlockSkill", valuePerLevel: 1 }, isKeystone: true },
];

// ============================================================
// RUNE SYSTEM
// ============================================================

export interface RuneDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  statType: string;
  baseValue: number; // Per level
  setBonus3?: { name: string; description: string };
  setBonus5?: { name: string; description: string };
  craftCost: {
    dust: number;
    gems: number;
  };
}

export const RUNE_TYPES: RuneDef[] = [
  {
    id: "ruby", name: "Ruby Rune", description: "+{value}% Damage", emoji: "🔴", color: "#ef4444",
    statType: "damage", baseValue: 3,
    setBonus3: { name: "Ignite", description: "Enemies take 5% burn DOT" },
    setBonus5: { name: "Inferno", description: "25% chance for 3x damage" },
    craftCost: { dust: 500, gems: 5 },
  },
  {
    id: "sapphire", name: "Sapphire Rune", description: "+{value}% Defense", emoji: "🔵", color: "#3b82f6",
    statType: "defense", baseValue: 3,
    setBonus3: { name: "Fortress", description: "10% damage reduction" },
    setBonus5: { name: "Bulwark", description: "25% damage reflection" },
    craftCost: { dust: 500, gems: 5 },
  },
  {
    id: "emerald", name: "Emerald Rune", description: "+{value}% Gold Gain", emoji: "🟢", color: "#22c55e",
    statType: "goldGain", baseValue: 5,
    setBonus3: { name: "Prosperity", description: "+50% gold from all sources" },
    setBonus5: { name: "Midas Empire", description: "Gold drops are doubled" },
    craftCost: { dust: 500, gems: 5 },
  },
  {
    id: "diamond", name: "Diamond Rune", description: "+{value}% Crit Damage", emoji: "💠", color: "#e5e7eb",
    statType: "critDamage", baseValue: 5,
    setBonus3: { name: "Precision", description: "+10% Crit Chance" },
    setBonus5: { name: "Devastation", description: "Crits deal 5x instead of 2x" },
    craftCost: { dust: 750, gems: 8 },
  },
  {
    id: "amethyst", name: "Amethyst Rune", description: "-{value}% Skill Cooldowns", emoji: "🟣", color: "#a855f7",
    statType: "cooldownReduction", baseValue: 2,
    setBonus3: { name: "Haste", description: "Skills are 20% stronger" },
    setBonus5: { name: "Arcane Mastery", description: "50% chance to not trigger cooldown" },
    craftCost: { dust: 750, gems: 8 },
  },
  {
    id: "onyx", name: "Onyx Rune", description: "+{value}% Worker DPS", emoji: "⚫", color: "#374151",
    statType: "workerDps", baseValue: 4,
    setBonus3: { name: "Legion", description: "+25% Worker DPS" },
    setBonus5: { name: "Hive Mind", description: "Workers gain 1% DPS per worker owned" },
    craftCost: { dust: 500, gems: 5 },
  },
  {
    id: "prismatic", name: "Prismatic Rune", description: "+{value}% to a random stat (2x power)", emoji: "🌈", color: "linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)",
    statType: "random", baseValue: 6,
    craftCost: { dust: 2000, gems: 25 },
  },
];

// ============================================================
// CRAFTING RECIPES
// ============================================================

export interface CraftingRecipeDef {
  id: string;
  name: string;
  description: string;
  category: 'combine' | 'transmute' | 'legendary';
  ingredients: {
    type: string; // 'item' | 'material' | 'rune'
    subtype?: string;
    count: number;
    minTier?: number;
  }[];
  result: {
    type: string;
    tierBonus?: number;
    guaranteedQuality?: string;
    itemId?: string;
  };
  isBlueprint: boolean; // If true, must be discovered first
}

export const CRAFTING_RECIPES: CraftingRecipeDef[] = [
  {
    id: "combine_tier_up",
    name: "Tier Synthesis",
    description: "Combine 3 items of the same tier and type to create a +1 tier item",
    category: "combine",
    ingredients: [
      { type: "item", count: 3 },
    ],
    result: { type: "item", tierBonus: 1 },
    isBlueprint: false,
  },
  {
    id: "transmute_plating_to_fiber",
    name: "Transmute: Plating → Fiber",
    description: "Convert 3 Plating Shards into 1 Reinforced Fiber",
    category: "transmute",
    ingredients: [
      { type: "material", subtype: "platingShards", count: 3 },
    ],
    result: { type: "material", itemId: "reinforcedFiber" },
    isBlueprint: false,
  },
  {
    id: "transmute_fiber_to_crystals",
    name: "Transmute: Fiber → Crystals",
    description: "Convert 3 Reinforced Fiber into 1 Flux Crystal",
    category: "transmute",
    ingredients: [
      { type: "material", subtype: "reinforcedFiber", count: 3 },
    ],
    result: { type: "material", itemId: "fluxCrystals" },
    isBlueprint: false,
  },
  {
    id: "transmute_crystals_to_cores",
    name: "Transmute: Crystals → Cores",
    description: "Convert 3 Flux Crystals into 1 Essence Core",
    category: "transmute",
    ingredients: [
      { type: "material", subtype: "fluxCrystals", count: 3 },
    ],
    result: { type: "material", itemId: "essenceCores" },
    isBlueprint: false,
  },
  {
    id: "transmute_cores_to_plating",
    name: "Transmute: Cores → Plating",
    description: "Convert 3 Essence Cores into 1 Plating Shard",
    category: "transmute",
    ingredients: [
      { type: "material", subtype: "essenceCores", count: 3 },
    ],
    result: { type: "material", itemId: "platingShards" },
    isBlueprint: false,
  },
];

// ============================================================
// ACHIEVEMENTS
// ============================================================

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  reward: { type: string; value: number };
  condition: { type: string; value: number };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Wave milestones
  { id: "q_start", name: "The Journey Begins", description: "Reach Wave 10", reward: { type: "gold", value: 5000 }, condition: { type: "highestWave", value: 10 } },
  { id: "q_boss_1", name: "Key to the Gate", description: "Reach Wave 49", reward: { type: "bossKey", value: 1 }, condition: { type: "highestWave", value: 49 } },
  { id: "q_boss_2", name: "The Second Seal", description: "Reach Wave 99", reward: { type: "bossKey", value: 1 }, condition: { type: "highestWave", value: 99 } },
  { id: "q_boss_3", name: "Demon's Door", description: "Reach Wave 149", reward: { type: "bossKey", value: 1 }, condition: { type: "highestWave", value: 149 } },
  { id: "q_boss_4", name: "Dragon's Lair", description: "Reach Wave 199", reward: { type: "bossKey", value: 1 }, condition: { type: "highestWave", value: 199 } },
  { id: "q_boss_5", name: "Void Entry", description: "Reach Wave 249", reward: { type: "bossKey", value: 1 }, condition: { type: "highestWave", value: 249 } },
  { id: "q_godly", name: "Ascension", description: "Reach Wave 500", reward: { type: "bossKey", value: 5 }, condition: { type: "highestWave", value: 500 } },
  { id: "wave_climber", name: "Wave Climber", description: "Reach Wave 50", reward: { type: "dust", value: 200 }, condition: { type: "highestWave", value: 50 } },
  { id: "wave_master", name: "Wave Master", description: "Reach Wave 100", reward: { type: "gems", value: 100 }, condition: { type: "highestWave", value: 100 } },
  { id: "wave_legend", name: "Wave Legend", description: "Reach Wave 1000", reward: { type: "bossKey", value: 10 }, condition: { type: "highestWave", value: 1000 } },

  // Kill milestones
  { id: "novice_killer", name: "Novice Killer", description: "Defeat 100 Enemies", reward: { type: "gold", value: 1000 }, condition: { type: "totalKills", value: 100 } },
  { id: "expert_killer", name: "Expert Killer", description: "Defeat 1,000 Enemies", reward: { type: "gems", value: 10 }, condition: { type: "totalKills", value: 1000 } },
  { id: "master_killer", name: "Master Killer", description: "Defeat 10,000 Enemies", reward: { type: "dust", value: 500 }, condition: { type: "totalKills", value: 10000 } },
  { id: "genocide", name: "Genocide", description: "Defeat 100,000 Enemies", reward: { type: "bossKey", value: 1 }, condition: { type: "totalKills", value: 100000 } },

  // Click milestones
  { id: "clicker", name: "Finger Workout", description: "Click 1,000 times", reward: { type: "gold", value: 5000 }, condition: { type: "totalClicks", value: 1000 } },
  { id: "autoclicker", name: "Broken Mouse", description: "Click 100,000 times", reward: { type: "gems", value: 50 }, condition: { type: "totalClicks", value: 100000 } },

  // Gold milestones
  { id: "rich", name: "Millionaire", description: "Earn 1,000,000 Gold", reward: { type: "gems", value: 50 }, condition: { type: "totalGold", value: 1000000 } },
  { id: "billionaire", name: "Billionaire", description: "Earn 1,000,000,000 Gold", reward: { type: "dust", value: 1000 }, condition: { type: "totalGold", value: 1000000000 } },
  { id: "trillionaire", name: "Trillionaire", description: "Earn 1T Gold", reward: { type: "bossKey", value: 2 }, condition: { type: "totalGold", value: 1000000000000 } },

  // New system achievements
  { id: "first_rune", name: "Rune Apprentice", description: "Forge your first rune", reward: { type: "dust", value: 500 }, condition: { type: "totalRunesForged", value: 1 } },
  { id: "rune_master", name: "Rune Master", description: "Forge 50 runes", reward: { type: "gems", value: 100 }, condition: { type: "totalRunesForged", value: 50 } },
  { id: "first_craft", name: "Craftsman", description: "Craft your first item", reward: { type: "dust", value: 300 }, condition: { type: "totalItemsCrafted", value: 1 } },
  { id: "level_10", name: "Getting Started", description: "Reach Player Level 10", reward: { type: "skillPoints", value: 5 }, condition: { type: "playerLevel", value: 10 } },
  { id: "level_50", name: "Experienced", description: "Reach Player Level 50", reward: { type: "skillPoints", value: 15 }, condition: { type: "playerLevel", value: 50 } },
  { id: "first_rebirth", name: "Reborn", description: "Perform your first Rebirth", reward: { type: "gems", value: 100 }, condition: { type: "rebirths", value: 1 } },
];

// ============================================================
// QUEST TEMPLATES
// ============================================================

export interface QuestTemplateDef {
  type: string;
  targetBase: number;
  rewardBase: Record<string, number>;
  name: string;
}

export const QUEST_TEMPLATES: QuestTemplateDef[] = [
  { type: "kill", targetBase: 10, rewardBase: { gold: 1000 }, name: "Hunt: {target} Enemies" },
  { type: "gold", targetBase: 5000, rewardBase: { dust: 50 }, name: "Gather: {target} Gold" },
  { type: "click", targetBase: 100, rewardBase: { gems: 10 }, name: "Active: Click {target} Times" },
  { type: "kill", targetBase: 500, rewardBase: { bossKeys: 1 }, name: "Slayer: Kill {target} Enemies" },
  { type: "kill", targetBase: 50, rewardBase: { gold: 5000 }, name: "Purge: {target} Monsters" },
  { type: "gold", targetBase: 25000, rewardBase: { dust: 150 }, name: "Hoard: {target} Gold" },
  { type: "click", targetBase: 500, rewardBase: { gems: 30 }, name: "Tap Frenzy: {target} Clicks" },
  { type: "kill", targetBase: 100, rewardBase: { gold: 15000 }, name: "Massacre: {target} Enemies" },
  { type: "gold", targetBase: 100000, rewardBase: { dust: 300 }, name: "Treasury: {target} Gold" },
  { type: "click", targetBase: 1000, rewardBase: { gems: 50 }, name: "Marathon: {target} Clicks" },
  { type: "kill", targetBase: 1000, rewardBase: { bossKeys: 2 }, name: "Boss Hunter: {target} Kills" },
  { type: "gold", targetBase: 1000000, rewardBase: { dust: 500 }, name: "Millionaire: {target} Gold" },
  { type: "click", targetBase: 2500, rewardBase: { gems: 100 }, name: "Finger Workout: {target} Clicks" },
  { type: "kill", targetBase: 250, rewardBase: { gold: 50000 }, name: "Exterminate: {target} Foes" },
  { type: "gold", targetBase: 5000000, rewardBase: { dust: 1000 }, name: "Wealth: {target} Gold" },
  { type: "click", targetBase: 5000, rewardBase: { gems: 250 }, name: "Click Master: {target} Clicks" },
  { type: "kill", targetBase: 2000, rewardBase: { bossKeys: 3 }, name: "Genocide: {target} Kills" },
  { type: "gold", targetBase: 10000000, rewardBase: { dust: 2500 }, name: "Tycoon: {target} Gold" },
  { type: "click", targetBase: 10000, rewardBase: { gems: 500 }, name: "Click God: {target} Clicks" },
  { type: "kill", targetBase: 5000, rewardBase: { bossKeys: 5 }, name: "Destroyer: {target} Kills" },
];

// ============================================================
// TITLES
// ============================================================

export interface TitleDef {
  id: string;
  name: string;
  req: { type: string; value: number };
  color: string;
}

export const TITLES: TitleDef[] = [
  { id: "novice", name: "Novice", req: { type: "wave", value: 10 }, color: "#9ca3af" },
  { id: "warrior", name: "Warrior", req: { type: "wave", value: 50 }, color: "#4ade80" },
  { id: "champion", name: "Champion", req: { type: "wave", value: 100 }, color: "#60a5fa" },
  { id: "legend", name: "Legend", req: { type: "wave", value: 200 }, color: "#c084fc" },
  { id: "god", name: "God", req: { type: "wave", value: 500 }, color: "#facc15" },
  { id: "immortal", name: "Immortal", req: { type: "wave", value: 1000 }, color: "#ef4444" },
  { id: "eternal", name: "Eternal", req: { type: "wave", value: 2000 }, color: "#22d3ee" },
  { id: "rich", name: "Tycoon", req: { type: "gold", value: 1000000 }, color: "#fde68a" },
  { id: "slayer", name: "Slayer", req: { type: "kills", value: 1000 }, color: "#f87171" },
  { id: "collector", name: "Collector", req: { type: "items", value: 100 }, color: "#fb923c" },
  { id: "runesmith", name: "Runesmith", req: { type: "runesForged", value: 25 }, color: "#a78bfa" },
  { id: "artificer", name: "Artificer", req: { type: "itemsCrafted", value: 10 }, color: "#2dd4bf" },
];

// ============================================================
// XP TABLE
// ============================================================

/** Calculate XP required for a given player level */
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

/** Calculate XP gained from killing an enemy at a given wave */
export function xpFromKill(wave: number): number {
  return Math.floor(5 + wave * 0.5);
}

// ============================================================
// PHASE 2 & 3 NEW SYSTEM CONFIGS
// ============================================================

export interface AscensionPerkDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMult: number;
  maxLevel: number;
}

export const ASCENSION_PERKS: AscensionPerkDef[] = [
  { id: "multiverse", name: "Multiverse Theory", description: "+20% parallel battle speed per level", baseCost: 1, costMult: 2, maxLevel: 5 },
  { id: "temporal", name: "Temporal Echo", description: "Auto-clicker speed is doubled per level", baseCost: 1, costMult: 3, maxLevel: 3 },
  { id: "singularity", name: "Singularity Force", description: "Workers gain compound scaling (+1% multiplier per owned worker) per level", baseCost: 2, costMult: 4, maxLevel: 5 },
  { id: "entropy", name: "Entropy Reversal", description: "Items refined past 100% have -10% destruction chance per level", baseCost: 3, costMult: 3, maxLevel: 5 },
];

export interface PetConfigDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'celestial';
  baseEffectValue: number;
  statType: 'clickDamage' | 'dps' | 'xp' | 'gold' | 'dodge' | 'defense';
}

export const PETS_CONFIG: PetConfigDef[] = [
  { id: "wolf", name: "Wolf Pack", description: "+5% Click Damage per level", emoji: "🐺", rarity: "common", baseEffectValue: 0.05, statType: 'clickDamage' },
  { id: "dragon", name: "Baby Dragon", description: "+10% Army DPS per level", emoji: "🐲", rarity: "epic", baseEffectValue: 0.10, statType: 'dps' },
  { id: "owl", name: "Wise Owl", description: "+8% XP Gain per level", emoji: "🦉", rarity: "rare", baseEffectValue: 0.08, statType: 'xp' },
  { id: "serpent", name: "Gold Serpent", description: "+10% Gold Gain per level", emoji: "🐍", rarity: "rare", baseEffectValue: 0.10, statType: 'gold' },
  { id: "fox", name: "Phantom Fox", description: "+3% Dodge Chance per level", emoji: "🦊", rarity: "epic", baseEffectValue: 0.03, statType: 'dodge' },
  { id: "turtle", name: "Ancient Turtle", description: "+8% Defense per level", emoji: "🐢", rarity: "common", baseEffectValue: 0.08, statType: 'defense' },
];

export interface ResearchTechDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMult: number;
  maxLevel: number;
  category: 'metallurgy' | 'industry' | 'alchemy' | 'economics';
}

export const RESEARCH_TECHS: ResearchTechDef[] = [
  { id: "r_temperedSteel", name: "Tempered Steel", description: "+2% Item stats per level", baseCost: 100, costMult: 1.5, maxLevel: 50, category: 'metallurgy' },
  { id: "r_autoRefine", name: "Auto Refine", description: "Item refining cost is reduced by 1% per level", baseCost: 150, costMult: 1.6, maxLevel: 30, category: 'metallurgy' },
  { id: "r_automation", name: "Industrial Automation", description: "+3% Worker speed/efficiency per level", baseCost: 100, costMult: 1.5, maxLevel: 50, category: 'industry' },
  { id: "r_potionDuration", name: "Alchemy Potions", description: "+5% Potion durations per level", baseCost: 120, costMult: 1.5, maxLevel: 40, category: 'alchemy' },
  { id: "r_taxShelter", name: "Tax Haven", description: "+4% Gold from all combat kills per level", baseCost: 100, costMult: 1.4, maxLevel: 50, category: 'economics' },
];

export interface DungeonDef {
  id: string;
  name: string;
  reqAscension: number;
  keyCost: number;
  timeLimit: number; // in seconds
  emoji: string;
  description: string;
  modifiers: string[];
}

export const DUNGEONS: DungeonDef[] = [
  { id: "goblin_vault", name: "Goblin Vault", reqAscension: 0, keyCost: 1, timeLimit: 60, emoji: "🪙", description: "Fast-paced timed fight with 2x Gold multiplier.", modifiers: ["Impoverished: No items, but 3x Gold"] },
  { id: "lich_crypt", name: "Lich's Crypt", reqAscension: 1, keyCost: 2, timeLimit: 120, emoji: "💀", description: "Dangerous fight against dark undead. Drops rare runes.", modifiers: ["Blighted: Take 1% HP burn per second"] },
  { id: "dragon_hoard", name: "Dragon's Hoard", reqAscension: 2, keyCost: 3, timeLimit: 180, emoji: "🌋", description: "Brutal elemental challenge. Guaranteed legendary materials.", modifiers: ["Frenzied: Enemies spawn 2x faster, deal 1.5x damage"] },
];

export interface WorldBossDef {
  id: string;
  name: string;
  hpMultiplier: number;
  timeLimit: number; // in seconds
  emoji: string;
  element: string;
}

export const WORLD_BOSSES: WorldBossDef[] = [
  { id: "behemoth", name: "Gorgon Behemoth", hpMultiplier: 500, timeLimit: 300, emoji: "👹", element: "nature" },
  { id: "leviathan", name: "Tidal Leviathan", hpMultiplier: 1000, timeLimit: 300, emoji: "🐉", element: "ice" },
  { id: "phoenix", name: "Solar Phoenix", hpMultiplier: 2500, timeLimit: 300, emoji: "🦅", element: "fire" },
];

