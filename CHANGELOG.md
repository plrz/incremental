# Changelog

## [v1.0.0] - 2026-05-27

### Added
- **100% Offline Architecture**: Completely removed all server dependencies, authentication requirements, and databases.
  - **Local Persistence**: Primary saves are stored in `localStorage`, with automated backups to `IndexedDB` for high-volume data.
  - **Save Portability**: Export and import save files using portable Base64 save codes.
  - **Offline Progression**: Fully functional offline calculation based on active army DPS and time elapsed since last logout.
- **Skill Tree System**: Branching customization with three major paths.
  - **Warrior** (🗡️): Enhances manual click damage, critical chance, and critical damage.
  - **Commander** (🛡️): Boosts worker hiring discount, worker efficiency, and passive army DPS.
  - **Arcane** (🔮): Decreases skill cooldowns and empowers skills.
- **Rune Forging System**: Augment gear with socketed runes.
  - **Rune Crafting**: Combine Dust and Gems to forge specific stat runes (Ruby, Sapphire, Emerald, Diamond, Amethyst, Onyx).
  - **Rune Synthesis**: Combine 3 identical runes of the same level to upgrade them to a higher level.
  - **Set Bonuses**: Equip multiple matching runes across gear to trigger unique combat modifiers (e.g., ignite damage over time, percent-based worker damage boosts).
- **Advanced Crafting System**: Replaced random drops with structured crafting pipelines.
  - **Material Salvaging**: Scrapping gear yields item-type specific materials (Plating Shards, Reinforced Fiber, Flux Crystals, Essence Cores).
  - **Item Synthesis**: Combine three items of the same tier and type to upgrade them to the next tier with guaranteed quality preservation.
  - **Material Transmutation**: Convert crafting materials of one type to another at a 3:1 ratio.
- **Premium Glassmorphic UI/UX**: Overhauled the interface with a modern, high-fidelity dark mode, custom Inter & JetBrains Mono typography, custom tab-based layout, and smooth animations (e.g., floating combat text, pulsing healthbars).

- **Ascension Prestige (Pillar 1)**: Reset Rebirth progress to earn Ascension Points (AP). Spend AP on multiverse battle acceleration, temporal auto-clicking multipliers, singularity force, and entropy risk reduction.
- **Factions Specialization (Pillar 9)**: Enlist in factions at Ascension 1. Order of the Blade grants +50% click damage but -25% worker DPS; Merchant's Guild grants +100% gold gain but -25% click damage; Arcane Conclave reduces skill cooldowns by 50% but reduces max HP by 25%.
- **Pet Companion System (Pillar 6)**: Hatch eggs collected from dungeons. Level up pets, equip multiple companions based on Ascension level, and earn multipliers (XP, Gold, Click Damage, Defense, Dodge, and Army DPS).
- **Research Lab (Pillar 10)**: Passive technological queue providing permanent buffs to item stats, auto-refining discounts, worker efficiency, potion duration, and gold gain.
- **Endgame Trial Systems (Pillars 4, 5, 8, 11, 12)**:
  - **Dungeons**: timed dungeon instances (Goblin Vault, Lich's Crypt, Dragon's Hoard) with custom difficulty modifiers and loot (Stardust, Time Crystals, Purity Orbs, rare eggs).
  - **Time Rifts**: Spend Time Crystals to warp space-time (2x, 5x, 10x speed factor multipliers).
  - **World Bosses**: timed boss battles against Behemoth, Leviathan, and Phoenix.
  - **Corruption & Purity**: scale risk/reward metrics. Cleanse corruption using Purity Orbs earned from World Bosses.

### Removed
- Removed NextAuth, Prisma, MySQL adapters, socket.io communication, and Discord SDK references from the client and build scripts.
- Removed custom Node.js server.js in favor of next dev/start.

## [v0.6.0] - 2025-12-31

