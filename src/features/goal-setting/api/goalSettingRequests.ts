/**
 * Goal Setting API requests — fetches data from Jira filters and aggregates by developer.
 * Provides high-level functions that combine multiple Jira queries into goal metrics.
 */

import {
  JIRA_DEFECT_FILTER,
  JIRA_OVERDUE_FILTER,
  JIRA_PARTICIPATION_FILTER,
  JIRA_DEFAULT_MAX_RESULTS,
} from '@integrations/jira/jiraConstants';
import { jiraApi } from '@integrations/jira/jiraApi';
import { createApiClient } from '@shared/api';
import { appConfig } from '@shared/constants/appConfig';
import { JIRA_ENDPOINTS } from '@integrations/jira/jiraConstants';
import type { RawJiraIssue } from '@integrations/jira/jiraTypes';
import { mapTrainingRecords } from '@features/developer-training-dashboard/services/developerTrainingMapper';
// complexityAnalytics helpers intentionally omitted to avoid unused imports
import { complexityApi } from '@features/complexity-point/api/complexityApi';
import { GOAL_DEFINITIONS } from '../services/goalDefinitions';
import { calculateGoalStatus, calculateSubScore, rankDevelopers } from '../services/goalScoring';
import type { DeveloperGoal, DeveloperGoalData, GoalType } from '../models/goalModels';
// keep imports above in consistent order

// Helper: fetch all Jira issues for a JQL by paging startAt/maxResults
// Prefer jiraApi.fetchAllIssues when available (production path). In tests
// some mocks only provide a subset of jiraApi — fall back to a direct
// client call so unit tests that mock `createApiClient` continue to work.
const fetchAllJiraIssues = async <T = RawJiraIssue>(jql: string, fields: string[] = []): Promise<T[]> => {
  if (typeof (jiraApi as any).fetchAllIssues === 'function') {
    const fetchFn = (jiraApi as any).fetchAllIssues as <U = RawJiraIssue>(jql: string, fields?: string) => Promise<U[]>;
    return fetchFn<T>(jql, fields.join(','));
  }

  const client = createApiClient(appConfig.jiraApiBase);
  try {
    const resp = await Promise.resolve(client.get({
      url: JIRA_ENDPOINTS.search,
      params: { jql, maxResults: JIRA_DEFAULT_MAX_RESULTS, fields: fields.join(',') },
    } as any));
    if (resp && typeof resp === 'object' && 'data' in resp) {
      return (resp as any).data?.issues ?? [];
    }
  } catch {
    // fall through to return empty list on error
  }
  return [];
};

/**
 * Fetch training information from Jira filter.
 * Returns map of developerId -> training hours.
 */
