/**
 * Goal Setting API requests — fetches data from Jira filters and aggregates by developer.
 * Provides high-level functions that combine multiple Jira queries into goal metrics.
 */

import { createApiClient } from '@shared/api';
import { appConfig } from '@shared/constants/appConfig';
import {
  JIRA_TRAINING_FILTER,
  JIRA_DEFECT_FILTER,
  JIRA_COMPLEXITY_FILTER,
  JIRA_OVERDUE_FILTER,
  JIRA_DEFECT_FIELDS,
  JIRA_ENDPOINTS,
  JIRA_DEFAULT_MAX_RESULTS,
} from '@integrations/jira/jiraConstants';
import { jiraApi } from '@integrations/jira/jiraApi';
import { mapTrainingRecords } from '@features/developer-training-dashboard/services/developerTrainingMapper';
import { getComplexityValueFromFields, parseComplexityValue } from '@features/complexity-point/services/complexityAnalytics';
import { complexityApi } from '@features/complexity-point/api/complexityApi';
import { GOAL_DEFINITIONS } from '../services/goalDefinitions';
import {
  calculateGoalStatus,
  calculateSubScore,
  calculateOverallScore,
  rankDevelopers,
} from '../services/goalScoring';
import type { DeveloperGoal, DeveloperGoalData, GoalType } from '../models/goalModels';

/**
 * Fetch training information from Jira filter.
 * Returns map of developerId -> training hours.
 */
// ...existing code...
export async function getTrainingInformation(year: number): Promise<Record<string, number>> {
  // Return aggregated training time in seconds per developer so callers
  // can format minutes/seconds consistently with the Training Dashboard.
  const rawRecords = await jiraApi.getTrainingInformation(JIRA_DEFAULT_MAX_RESULTS);

  const mapped = mapTrainingRecords(rawRecords);

  const byDeveloper: Record<string, number> = {};

  for (const r of mapped) {
    const dev = r.developer ?? 'Unassigned';
    const secs = r.aggregatedTimeSeconds ?? 0;
    byDeveloper[dev] = (byDeveloper[dev] ?? 0) + secs;
  }

  return byDeveloper;
}
// ...existing code...
/**
 * Fetch defects from Jira filter.
 * Returns map of developerId -> { low: count, high: count }.
 */
export async function getAlmDefects(
  year: number,
): Promise<Record<string, { low: number; medium: number; high: number; critical: number }>> {
  const filterId = JIRA_DEFECT_FILTER.id;
  // Prefer jiraApi.getDefects which returns mapped defect records
  const defects = await jiraApi.getDefects(filterId, JIRA_DEFAULT_MAX_RESULTS);

  const byDeveloper: Record<string, { low: number; medium: number; high: number; critical: number }> = {};

  // jiraApi.getDefects returns normalized defects with `owner` and `severity`
  for (const d of defects) {
    const devId = d.owner || 'Unassigned';
    if (!byDeveloper[devId]) byDeveloper[devId] = { low: 0, medium: 0, high: 0, critical: 0 };
    const sev = (d.severity || 'Unknown').toLowerCase();
    if (sev === 'critical') {
      byDeveloper[devId].critical += 1;
    } else if (sev === 'high') {
      byDeveloper[devId].high += 1;
    } else if (sev === 'medium') {
      byDeveloper[devId].medium += 1;
    } else {
      // Treat Unknown or any other label as Low for the purpose of goal math
      byDeveloper[devId].low += 1;
    }
  }

  return byDeveloper;
}

/**
 * Fetch complexity points from Jira filter.
 * Returns map of developerId -> complexity points.
 */
export async function getComplexityPoints(year: number): Promise<Record<string, number>> {
  // Reuse canonical complexity API & mapper so Goal Setting uses the exact
  // same JQL, fields, and parsing logic as the Complexity dashboard.
  const records = await complexityApi.getComplexityPoints();
  const byDeveloper: Record<string, number> = {};
  for (const r of records) {
    const dev = r.assignee ?? 'Unassigned';
    byDeveloper[dev] = (byDeveloper[dev] ?? 0) + (typeof r.complexity === 'number' ? r.complexity : 0);
  }

  return byDeveloper;
}

/**
 * Fetch overdue items from Jira filter.
 * Returns map of developerId -> overdue item count.
 */
export async function getOverdueItems(year: number): Promise<Record<string, number>> {
  const filterId = JIRA_OVERDUE_FILTER.id;
  const jiraClient = createApiClient(appConfig.jiraApiBase);
  const { data } = await jiraClient.get<any>(JIRA_ENDPOINTS.search, {
    params: {
      jql: `filter = ${filterId}`,
      maxResults: JIRA_DEFAULT_MAX_RESULTS,
      fields: ['assignee', 'duedate', 'status'].join(','),
    },
  });

  const byDeveloper: Record<string, number> = {};

  if (data?.issues) {
    for (const issue of data.issues) {
      const assigneeName = issue.fields?.assignee?.displayName;
      const accountId = issue.fields?.assignee?.accountId;
      const devId = assigneeName ?? accountId ?? 'Unassigned';

      if (!byDeveloper[devId]) {
        byDeveloper[devId] = 0;
      }
      byDeveloper[devId] += 1;
    }
  }

  return byDeveloper;
}

/**
 * Main aggregator function: fetch all 4 data sources in parallel and compute goal data for all developers.
 * Returns ranked list of DeveloperGoalData, sorted by overall score descending.
 */
