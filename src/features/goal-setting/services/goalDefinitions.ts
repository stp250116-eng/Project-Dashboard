/**
 * Goal Setting definitions: centralized metadata for all 5 annual developer goals.
 * Each goal references a Jira filter ID and has a target/threshold for scoring.
 */

import {
  JIRA_TRAINING_FILTER,
  JIRA_DEFECT_FILTER,
  JIRA_COMPLEXITY_FILTER,
  JIRA_OVERDUE_FILTER,
} from '@integrations/jira/jiraConstants';
import type { GoalDefinition, GoalType } from '../models/goalModels';

/**
 * All 5 goal definitions with targets, thresholds, and weights.
 * Weights must sum to 1.0 across all goals.
 */
export const GOAL_DEFINITIONS: Record<GoalType, GoalDefinition> = {
  training: {
    id: 'training',
    label: 'Resource Upskilling',
    description: 'Training hours completed annually',
    goalType: 'must-reach',
    target: 40,
    unit: 'hrs',
    weight: 0.15,
    jiraFilterId: JIRA_TRAINING_FILTER.id,
    jiraFilterName: JIRA_TRAINING_FILTER.name,
  },

  defectLow: {
    id: 'defectLow',
    label: 'Low-Level Defect Rate',
    description: 'Keep low-severity defects below threshold',
    goalType: 'must-not-exceed',
    threshold: 8, // percent of complexity points
    unit: '%',
    weight: 0.2,
    jiraFilterId: JIRA_DEFECT_FILTER.id,
    jiraFilterName: JIRA_DEFECT_FILTER.name,
  },

  defectHigh: {
    id: 'defectHigh',
    label: 'High-Level Defect Rate',
    description: 'Keep high-severity defects below threshold',
    goalType: 'must-not-exceed',
    threshold: 5, // percent of complexity points
    unit: '%',
    weight: 0.25,
    jiraFilterId: JIRA_DEFECT_FILTER.id,
    jiraFilterName: JIRA_DEFECT_FILTER.name,
  },

  complexity: {
    id: 'complexity',
    label: 'High-Impact Delivery',
    description: 'Complexity points delivered',
    goalType: 'must-reach',
    target: 220,
    unit: 'pts',
    weight: 0.2,
    jiraFilterId: JIRA_COMPLEXITY_FILTER.id,
    jiraFilterName: JIRA_COMPLEXITY_FILTER.name,
  },

  overdue: {
    id: 'overdue',
    label: 'Delivery Efficiency',
    description: 'Minimize overdue items',
    goalType: 'must-not-exceed',
    threshold: 10, // percent
    unit: '%',
    weight: 0.2,
    jiraFilterId: JIRA_OVERDUE_FILTER.id,
    jiraFilterName: JIRA_OVERDUE_FILTER.name,
  },
};

/**
 * Get the label for a goal type.
 */
export function getGoalLabel(goalType: GoalType): string {
  return GOAL_DEFINITIONS[goalType]?.label ?? goalType;
}

/**
 * Get the full definition for a goal type.
 */
export function getGoalDefinition(goalType: GoalType): GoalDefinition {
  const def = GOAL_DEFINITIONS[goalType];
  if (!def) {
    throw new Error(`Unknown goal type: ${goalType}`);
  }
  return def;
}