// ...existing code...
export async function getTrainingInformation(_year: number): Promise<Record<string, number>> {
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
export async function getAlmDefects(_year: number): Promise<Record<string, { low: number; medium: number; high: number; critical: number }>> {
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
export async function getComplexityPoints(_year: number): Promise<Record<string, number>> {
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
export async function getOverdueItems(_year: number): Promise<Record<string, number>> {
  const filterId = JIRA_OVERDUE_FILTER.id;
  const issues = await fetchAllJiraIssues<RawJiraIssue>(`filter = ${filterId}`, ['assignee', 'duedate', 'status']);

  const byDeveloper: Record<string, number> = {};

  for (const issue of issues) {
    const assigneeName = issue.fields?.assignee?.displayName;
    const accountId = issue.fields?.assignee?.accountId;
    const devId = assigneeName ?? accountId ?? 'Unassigned';

    if (!byDeveloper[devId]) {
      byDeveloper[devId] = 0;
    }
    byDeveloper[devId] += 1;
  }

  return byDeveloper;
}

/**
 * Fetch overdue participation records and compute per-developer unique parent issue counts.
 * Returns map of developerId -> { overduePoints: number, totalParticipation: number }
 */
export async function getOverdueParticipation(year: number): Promise<Record<string, { overduePoints: number; totalParticipation: number }>> {
  // Use the pagination helper to ensure we retrieve all overdue issues
  const filterId = JIRA_OVERDUE_FILTER.id;
  const issues = await fetchAllJiraIssues<RawJiraIssue>(`filter = ${filterId}`, ['assignee', 'parent']);

  // Build set of unique parent issues per developer for overdue points
  const developerOverdueParents = new Map<string, Set<string>>();
  for (const issue of issues) {
    const assigneeName = issue.fields?.assignee?.displayName ?? 'Unassigned';
    const parentId = issue.fields?.parent?.key ?? 'Unknown';

    const set = developerOverdueParents.get(assigneeName) ?? new Set<string>();
    set.add(parentId);
    developerOverdueParents.set(assigneeName, set);
  }

  // Fetch overall participation totals (unique parent issues per developer)
  const participationTotals = await getTotalParticipation(year);

  const result: Record<string, { overduePoints: number; totalParticipation: number }> = {};
  for (const [dev, overdueSet] of developerOverdueParents.entries()) {
    const overduePoints = overdueSet.size;
    const totalParticipation = participationTotals[dev] ?? 0;
    result[dev] = { overduePoints, totalParticipation };
  }

  return result;
}

/**
 * Fetch Total Epic Participation per developer using saved filter ID 13725.
 * Returns map of developerId -> totalParticipation (unique parent issue count).
 */
export async function getTotalParticipation(_year: number): Promise<Record<string, number>> {
  const filterId = JIRA_PARTICIPATION_FILTER.id;

  // Reuse the pagination helper to retrieve all participation issues
  const allIssues = await fetchAllJiraIssues(`filter = ${filterId}`, ['assignee', 'parent']);

  const developerParents = new Map<string, Set<string>>();

  for (const issue of allIssues) {
    const assignee = issue.fields?.assignee;
    const assigneeName = (assignee?.displayName || assignee?.accountId || 'Unassigned').toString().trim();

    const parentField = issue.fields?.parent;
    const parentId = parentField?.key ?? parentField?.id ?? issue.key ?? 'Unknown';

    const set = developerParents.get(assigneeName) ?? new Set<string>();
    if (parentId) set.add(parentId);
    developerParents.set(assigneeName, set);
  }

  const result: Record<string, number> = {};
  for (const [dev, set] of developerParents.entries()) {
    result[dev] = set.size;
  }

  return result;
}

/**
 * Main aggregator function: fetch all 4 data sources in parallel and compute goal data for all developers.
 * Returns ranked list of DeveloperGoalData, sorted by overall score descending.
 */
export async function fetchGoalSettingData(year: number): Promise<DeveloperGoalData[]> {
  try {
    // Fetch all data in parallel
    
    const [training, defects, complexity, overdue, overdueParticipation, totalParticipation] = await Promise.all([
      getTrainingInformation(year),
      getAlmDefects(year),
      getComplexityPoints(year),
      getOverdueItems(year),
      getOverdueParticipation(year),
      getTotalParticipation(year),
    ]);
    // Normalize developer keys across sources to avoid mismatches caused by
    // punctuation/spacing differences in displayName (e.g. 'Pongpon.Supatpitak'
    // vs 'Pongpon Supatpitak'). We'll build canonical maps keyed by a
    // normalized id while preserving a preferred displayName for UI.
    const normalize = (s: unknown) =>
      (String(s ?? 'Unassigned').toLowerCase().replace(/[^a-z0-9]/g, '') || 'unassigned');

    const nameByCanonical = new Map<string, string>();
    const canonicalKeys = new Set<string>();

    const addKeysFrom = (obj: Record<string, unknown>) => {
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
    addKeysFrom(overdueParticipation);
    addKeysFrom(totalParticipation);

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
      const overduePart = findValue<{ overduePoints: number; totalParticipation: number }>(overdueParticipation, { overduePoints: 0, totalParticipation: 0 });
      const totalPartCount = findValue<number>(totalParticipation, 0);

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
      // Use totalParticipation from the saved participation filter when available,
      // otherwise fall back to the overdue participation's totalParticipation.
      const denominator = totalPartCount > 0 ? totalPartCount : overduePart.totalParticipation;
      const overduePercent = denominator > 0 ? (overduePart.overduePoints / denominator) * 100 : 0;

      // Build individual goal objects
      const goals: Record<GoalType, DeveloperGoal> = {
        training: {
          type: 'training',
          actual: trainingHours,
          target: GOAL_DEFINITIONS.training.target,
          // Pass the goal id so scoring logic can apply training-specific rules
          status: calculateGoalStatus('must-reach', trainingHours, GOAL_DEFINITIONS.training.target!, 'training'),
          subScore: calculateSubScore('must-reach', trainingHours, GOAL_DEFINITIONS.training.target!),
        },
        defectLow: {
          type: 'defectLow',
          actual: defectLowPercent,
          threshold: GOAL_DEFINITIONS.defectLow.threshold,
          // Pass goal id so scoring applies Low-Level Defect Rate bespoke bands
          status: calculateGoalStatus('must-not-exceed', defectLowPercent, GOAL_DEFINITIONS.defectLow.threshold!, 'defectLow'),
          subScore: calculateSubScore('must-not-exceed', defectLowPercent, GOAL_DEFINITIONS.defectLow.threshold!),
        },
        defectHigh: {
          type: 'defectHigh',
          actual: defectHighPercent,
          threshold: GOAL_DEFINITIONS.defectHigh.threshold,
          // Pass goal id so scoring applies High-Level bespoke bands
          status: calculateGoalStatus('must-not-exceed', defectHighPercent, GOAL_DEFINITIONS.defectHigh.threshold!, 'defectHigh'),
          subScore: calculateSubScore('must-not-exceed', defectHighPercent, GOAL_DEFINITIONS.defectHigh.threshold!),
        },
        complexity: {
          type: 'complexity',
          actual: complexityPts,
          target: GOAL_DEFINITIONS.complexity.target,
          status: calculateGoalStatus('must-reach', complexityPts, GOAL_DEFINITIONS.complexity.target!, 'complexity'),
          subScore: calculateSubScore('must-reach', complexityPts, GOAL_DEFINITIONS.complexity.target!),
        },
        overdue: {
          type: 'overdue',
          actual: overduePercent,
          threshold: GOAL_DEFINITIONS.overdue.threshold,
          status: calculateGoalStatus('must-not-exceed', overduePercent, GOAL_DEFINITIONS.overdue.threshold!, 'overdue'),
          subScore: calculateSubScore('must-not-exceed', overduePercent, GOAL_DEFINITIONS.overdue.threshold!),
        },
      };
      const overallScore = Object.values(goals).reduce((sum, goal) => sum + goal.subScore * 0.2, 0);

      // Use the preserved displayName for UI, and canonicalId as the stable key
      const developerId = displayName;

        // Role overrides: map specific canonical developer ids to high-level roles
        const roleOverrides: Record<string, string> = {
          // High Level Role
          [normalize('Sittichart Phikunthong')]: 'Product Delivery Manager',
          [normalize('Puchong Kaewchote')]: 'L3 Sidecar/Support',
          [normalize('sukanya phikultong')]: 'L3 Sidecar/Support',

          // Senior Developer
          [normalize('Chalotorn.Tangkhajornkit')]: 'Senior Developer',
          [normalize('Pongpon.Supatpitak')]: 'Senior Developer',
          [normalize('Suknarin Chaikheaw')]: 'Senior Developer',

          // Junior Developer
          [normalize('Aattawut.Nutlamyong')]: 'Junior Developer',
          [normalize('Yotin Sara')]: 'Junior Developer',
          [normalize('Wasapon')]: 'Junior Developer',
          [normalize('Apisit Prompha')]: 'Junior Developer',
        };

        const resolvedRole = roleOverrides[canonicalId] ?? 'Engineer';

        return {
          developerId,
          name: displayName,
          role: resolvedRole,
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
    /* eslint-disable-next-line no-console */
    console.error('Error fetching goal setting data:', error);
    return [];
  }
}
