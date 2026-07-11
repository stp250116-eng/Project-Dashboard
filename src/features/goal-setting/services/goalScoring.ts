/**
 * Pure scoring logic for Goal Setting feature.
 * All functions are side-effect-free and unit-testable.
 */

import type { DeveloperGoal, DeveloperGoalData, GoalStatus, GoalType } from '../models/goalModels';

/** Multiplier for penalizing goals that exceed threshold by 3x or more. */
export const OVER_THRESHOLD_CEILING_MULTIPLIER = 3;

/**
 * Calculate goal status (on-track, at-risk, off-track) based on goal type and values.
 *
 * For "must-reach" goals: on-track if actual >= target * 0.9, at-risk if >= target * 0.7, else off-track.
 * For "must-not-exceed" goals: on-track if actual <= threshold, at-risk if <= threshold * 1.5, else off-track.
 */
export function calculateGoalStatus(
  goalType: 'must-reach' | 'must-not-exceed',
  actual: number,
  targetOrThreshold: number,
  // Optional identifier for goal-specific rule overrides (e.g. 'training')
  goalId?: string,
): GoalStatus {
  if (targetOrThreshold <= 0) return 'off-track';

  if (goalType === 'must-reach') {
    // Special-case: training goal has bespoke boundaries defined by product.
    if (goalId === 'training') {
      // Training thresholds:
      // - on-track: actual >= 0.75 * target
      // - at-risk: actual >= 0.41 * target
      // - off-track: actual <= 0.40 * target
      if (actual >= targetOrThreshold * 0.75) return 'on-track';
      if (actual >= targetOrThreshold * 0.41) return 'at-risk';
      return 'off-track';
    }

    // Special-case: complexity points have bespoke boundaries defined by product.
    if (goalId === 'complexity') {
      // Complexity thresholds:
      // - on-track: actual >= 0.65 * target
      // - at-risk: actual >= 0.45 * target
      // - off-track: actual < 0.45 * target
      if (actual >= targetOrThreshold * 0.65) return 'on-track';
      if (actual >= targetOrThreshold * 0.45) return 'at-risk';
      return 'off-track';
    }

    // Default must-reach behavior (used by complexity and others)
    if (actual >= targetOrThreshold * 0.9) return 'on-track';
    if (actual >= targetOrThreshold * 0.7) return 'at-risk';
    return 'off-track';
  }

  // must-not-exceed
  // Special-case: Low-Level Defect Rate uses bespoke boundaries (percentages)
    if (goalId === 'defectLow') {
      // Special-case Low-Level Defect Rate with product-defined bands:
      // - on-track: defectRate% <= 5%
      // - at-risk: defectRate% > 5% and <= 8%
      // - off-track: defectRate% > 8% (>=9% considered off-track in product guidance)
      if (actual <= 5) return 'on-track';
      if (actual > 5 && actual <= 8) return 'at-risk';
      return 'off-track';
  }
  
    // Special-case: High-Level Defect Rate bespoke bands
    if (goalId === 'defectHigh') {
              console.log(`calculateGoalStatus: goalId=${goalId}, actual=${actual}, targetOrThreshold=${targetOrThreshold}`);

      // Product rule:
      // - Passing threshold: 5%
      // - on-track: defectRate% < 3%
      // - at-risk: defectRate% >= 3% and <= 5%
      // - off-track: defectRate% > 5%
      if (actual < 3) return 'on-track';
      if (actual >= 3 && actual <= 5) return 'at-risk';
      return 'off-track';
    }

    // Special-case: Overdue Ratio bespoke bands (percentage)
    if (goalId === 'overdue') {

      // Product rule for Delivery Efficiency (Overdue Ratio %):
      // - on-track: overduePercent <= 5%
      // - at-risk: overduePercent >= 6% and <= 10%
      // - off-track: overduePercent > 10%
      if (actual <= 5) return 'on-track';
      if (actual >= 6 && actual <= 10) return 'at-risk';
      return 'off-track';
    }
  // Default must-not-exceed behavior
  if (actual <= targetOrThreshold) return 'on-track';
  if (actual <= targetOrThreshold * 1.5) return 'at-risk';
  return 'off-track';
}

/**
 * Calculate sub-score (0-100) for a single goal, based on goal type and actual vs. target/threshold.
 *
 * For "must-reach" goals: score = (actual / target) * 100, clamped to 100.
 * For "must-not-exceed" goals: score = max(0, 100 - ((actual - threshold) / threshold) * 100).
 * If actual exceeds threshold by 3x or more, apply ceiling multiplier penalty.
 */
export function calculateSubScore(
  goalType: 'must-reach' | 'must-not-exceed',
  actual: number,
  targetOrThreshold: number,
): number {
  if (targetOrThreshold <= 0) return 0;

  if (goalType === 'must-reach') {
    if (actual <= 0) return 0;
    const raw = (actual / targetOrThreshold) * 100;
    return Math.min(raw, 100);
  }

  // must-not-exceed
  if (actual <= targetOrThreshold) {
    return 100;
  }

  // For percentage-based thresholds (e.g., defect rates), `actual` is expected to be a percentage value.
  // Compute penalty as proportional overage percentage.
  const overagePercent = actual - targetOrThreshold;
  // Map overage into a penalty relative to the threshold: (overage / threshold) * 100
  const penalty = (overagePercent / targetOrThreshold) * 100;

  if (overagePercent <= 0) return 100;

  // If overage is severe, apply additional multiplier
  if (overagePercent >= targetOrThreshold * (OVER_THRESHOLD_CEILING_MULTIPLIER - 1)) {
    return Math.max(0, 100 - penalty * 1.5);
  }

  return Math.max(0, 100 - penalty);
}

/**
 * Calculate weighted overall score from all 5 goals.
 * Sums (subScore * weight) across all goals.
 */
export function calculateOverallScore(developer: DeveloperGoalData): number {
  const weights: Record<GoalType, number> = {
    training: 0.15,
    defectLow: 0.2,
    defectHigh: 0.25,
    complexity: 0.2,
    overdue: 0.2,
  };

  const sum = Object.entries(developer.goals).reduce((acc, [goalType, goal]) => {
    const weight = weights[goalType as GoalType];
    return acc + goal.subScore * weight;
  }, 0);

  return Math.round(sum * 100) / 100; // Round to 2 decimal places
}

/**
 * Sort developers by overall score (descending) and assign rank numbers (1-indexed).
 * Mutates the input array's rank field.
 */
export function rankDevelopers(developers: DeveloperGoalData[]): DeveloperGoalData[] {
  const sorted = [...developers].sort((a, b) => b.overallScore - a.overallScore);
  return sorted.map((dev, index) => ({
    ...dev,
    rank: index + 1,
  }));
}
