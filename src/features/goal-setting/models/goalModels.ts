/**
 * Goal Setting feature type definitions.
 * Defines the domain model for developer annual performance goals.
 */

/** Goal identifier (one of 5 annual goals per developer). */
export type GoalType = 'training' | 'defectLow' | 'defectHigh' | 'complexity' | 'overdue';

/** Status of a goal against its target or threshold. */
export type GoalStatus = 'on-track' | 'at-risk' | 'off-track';

/** Single goal per developer with actual value, target, and computed status/score. */
export interface DeveloperGoal {
  type: GoalType;
  actual: number;
  target?: number; // for "must reach" goals
  threshold?: number; // for "must not exceed" goals
  status: GoalStatus;
  subScore: number; // 0-100, weighted contribution to overall score
}

/** Full developer annual goal profile with all 5 goals and ranking. */
export interface DeveloperGoalData {
  developerId: string;
  name: string;
  role: string;
  team: string;
  avatarUrl?: string;
  trainingSeconds?: number;
  goals: Record<GoalType, DeveloperGoal>;
  overallScore: number; // 0-100
  rank: number; // 1-indexed ranking by overall score
}

/** Metadata for a goal type (label, target, weight, etc.) */
export interface GoalDefinition {
  id: GoalType;
  label: string;
  description: string;
  goalType: 'must-reach' | 'must-not-exceed';
  target?: number; // for must-reach goals
  threshold?: number; // for must-not-exceed goals
  unit: string; // e.g., "hrs", "count", "pts"
  weight: number; // 0.0-1.0, must sum to 1.0 across all 5 goals
  jiraFilterId: number;
  jiraFilterName: string;
}
