"use client";

import React, { useState } from 'react';
import { useGameEngine, type EffectPopup } from '@/hooks/useGameEngine';
import { formatNumber } from '@/lib/formatters';
import TopBar from './TopBar';
import CombatView from './CombatView';
import InventoryView from './InventoryView';
import ArmyView from './ArmyView';
import ShopView from './ShopView';
import SkillTreeView from './SkillTreeView';
import RuneForgeView from './RuneForgeView';
import CraftingView from './CraftingView';
import QuestView from './QuestView';
import MenuView from './MenuView';
import AscensionView from './AscensionView';
import PetsView from './PetsView';
import ResearchView from './ResearchView';
import EndgameView from './EndgameView';
import Twemoji from './Twemoji';
import GachaRevealModal from './GachaRevealModal';

type Tab = 'combat' | 'inventory' | 'army' | 'shop' | 'skills' | 'runes' | 'crafting' | 'quests' | 'ascension' | 'pets' | 'research' | 'endgame' | 'menu';

const NAV_ITEMS: { id: Tab; emoji: string; label: string }[] = [
  { id: 'combat', emoji: '⚔️', label: 'Combat' },
  { id: 'inventory', emoji: '🎒', label: 'Items' },
  { id: 'army', emoji: '🏰', label: 'Army' },
  { id: 'shop', emoji: '🏪', label: 'Shop' },
  { id: 'skills', emoji: '🧠', label: 'Skills' },
  { id: 'runes', emoji: '🔮', label: 'Runes' },
  { id: 'crafting', emoji: '⚒️', label: 'Craft' },
  { id: 'quests', emoji: '📜', label: 'Quests' },
  { id: 'ascension', emoji: '🌟', label: 'Ascend' },
  { id: 'pets', emoji: '🐉', label: 'Pets' },
  { id: 'research', emoji: '🔬', label: 'Research' },
  { id: 'endgame', emoji: '💀', label: 'Endgame' },
  { id: 'menu', emoji: '📋', label: 'Menu' },
];

export default function Game() {
  const engine = useGameEngine();
  const { activeTab, setActiveTab } = engine;

  // Loading screen
  if (engine.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-title">Zikki Incremental</div>
        <div className="loading-spinner" />
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading your adventure...</div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* Top Resource Bar */}
      <TopBar state={engine.state} />

      {/* Main Content Area */}
      <div className="main-area">
        {/* Navigation Sidebar */}
        <nav className="nav-sidebar">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <span><Twemoji emoji={item.emoji} /></span>
              <span className="nav-btn-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="content-area">
          {activeTab === 'combat' && (
            <CombatView
              state={engine.state}
              handleAttack={engine.handleAttack}
              activateSkill={engine.activateSkill}
              summonBoss={engine.summonBoss}
              updateSettings={engine.updateSettings}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryView
              state={engine.state}
              equipItem={engine.equipItem}
              unequipItem={engine.unequipItem}
              equipBest={engine.equipBest}
              deleteItem={engine.deleteItem}
              upgradeItemLevel={engine.upgradeItemLevel}
              evolveItem={engine.evolveItem}
              refineItem={engine.refineItem}
              enchantItem={engine.enchantItem}
              activateOverdrive={engine.activateOverdrive}
              overdriveRefine={engine.overdriveRefine}
              usePotion={engine.usePotion}
              openChest={engine.openChest}
              startUnlockChest={engine.startUnlockChest}
              handleSocketRune={engine.handleSocketRune}
              handleUnsocketRune={engine.handleUnsocketRune}
              updateSettings={engine.updateSettings}
            />
          )}
          {activeTab === 'army' && (
            <ArmyView
              state={engine.state}
              buyWorker={engine.buyWorker}
            />
          )}
          {activeTab === 'shop' && (
            <ShopView
              state={engine.state}
              buyChest={engine.buyChest}
              handleUpgrade={engine.handleUpgrade}
              handleRebirth={engine.handleRebirth}
              handleBuyRebirthUpgrade={engine.handleBuyRebirthUpgrade}
              buyBossKey={engine.buyBossKey}
              buyDungeonKey={engine.buyDungeonKey}
            />
          )}
          {activeTab === 'skills' && (
            <SkillTreeView
              state={engine.state}
              buySkillNode={engine.buySkillNode}
              handleRespec={engine.handleRespec}
            />
          )}
          {activeTab === 'runes' && (
            <RuneForgeView
              state={engine.state}
              handleForgeRune={engine.handleForgeRune}
              handleCombineRunes={engine.handleCombineRunes}
            />
          )}
          {activeTab === 'crafting' && (
            <CraftingView
              state={engine.state}
              handleCombineItems={engine.handleCombineItems}
              handleTransmute={engine.handleTransmute}
            />
          )}
          {activeTab === 'quests' && (
            <QuestView
              state={engine.state}
              refreshQuests={engine.refreshQuests}
            />
          )}
          {activeTab === 'ascension' && (
            <AscensionView
              state={engine.state}
              handleAscend={engine.handleAscend}
              buyAscensionPerkInstance={engine.buyAscensionPerkInstance}
              chooseFactionInstance={engine.chooseFactionInstance}
            />
          )}
          {activeTab === 'pets' && (
            <PetsView
              state={engine.state}
              hatchPetEggInstance={engine.hatchPetEggInstance}
              equipPetInstance={engine.equipPetInstance}
              unequipPetInstance={engine.unequipPetInstance}
            />
          )}
          {activeTab === 'research' && (
            <ResearchView
              state={engine.state}
              startResearchTech={engine.startResearchTech}
              cancelResearchTech={engine.cancelResearchTech}
            />
          )}
          {activeTab === 'endgame' && (
            <EndgameView
              state={engine.state}
              startDungeonInstance={engine.startDungeonInstance}
              startTimeRiftInstance={engine.startTimeRiftInstance}
              summonWorldBossInstance={engine.summonWorldBossInstance}
              cleanseCorruptionInstance={engine.cleanseCorruptionInstance}
              exchangePurityOrbs={engine.exchangePurityOrbs}
            />
          )}
          {activeTab === 'menu' && (
            <MenuView
              state={engine.state}
              selectTitle={engine.selectTitle}
              updateSettings={engine.updateSettings}
              handleExport={engine.handleExport}
              handleImport={engine.handleImport}
              handleWipe={engine.handleWipe}
              handleManualSave={engine.handleManualSave}
            />
          )}
        </div>
      </div>

      {/* Floating Effects */}
      {engine.effects.map(effect => (
        <div
          key={effect.id}
          className="effect-popup"
          style={{
            left: effect.x,
            top: effect.y,
            color: effect.color,
          }}
        >
          {effect.text}
        </div>
      ))}

      {/* Offline Earnings Modal */}
      {engine.offlineEarnings > 0 && (
        <div className="modal-overlay" onClick={engine.dismissOffline}>
          <div className="modal-content offline-modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              <Twemoji emoji="🌙" style={{ width: 48, height: 48 }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Welcome Back!</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              While you were away, your army earned:
            </div>
            <div className="offline-amount">
              +{formatNumber(engine.offlineEarnings)} Gold
            </div>
            <button className="btn btn-primary btn-lg" onClick={engine.dismissOffline}>
              <Twemoji emoji="💰" /> Collect
            </button>
          </div>
        </div>
      )}

      {/* Chest Reveal Modal (Gacha) */}
      {engine.chestReveal && (
        <GachaRevealModal
          reveal={engine.chestReveal}
          state={engine.state}
          onClose={engine.dismissChestReveal}
        />
      )}
    </div>
  );
}