### Added
- **Auto-Scrap 2.0**: Replaced simple checkboxes with a robust dropdown system.
  - Filter by **Rarity** (e.g., "Scrap everything below Rare").
  - Filter by **Tier** (e.g., "Scrap everything below Tier 10").
  - **Resource Refunds**: Auto-scrapped items now grant Gold and Dust.
  - **Safety**: "Transcendent" items are never auto-scrapped.
- **Inventory Improvements**:
  - Added **Sort Direction** toggle (Ascending/Descending).
  - **Overdrive Visuals**: Items in Overdrive now pulse red and have a distinct border in the grid.
- **Equipped Items**:
  - You can now **Inspect** and **Upgrade** items directly from the equipment slots without unequipping them.
  - Equipped items also show Overdrive effects.
  - **Number Abbreviation**: Large numbers (HP, Damage, Gold, Army Cost/DPS, Offline Rewards) are now abbreviated (e.g., 1.2k, 1.5M, 2.3B) to prevent layout shifts and improve readability.
  - **Boss Keys**: Added Boss Keys to the drop table (rare chance) and as a reward for "Slayer" quests.

### Changed
- **Balance**: Capped the maximum tier of items obtainable from chests based on your highest wave. You can no longer get Tier 100 items at Wave 10.

### Fixed
- **Chest System**: Fixed a crash caused by legacy wave-to-chest mapping accessing out-of-bounds array indices.
- **Boss Fights**: Fixed a bug where dying during a boss fight didn't cancel the fight, allowing players to farm boss rewards from regular mobs.
- **Quests**: Fixed an issue where "Click" quests were not progressing when clicking manually.
- **Stability**: Improved general game stability and performance.

## [v0.5.0]

### Added
- **Dynamic Quests**: Side quests are now infinite and auto-refresh!
- **Titles**: Unlock titles by reaching milestones and show them off.
- **Achievements**: Added 20+ new achievements with rewards.
- **Rebirth Luck**: Rebirths now grant +5% Luck per rebirth.
- **UI Overhaul**: Improved Achievement and Quest interfaces.

## [v0.4.0]

### Added
- **Boss Keys**: Required to challenge Boss Waves.
- **Overdrive System**: Risk items for massive power.
- **Equip Best**: Button to automatically equip the best gear.

## [v0.3.0]

### Added
- **Global Marketplace**: Buy and sell items.
- **Leaderboards**: Compete with other players.

## [v0.2.0] - 2025-12-31

### Added
- **Overdrive System**: Items refined past 100% quality now enter "Overdrive".
  - **Visuals**: Overdrive items feature a glitchy red/black aesthetic, pulsing icons, and a unique "OVERDRIVE" rarity tag.
  - **Mechanics**: Refining Overdrive items grants massive power but carries a risk of destruction.
  - **Sacrifice**: You can now sacrifice other items to lower the destruction risk during Overdrive refining.
- **New Chest Tiers**: Added high-tier chests to the shop and drop tables to support progression past Tier 20.
  - *Star-Core, Pulsar, Nebula, Quasar, Event Horizon, Magma, Glacial, Storm, Terra, Aetherite, Chronomium, Warp, Paradox, Null, Continuum, Willpower, Memory, Nightmare, Logic, Chaos, Nexus, Fractal, Void-Walker, Reality, Omega, Code, Origin, Existence, The End, Developer's Alloy.*
- **Mob Drops**: Enemies now have a chance to drop chests directly. The tier of the chest scales with the wave number.
- **Chest Info**: Added an "Info" button to chests in the shop to view drop rates and potential items.
- **Offline Progress**: Added a welcome back modal showing gold earned while offline.

### Changed
- **Rebirth**: Rebirth bonus increased from 10% to **50%** per rebirth. Rebirths now also grant a **+10% Gold Gain** bonus per rebirth.
- **UI**: Improved tooltip visuals for special items.

### Fixed
- Fixed an issue where high-tier items were not obtainable.
