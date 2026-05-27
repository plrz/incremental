"use client";
import React from 'react';
import type { GameState } from '@/engine/gameState';
import { SKILL_TREE_NODES } from '@/lib/gameConfig';
import { canPurchaseNode, getPointsInBranch, getTotalPointsSpent } from '@/engine/skillTree';
import Twemoji from './Twemoji';

interface SkillTreeViewProps {
  state: GameState;
  buySkillNode: (nodeId: string) => void;
  handleRespec: () => void;
}

export default function SkillTreeView({ state, buySkillNode, handleRespec }: SkillTreeViewProps) {
  const branches = ['warrior', 'commander', 'arcane'] as const;
  const branchMeta = {
    warrior: { name: 'Warrior', emoji: '🗡️', color: '#ef4444', desc: 'Click damage, crits, multi-hit' },
    commander: { name: 'Commander', emoji: '🛡️', color: '#22c55e', desc: 'Workers, gold, offline progress' },
    arcane: { name: 'Arcane', emoji: '🔮', color: '#a855f7', desc: 'Skills, cooldowns, rune power' },
  };

  const totalSpent = getTotalPointsSpent(state);
  const respecCost = 10 * Math.pow(2, state.skillTree.respecCount);

  return (
    <div>
      <div className="section-header">
        <div className="section-title"><Twemoji emoji="🧠" /> Skill Tree</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-skill-point)' }}>
            {state.resources.skillPoints} SP
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            ({totalSpent} spent)
          </span>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleRespec}
            disabled={state.resources.gems < respecCost || totalSpent === 0}
          >
            <Twemoji emoji="🔄" /> Respec ({respecCost}<Twemoji emoji="💎" />)
          </button>
        </div>
      </div>

      <div className="skill-tree-container">
        {branches.map(branch => {
          const meta = branchMeta[branch];
          const nodes = SKILL_TREE_NODES.filter(n => n.branch === branch).sort((a, b) => a.tier - b.tier);
          const branchPoints = getPointsInBranch(state, branch);

          return (
            <div key={branch} className="skill-branch">
              <div className={`branch-header ${branch}`}>
                <Twemoji emoji={meta.emoji} /> {meta.name}
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>{meta.desc}</div>
                <div style={{ fontSize: 10, fontWeight: 500, marginTop: 4 }}>{branchPoints} points invested</div>
              </div>

              {nodes.map(node => {
                const level = state.skillTree.nodes[node.id] || 0;
                const { canBuy, reason } = canPurchaseNode(state, node.id);
                const isMaxed = level >= node.maxLevel;
                const isLocked = !canBuy && !isMaxed;

                return (
                  <div
                    key={node.id}
                    className={`skill-node ${isLocked ? 'locked' : ''} ${isMaxed ? 'maxed' : ''} ${node.isKeystone ? 'keystone' : ''}`}
                    onClick={() => { if (canBuy) buySkillNode(node.id); }}
                    title={isLocked ? reason : ''}
                    style={{ borderColor: isMaxed ? 'var(--color-gold)' : node.isKeystone ? meta.color : undefined }}
                  >
                    <div className="skill-node-level" style={{ color: isMaxed ? 'var(--color-gold)' : meta.color }}>
                      {level}/{node.maxLevel}
                    </div>
                    <div className="skill-node-info">
                      <div className="skill-node-name">
                        {node.isKeystone && <Twemoji emoji="⭐" style={{ marginRight: 4 }} />}{node.name}
                      </div>
                      <div className="skill-node-desc">
                        {node.description}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        Cost: {node.costPerLevel} SP per level
                        {node.requires && ` • Requires: ${SKILL_TREE_NODES.find(n => n.id === node.requires)?.name}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