export async function fetchGoalSettingData(year: number): Promise<DeveloperGoalData[]> {
  try {
    // Fetch all data in parallel
    
    const [training, defects, complexity, overdue] = await Promise.all([
      getTrainingInformation(year),
      getAlmDefects(year),
      getComplexityPoints(year),
      getOverdueItems(year),
    ]);
    // Normalize developer keys across sources to avoid mismatches caused by
    // punctuation/spacing differences in displayName (e.g. 'Pongpon.Supatpitak'
    // vs 'Pongpon Supatpitak'). We'll build canonical maps keyed by a
    // normalized id while preserving a preferred displayName for UI.
    const normalize = (s: unknown) =>
      (String(s ?? 'Unassigned').toLowerCase().replace(/[^a-z0-9]/g, '') || 'unassigned');

    const nameByCanonical = new Map<string, string>();
    const canonicalKeys = new Set<string>();

    const addKeysFrom = (obj: Record<string, any>) => {
      for (const k of Object.keys(obj)) {
        const c = normalize(k);
        canonicalKeys.add(c);
        if (!nameByCanonical.has(c)) nameByCanonical.set(c, k);
      }
    };

    addKeysFrom(training);
    addKeysFrom(defects);
    addKeysFrom(complexity);
    addKeysFrom(overdue);

    // Build DeveloperGoalData for each canonical developer key
    const developers: DeveloperGoalData[] = Array.from(canonicalKeys).map((canonicalId) => {
      const displayName = nameByCanonical.get(canonicalId) ?? 'Unassigned';
      // Lookup original maps by trying to find matching raw key that maps to this canonicalId
      const findValue = <T>(obj: Record<string, T>, defaultValue: T): T => {
        for (const [k, v] of Object.entries(obj)) {
          if (normalize(k) === canonicalId) return v as T;
        }
        return defaultValue;
      };

      const trainingSeconds = findValue<number>(training, 0);
      const trainingHours = Math.round(((trainingSeconds ?? 0) / 3600) * 100) / 100;
      const defectCounts = findValue<Record<string, number>>(defects, { low: 0, medium: 0, high: 0, critical: 0 });
      const complexityPts = findValue<number>(complexity, 0);
      const overdueCounts = findValue<number>(overdue, 0);

      // Compute percent-based metrics relative to complexity points
      // If we have no complexity points, avoid reporting inflated percentages
      // (falling back to 1 caused counts like 5 -> 500%). When complexity is
      // missing, show 0% (no relative data) — callers may treat 0 as 'no data'.
      const defectLowPercent = complexityPts > 0
        ? (((defectCounts.low ?? 0) + (defectCounts.medium ?? 0)) / complexityPts) * 100
        : 0;
      const defectHighPercent = complexityPts > 0
        ? (((defectCounts.high ?? 0) + (defectCounts.critical ?? 0)) / complexityPts) * 100
        : 0;
      const overduePercent = complexityPts > 0 ? (overdueCounts / complexityPts) * 100 : 0;

      // Build individual goal objects
      const goals: Record<GoalType, DeveloperGoal> = {
        training: {
          type: 'training',
          actual: trainingHours,
          target: GOAL_DEFINITIONS.training.target,
          status: calculateGoalStatus('must-reach', trainingHours, GOAL_DEFINITIONS.training.target!),
          subScore: calculateSubScore('must-reach', trainingHours, GOAL_DEFINITIONS.training.target!),
        },
        defectLow: {
          type: 'defectLow',
          actual: defectLowPercent,
          threshold: GOAL_DEFINITIONS.defectLow.threshold,
          status: calculateGoalStatus('must-not-exceed', defectLowPercent, GOAL_DEFINITIONS.defectLow.threshold!),
          subScore: calculateSubScore('must-not-exceed', defectLowPercent, GOAL_DEFINITIONS.defectLow.threshold!),
        },
        defectHigh: {
          type: 'defectHigh',
          actual: defectHighPercent,
          threshold: GOAL_DEFINITIONS.defectHigh.threshold,
          status: calculateGoalStatus('must-not-exceed', defectHighPercent, GOAL_DEFINITIONS.defectHigh.threshold!),
          subScore: calculateSubScore('must-not-exceed', defectHighPercent, GOAL_DEFINITIONS.defectHigh.threshold!),
        },
        complexity: {
          type: 'complexity',
          actual: complexityPts,
          target: GOAL_DEFINITIONS.complexity.target,
          status: calculateGoalStatus('must-reach', complexityPts, GOAL_DEFINITIONS.complexity.target!),
          subScore: calculateSubScore('must-reach', complexityPts, GOAL_DEFINITIONS.complexity.target!),
        },
        overdue: {
          type: 'overdue',
          actual: overduePercent,
          threshold: GOAL_DEFINITIONS.overdue.threshold,
          status: calculateGoalStatus('must-not-exceed', overduePercent, GOAL_DEFINITIONS.overdue.threshold!),
          subScore: calculateSubScore('must-not-exceed', overduePercent, GOAL_DEFINITIONS.overdue.threshold!),
        },
      };

      const overallScore = Object.values(goals).reduce((sum, goal) => sum + goal.subScore * 0.2, 0);

      // Use the preserved displayName for UI, and canonicalId as the stable key
      const developerId = displayName;

      return {
        developerId,
        name: displayName,
        role: 'Engineer',
        team: 'Platform',
        trainingSeconds: trainingSeconds,
        goals,
        overallScore: Math.round(overallScore * 100) / 100,
        rank: 0,
      };
    });

    // Sort by rank
    return rankDevelopers(developers);
  } catch (error) {
    console.error('Error fetching goal setting data:', error);
    return [];
  }
}
