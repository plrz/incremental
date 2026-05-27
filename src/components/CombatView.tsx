"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { GameState } from '@/engine/gameState';
import { formatNumber } from '@/lib/formatters';
import { getEnemyStats } from '@/engine/combat';
import { calculateClickDamage, calculateDPS, calculateMaxHp, getItemDef } from '@/engine/items';
import { SKILLS, ELEMENTS, WORKERS, PETS_CONFIG } from '@/lib/gameConfig';
import Twemoji from './Twemoji';

// --- PIXEL ART RENDERING HELPERS (TERRARIA STYLE) ---

function drawPixelArt(pixels: string[], colors: Record<string, string>) {
  const rects: React.ReactNode[] = [];
  const rows = pixels.length;
  const cols = pixels[0].length;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const char = pixels[r][c];
      if (char !== '.' && colors[char]) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c}
            y={r}
            width={1}
            height={1}
            fill={colors[char]}
          />
        );
      }
    }
  }
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cols} ${rows}`} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {rects}
    </svg>
  );
}

function renderHeroBody() {
  const HERO_BODY_PIXELS = [
    ".....hhhhh......",
    "....hHHHHHhh....",
    "....hHssssHh....",
    "....hHessseH....",
    ".....hsssss.....",
    "......ssss......",
    "....kkaaaakk....",
    "...kaaaaaaaak...",
    "..kaaaAAaaAAak..",
    "..kaaaAAaaAAak..",
    "..kaaaaaaaaaak..",
    "...krrkppkrrk...",
    "....kppppk......",
    "....kppppk......",
    "....kbbkkbbk....",
    "...kbbbk.kbbbk.."
  ];
  const HERO_COLORS = {
    k: '#111116',
    s: '#fbcfe8',
    S: '#f472b6',
    h: '#78350f',
    H: '#d97706',
    a: '#3b82f6',
    A: '#1d4ed8',
    p: '#1e1b4b',
    b: '#1f2937',
    B: '#4b5563',
    e: '#1e3a8a',
    r: '#ef4444'
  };
  return renderHeroBody.name ? drawPixelArt(HERO_BODY_PIXELS, HERO_COLORS) : null;
}

function renderHelmetSVG(emoji: string) {
  const CROWN_PIXELS = [
    "................",
    "................",
    "....k...k...k...",
    "...kgk.kgk.kgk..",
    "..kgygkgkgkgygk.",
    ".kGGGGGGGGGGGGk.",
    ".kGGrGGdGGbGGyY.",
    ".kkkkkkkkkkkkkk.",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  const CROWN_COLORS = {
    k: '#581c0c',
    g: '#facc15',
    G: '#ca8a04',
    y: '#fef08a',
    Y: '#ca8a04',
    r: '#ef4444',
    b: '#3b82f6',
    d: '#10b981'
  };

  const TOP_HAT_PIXELS = [
    "................",
    ".....kkkkkk.....",
    "....kccccwwk....",
    "....kccccwwk....",
    "....kccccwwk....",
    "....kccccwwk....",
    "....krrRRRrk....",
    "...kcccccccck...",
    "..kkkkkkkkkkkk..",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  const TOP_HAT_COLORS = {
    k: '#111116',
    c: '#1f2937',
    C: '#374151',
    w: '#9ca3af',
    r: '#dc2626',
    R: '#f87171'
  };

  const NINJA_HOOD_PIXELS = [
    "......kkkk......",
    "....kknnnnkk....",
    "...knnnnnnnnk...",
    "..knnnkkknnnnk..",
    "..knnkeeeskknk..",
    "..knnnssskknnk..",
    "..kknnnnnnnnkk..",
    "...kkrrrrrrkk...",
    "....kRRRRRk.....",
    ".....kkkkk......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  const NINJA_COLORS = {
    k: '#111116',
    n: '#1e1b4b',
    N: '#312e81',
    s: '#fbcfe8',
    e: '#f43f5e',
    r: '#ef4444',
    R: '#b91c1c'
  };

  const KNIGHT_HELMET_PIXELS = [
    "......rrr.......",
    ".....rRRRkk.....",
    "....rRRkkkId....",
    "....kkkIIIIIk...",
    "...kIIIIiiiIk...",
    "..kIIddddddiIk..",
    "..kIdkdkdkdiIk..",
    "..kIdddddddiIk..",
    "..kIIIIIIIIIIk..",
    "...kkkkkkkkkk...",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"
  ];
  const KNIGHT_COLORS = {
    k: '#1f2937',
    i: '#e5e7eb',
    I: '#9ca3af',
    d: '#4b5563',
    r: '#dc2626',
    R: '#ef4444'
  };

  if (emoji === '👑') return drawPixelArt(CROWN_PIXELS, CROWN_COLORS);
  if (emoji === '🎩') return drawPixelArt(TOP_HAT_PIXELS, TOP_HAT_COLORS);
  if (emoji === '🥷') return drawPixelArt(NINJA_HOOD_PIXELS, NINJA_COLORS);
  return drawPixelArt(KNIGHT_HELMET_PIXELS, KNIGHT_COLORS);
}

function renderWeaponSVG(emoji: string) {
  const SWORD_PIXELS = [
    "............kk..",
    "...........ksSk.",
    "..........ksSsk.",
    ".........ksSsk..",
    "........ksSsk...",
    ".......ksSsk....",
    "......ksSsk.....",
    ".....ksSsk......",
    "....kGGGGk......",
    "...kggggggk.....",
    "....kGwwGk......",
    ".....kwwk.......",
    "......kk........",
    "................",
    "................",
    "................"
  ];
  const SWORD_COLORS = {
    k: '#111116',
    s: '#f3f4f6',
    S: '#9ca3af',
    g: '#eab308',
    G: '#b45309',
    w: '#78350f'
  };

  const BOW_PIXELS = [
    "....kkkkk.......",
    "...kWWWWk.s.....",
    "..kwwkkk..s.....",
    "..kwWk....s.....",
    ".kwwk.....s.....",
    ".kWk...ff.s.....",
    "kwwk..faaas.....",
    "kwwk...faaat....",
    ".kWk...ff.s.....",
    ".kwwk.....s.....",
    "..kwWk....s.....",
    "..kwwkkk..s.....",
    "...kWWWWk.s.....",
    "....kkkkk.......",
    "................",
    "................"
  ];
  const BOW_COLORS = {
    k: '#27272a',
    w: '#92400e',
    W: '#d97706',
    s: '#e2e8f0',
    a: '#d1d5db',
    f: '#f43f5e',
    t: '#4b5563'
  };

  const STAFF_PIXELS = [
    "..........mm....",
    "........kCCCk...",
    ".......kCcccCk..",
    ".......kccccck..",
    "........kCckm...",
    ".......kWWk.....",
    "......kwwk......",
    ".....kWWk.......",
    "....kwwk........",
    "...kWWk.........",
    "..kwwk..........",
    "..kk............",
    "................",
    "................",
    "................",
    "................"
  ];
  const STAFF_COLORS = {
    k: '#111116',
    w: '#78350f',
    W: '#d97706',
    c: '#c084fc',
    C: '#f3e8ff',
    m: '#22d3ee'
  };

  const AXE_PIXELS = [
    "........kkkk....",
    ".......kIIIik...",
    "......kIIiiiik..",
    ".....kIIiiiik...",
    "....kIIiigk.....",
    "....kIdkWk......",
    ".....kkwwk......",
    "......kWWk......",
    ".....kwwk.......",
    "....kWWk........",
    "...kwwk.........",
    "..kWWk..........",
    "..kk............",
    "................",
    "................",
    "................"
  ];
  const AXE_COLORS = {
    k: '#111116',
    w: '#78350f',
    W: '#b45309',
    i: '#e5e7eb',
    I: '#9ca3af',
    d: '#4b5563',
    g: '#eab308'
  };

  if (emoji === '🏹') return drawPixelArt(BOW_PIXELS, BOW_COLORS);
  if (emoji === '🪄') return drawPixelArt(STAFF_PIXELS, STAFF_COLORS);
  if (emoji === '🪓') return drawPixelArt(AXE_PIXELS, AXE_COLORS);
  return drawPixelArt(SWORD_PIXELS, SWORD_COLORS);
}

interface CombatViewProps {
  state: GameState;
  handleAttack: (e?: { clientX?: number; clientY?: number }) => void;
  activateSkill: (skillId: string) => void;
  summonBoss: () => void;
  updateSettings: (updates: Partial<GameState['settings']>) => void;
}

export default function CombatView({ state, handleAttack, activateSkill, summonBoss, updateSettings }: CombatViewProps) {
  const [hitAnim, setHitAnim] = useState(false);
  const [time, setTime] = useState(Date.now());
  const { combat, stats } = state;

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const enemyStats = getEnemyStats(combat.currentWave, combat.enemiesDefeated, combat.currentModifier, combat.isBossGate && !combat.bossFightActive);
  const hpPercent = Math.max(0, (combat.currentEnemyHp / combat.currentEnemyMaxHp) * 100);
  const playerHpPercent = Math.max(0, (combat.playerHp / calculateMaxHp(state)) * 100);
  const clickDmg = calculateClickDamage(state);
  const dps = calculateDPS(state);
  const now = time;

  const element = ELEMENTS.find(e => e.id === enemyStats.element);

  // --- BATTLEFIELD ARENA STATES ---
  const [prevHp, setPrevHp] = useState(combat.currentEnemyHp);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; text: string; x: number; y: number; isCrit: boolean; isDps: boolean }[]>([]);
  const [projectiles, setProjectiles] = useState<{ id: number; emoji: string; y: number }[]>([]);
  const [slashEffect, setSlashEffect] = useState<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [playerDash, setPlayerDash] = useState(false);

  // Monitor HP changes to spawn damage numbers
  useEffect(() => {
    if (combat.currentEnemyHp < prevHp) {
      const diff = prevHp - combat.currentEnemyHp;
      if (diff > 0.01) {
        const isDpsTick = dps > 0 && Math.abs(diff - (dps / 10)) < 0.01;
        const randX = 70 + (Math.random() * 20 - 10); // around enemy (right side of stage)
        const randY = 30 + (Math.random() * 30 - 15);
        
        const newDmg = {
          id: Date.now() + Math.random(),
          text: formatNumber(diff),
          x: randX,
          y: randY,
          isCrit: !isDpsTick && diff > clickDmg * 1.5,
          isDps: isDpsTick,
        };
        setDamageNumbers(prev => [...prev.slice(-15), newDmg]);
        setTimeout(() => {
          setDamageNumbers(prev => prev.filter(d => d.id !== newDmg.id));
        }, 1000);
      }
    }
    setPrevHp(combat.currentEnemyHp);
  }, [combat.currentEnemyHp, prevHp, clickDmg, dps]);

  // Projectiles emitter based on active workers
  useEffect(() => {
    const activeInterval = setInterval(() => {
      const activeProj: string[] = [];
      if (state.workers.archer && state.workers.archer > 0) activeProj.push('🏹');
      if (state.workers.mage && state.workers.mage > 0) activeProj.push('✨');
      if (state.workers.dragon_tamer && state.workers.dragon_tamer > 0) activeProj.push('🔥');

      if (activeProj.length > 0) {
        const emoji = activeProj[Math.floor(Math.random() * activeProj.length)];
        const newProj = {
          id: Date.now() + Math.random(),
          emoji,
          y: 25 + Math.random() * 40,
        };
        setProjectiles(prev => [...prev.slice(-10), newProj]);
        setTimeout(() => {
          setProjectiles(prev => prev.filter(p => p.id !== newProj.id));
        }, 800);
      }
    }, 800);

    return () => clearInterval(activeInterval);
  }, [state.workers]);

  // Local animation-only loop for Auto-Battle
  useEffect(() => {
    if (!state.settings.autoBattle) return;
    const rageExp = state.activePotions.rage || 0;
    const hasRage = Date.now() < rageExp;
    const attackSpeed = hasRage ? 150 : 300;

    const interval = setInterval(() => {
      setPlayerDash(true);
      setTimeout(() => setPlayerDash(false), 75);

      setHitAnim(true);
      setTimeout(() => setHitAnim(false), 100);

      // Trigger a visual slash effect on the enemy mob (right side of stage)
      const randX = 260 + (Math.random() * 60 - 30);
      const randY = 120 + (Math.random() * 60 - 30);
      setSlashEffect({ x: randX, y: randY, active: true });
      setTimeout(() => setSlashEffect(prev => ({ ...prev, active: false })), 250);
    }, attackSpeed);

    return () => clearInterval(interval);
  }, [state.settings.autoBattle, state.activePotions.rage]);

  const onAttack = useCallback((e: React.MouseEvent) => {
    setPlayerDash(true);
    setTimeout(() => setPlayerDash(false), 150);

    setHitAnim(true);
    setTimeout(() => setHitAnim(false), 200);

    // Position click effect relative to arena
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSlashEffect({ x, y, active: true });
    setTimeout(() => setSlashEffect(prev => ({ ...prev, active: false })), 250);

    handleAttack({ clientX: e.clientX, clientY: e.clientY });
  }, [handleAttack]);

  // --- RENDER HELPERS ---
  const workerList = Object.entries(state.workers)
    .filter(([, count]) => count > 0)
    .map(([id]) => WORKERS.find(w => w.id === id)?.emoji || '👤')
    .slice(0, 3);
  const hasWorkers = workerList.length > 0;

  const activePetsList = state.pets.active
    .map(instanceId => {
      const pet = state.pets.inventory.find(p => p.instanceId === instanceId);
      if (!pet) return null;
      const config = PETS_CONFIG.find(c => c.id === pet.petId);
      return { id: pet.petId, emoji: config?.emoji || '🐱' };
    })
    .filter(Boolean) as { id: string; emoji: string }[];

  const equippedHand = state.inventory.equipped.hand;
  const weaponItem = equippedHand ? state.inventory.items.find(i => i.instanceId === equippedHand) : null;
  const weaponDef = weaponItem ? getItemDef(weaponItem.itemId) : null;
  
  const equippedHead = state.inventory.equipped.head;
  const headItem = equippedHead ? state.inventory.items.find(i => i.instanceId === equippedHead) : null;
  const headDef = headItem ? getItemDef(headItem.itemId) : null;

  let weaponEmoji = '⚔️';
  if (weaponDef) {
    if (weaponDef.name.includes('Bow')) weaponEmoji = '🏹';
    else if (weaponDef.name.includes('Staff') || weaponDef.name.includes('Wand')) weaponEmoji = '🪄';
    else if (weaponDef.name.includes('Axe')) weaponEmoji = '🪓';
    else weaponEmoji = '🗡️';
  }

  let helmetEmoji = '';
  if (headDef) {
    if (headDef.name.includes('Crown')) helmetEmoji = '👑';
    else if (headDef.name.includes('Hat')) helmetEmoji = '🎩';
    else if (headDef.name.includes('Hood')) helmetEmoji = '🥷';
    else helmetEmoji = '🪖';
  }

  return (
    <div className="combat-view">
      <div className="combat-main">
        {/* Wave info */}
        <div className="wave-info">
          <span>Wave</span>
          <span className="wave-number">{combat.currentWave}</span>
          <span style={{ color: 'var(--text-muted)' }}>
            ({combat.enemiesDefeated}/{combat.currentWave % 5 === 0 ? 1 : 5})
          </span>
          {element && (
            <span style={{ color: element.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Twemoji emoji={element.emoji} /> {element.name}
            </span>
          )}
          <span>Highest: {stats.highestWave}</span>
          <button
            className={`btn btn-xs ${state.settings.autoBattle ? 'btn-success' : 'btn-secondary'}`}
            onClick={(e) => {
              e.stopPropagation();
              updateSettings({ autoBattle: !state.settings.autoBattle });
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 26, padding: '0 8px' }}
          >
            <Twemoji emoji="🤖" /> {state.settings.autoBattle ? 'AUTO ON' : 'AUTO OFF'}
          </button>

          {state.upgrades.autoSkill > 0 && (
            <button
              className={`btn btn-xs ${state.settings.autoSkills ? 'btn-success' : 'btn-secondary'}`}
              onClick={(e) => {
                e.stopPropagation();
                updateSettings({ autoSkills: !state.settings.autoSkills });
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 26, padding: '0 8px', marginLeft: 8 }}
            >
              <Twemoji emoji="🔮" /> {state.settings.autoSkills ? 'AUTO SKILLS ON' : 'AUTO SKILLS OFF'}
            </button>
          )}
        </div>

        {/* Battlefield Arena Display */}
        <div
          className="battlefield-container"
          onClick={onAttack}
        >
          <div className="battlefield-bg" />
          
          {combat.isBossGate && !combat.bossFightActive && (
            <div style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: 8,
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              zIndex: 10,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              width: '90%',
              maxWidth: '420px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Twemoji emoji="🚪" style={{ width: 24, height: 24 }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#facc15' }}>Boss Gate</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Farming wave enemies. Challenge boss when ready.</div>
                </div>
              </div>
              <button
                className="btn btn-gold btn-sm"
                onClick={(e) => { e.stopPropagation(); summonBoss(); }}
                disabled={state.resources.bossKeys < 1}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 32, padding: '0 12px', fontSize: 11, fontWeight: 700 }}
              >
                <Twemoji emoji="🔑" /> Summon Boss ({state.resources.bossKeys})
              </button>
            </div>
          )}

          <div className="battlefield-stage">
            {/* Left Side: Allies */}
            <div className="battlefield-left">
              <div className="battlefield-allies">
                {/* Workers Squad */}
                {hasWorkers && (
                  <div className="army-minions-grid">
                    {workerList.map((emoji, idx) => (
                      <span key={idx} className="minion-sprite">
                        <Twemoji emoji={emoji} />
                      </span>
                    ))}
                  </div>
                )}

                {/* Active Pets Squad */}
                {activePetsList.length > 0 && (
                  <div className="pets-squad">
                    {activePetsList.map((p, idx) => (
                      <span key={idx} className="pet-sprite">
                        <Twemoji emoji={p.emoji} />
                      </span>
                    ))}
                  </div>
                )}

                {/* Player Hero Stack (Terraria Styled pixel-art SVGs) */}
                <div className={`hero-sprite-stack ${playerDash ? 'dashing' : ''}`}>
                  <span className="hero-base">
                    {renderHeroBody()}
                  </span>
                  <span className="hero-weapon">
                    {renderWeaponSVG(weaponEmoji)}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Space: Projectiles */}
            {projectiles.map(p => (
              <span
                key={p.id}
                className="projectile"
                style={{ top: `${p.y}%` }}
              >
                <Twemoji emoji={p.emoji} />
              </span>
            ))}

            {/* Right Side: Enemy Mob */}
            <div className="battlefield-right">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: enemyStats.color || 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {combat.bossFightActive ? '⚠️ BOSS' : (combat.currentModifier ? `${enemyStats.modifier?.toUpperCase()}` : '')}
                </div>
                <div className={`enemy-sprite ${hitAnim ? 'hit' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Twemoji emoji={enemyStats.emoji} style={{ width: 80, height: 80 }} />
                </div>
                <div className="enemy-name" style={{ color: enemyStats.color || 'var(--text-primary)', fontSize: 14 }}>
                  {enemyStats.name}
                </div>
              </div>
            </div>

            {/* Click Slash Effect */}
            {slashEffect.active && (
              <span
                className="slash-effect"
                style={{ left: slashEffect.x, top: slashEffect.y }}
              >
                💥
              </span>
            )}

            {/* Floating Damage Popups */}
            {damageNumbers.map(d => (
              <span
                key={d.id}
                className={`floating-damage ${d.isCrit ? 'crit' : d.isDps ? 'dps' : 'normal'}`}
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {d.isCrit ? 'CRIT! ' : ''}-{d.text}
              </span>
            ))}
          </div>

          {/* Enemy HP bar overlay */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '360px', zIndex: 5 }}>
            <div className="progress-bar progress-bar-lg enemy">
              <div className="label">{formatNumber(Math.max(0, combat.currentEnemyHp))} / {formatNumber(combat.currentEnemyMaxHp)}</div>
              <div className="fill" style={{ width: `${hpPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Player HP */}
        <div className="player-hp-container">
          <div className="player-hp-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Twemoji emoji="❤️" /> Your HP
            </span>
            <span>{formatNumber(Math.max(0, combat.playerHp))} / {formatNumber(calculateMaxHp(state))}</span>
          </div>
          <div className="progress-bar hp">
            <div className="fill" style={{ width: `${playerHpPercent}%` }} />
          </div>
        </div>

        {/* Skills */}
        <div className="skill-bar">
          {SKILLS.filter(s => combat.currentWave >= s.unlockWave).map(skill => {
            const cooldownEnd = state.skills[skill.id] || 0;
            const onCooldown = now < cooldownEnd;
            const cooldownMult = state.faction === 'conclave' ? 0.5 : 1.0;
            const actualCooldownDuration = skill.cooldown * cooldownMult;
            const remainingSeconds = onCooldown ? Math.ceil((cooldownEnd - now) / 1000) : 0;
            const skillKeys: Record<string, string> = {
              heavy_strike: '1',
              heal: '2',
              rage: '3',
              midas_touch: '4',
            };

            return (
              <button
                key={skill.id}
                className={`skill-btn ${onCooldown ? 'on-cooldown' : ''}`}
                onClick={() => activateSkill(skill.id)}
                title={`${skill.name}: ${skill.description}`}
                style={{ borderColor: skill.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
              >
                <span style={{ position: 'absolute', top: 2, right: 4, fontSize: 8, fontWeight: 900, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.6)', padding: '0px 3px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
                  {skillKeys[skill.id]}
                </span>
                <Twemoji emoji={skill.emoji} style={{ width: 28, height: 28 }} />
                {onCooldown && (
                  <>
                    <div className="cooldown-overlay" style={{ height: `${(remainingSeconds / actualCooldownDuration) * 100}%` }} />
                    <div className="cooldown-text">{remainingSeconds}s</div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Combat sidebar */}
      <div className="combat-sidebar">
        <div className="glass-card" style={{ padding: 'var(--space-md)' }}>
          <div className="card-title" style={{ fontSize: 13, marginBottom: 'var(--space-sm)' }}>
            <Twemoji emoji="⚔️" /> Combat Stats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Click DMG</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-damage)' }}>{formatNumber(clickDmg)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Army DPS</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-health)' }}>{formatNumber(dps)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Kills</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{formatNumber(stats.totalKills)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Rebirths</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#ec4899' }}>{stats.rebirths}</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 'var(--space-md)' }}>
          <div className="card-title" style={{ fontSize: 13, marginBottom: 'var(--space-sm)' }}>
            <Twemoji emoji="🎰" /> Drop Rates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Gems 💎</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>5.00%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Stardust ✨</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>2.00%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Bag of Gold 💰</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>10.00%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Boss Key 🔑</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>0.10%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Cache Drop 📦</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)' }}>{(1 + (state.upgrades.chestDropChance || 0)) * 1}.00%</span>
            </div>
          </div>
        </div>

        {/* Active effects */}
        {Object.entries(state.activePotions).filter(([, exp]) => exp > now).length > 0 && (
          <div className="glass-card" style={{ padding: 'var(--space-md)' }}>
            <div className="card-title" style={{ fontSize: 13, marginBottom: 'var(--space-sm)' }}>
              <Twemoji emoji="✨" /> Active Effects
            </div>
            {Object.entries(state.activePotions)
              .filter(([, exp]) => exp > now)
              .map(([id, exp]) => (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>{id.replace(/_/g, ' ')}</span>
                  <span style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-mono)' }}>
                    {id === 'midas_touch' ? 'Next Kill' : `${Math.ceil((exp - now) / 1000)}s`}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
