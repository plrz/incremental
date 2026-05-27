/**
 * Zikki Incremental — Skill Tree Engine
 * 
 * Handles skill tree node purchasing, respec, and effect calculations.
 */

import type { GameState, SkillTreeState } from './gameState';
import { SKILL_TREE_NODES, type SkillTreeNodeDef } from '@/lib/gameConfig';

// ============================================================
// QUERIES
// ============================================================

/** Get node definition by ID */
export function getNodeDef(nodeId: string): SkillTreeNodeDef | undefined {
  return SKILL_TREE_NODES.find(n => n.id === nodeId);
}

/** Check if a node can be purchased */
export function canPurchaseNode(state: GameState, nodeId: string): { canBuy: boolean; reason?: string } {
  const node = getNodeDef(nodeId);
  if (!node) return { canBuy: false, reason: 'Node not found' };

  const currentLevel = state.skillTree.nodes[nodeId] || 0;

  // Check max level
  if (currentLevel >= node.maxLevel) {
    return { canBuy: false, reason: 'Max level reached' };
  }

  // Check cost
  if (state.resources.skillPoints < node.costPerLevel) {
    return { canBuy: false, reason: 'Not enough Skill Points' };
  }

  // Check prerequisite
  if (node.requires) {
    const parentLevel = state.skillTree.nodes[node.requires] || 0;
    if (parentLevel <= 0) {
      return { canBuy: false, reason: `Requires: ${getNodeDef(node.requires)?.name}` };
    }
  }

  return { canBuy: true };
}

/** Get all nodes for a specific branch */
export function getNodesForBranch(branch: 'warrior' | 'commander' | 'arcane'): SkillTreeNodeDef[] {
  return SKILL_TREE_NODES.filter(n => n.branch === branch);
}

/** Get total points invested in a branch */
export function getPointsInBranch(state: GameState, branch: 'warrior' | 'commander' | 'arcane'): number {
  let total = 0;
  SKILL_TREE_NODES.filter(n => n.branch === branch).forEach(node => {
    const level = state.skillTree.nodes[node.id] || 0;
    total += level * node.costPerLevel;
  });
  return total;
}

/** Get total points spent across all branches */
export function getTotalPointsSpent(state: GameState): number {
  let total = 0;
  SKILL_TREE_NODES.forEach(node => {
    const level = state.skillTree.nodes[node.id] || 0;
    total += level * node.costPerLevel;
  });
  return total;
}

// ============================================================
// MUTATIONS
// ============================================================

/** Purchase a skill tree node level */
export function purchaseNode(state: GameState, nodeId: string): GameState | null {
  const { canBuy } = canPurchaseNode(state, nodeId);
  if (!canBuy) return null;

  const node = getNodeDef(nodeId)!;
  const currentLevel = state.skillTree.nodes[nodeId] || 0;

  return {
    ...state,
    resources: {
      ...state.resources,
      skillPoints: state.resources.skillPoints - node.costPerLevel,
    },
    skillTree: {
      ...state.skillTree,
      nodes: {
        ...state.skillTree.nodes,
        [nodeId]: currentLevel + 1,
      },
    },
  };
}

/** Respec all skill tree nodes — returns all spent points */
export function respecSkillTree(state: GameState): GameState | null {
  const respecCost = 10 * Math.pow(2, state.skillTree.respecCount);

  if (state.resources.gems < respecCost) return null;

  const totalPointsSpent = getTotalPointsSpent(state);

  return {
    ...state,
    resources: {
      ...state.resources,
      gems: state.resources.gems - respecCost,
      skillPoints: state.resources.skillPoints + totalPointsSpent,
    },
    skillTree: {
      ...state.skillTree,
      nodes: {},
      respecCount: state.skillTree.respecCount + 1,
    },
  };
}

// ============================================================
// EFFECT AGGREGATION
// ============================================================

/** Get the aggregate effect of all skill tree nodes of a specific type */
export function getSkillTreeEffect(state: GameState, effectType: string): number {
  let total = 0;

  SKILL_TREE_NODES.forEach(node => {
    if (node.effect.type === effectType) {
      const level = state.skillTree.nodes[node.id] || 0;
      total += level * node.effect.valuePerLevel;
    }
  });

  return total;
}

/** Check if a keystone skill is unlocked */
export function isKeystoneUnlocked(state: GameState, nodeId: string): boolean {
  return (state.skillTree.nodes[nodeId] || 0) >= 1;
}
