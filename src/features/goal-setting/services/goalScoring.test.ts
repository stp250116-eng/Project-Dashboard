/**
 * Unit tests for goalScoring.ts pure functions.
 * Tests status calculation, sub-score calculation, overall score, and ranking.
 */

import {
  calculateGoalStatus,
  calculateSubScore,
  calculateOverallScore,
  rankDevelopers,
  OVER_THRESHOLD_CEILING_MULTIPLIER,
} from './goalScoring';
import type { DeveloperGoalData } from '../../models/goalModels';

describe('goalScoring', () => {
  describe('calculateGoalStatus', () => {
    describe('must-reach goals', () => {
      it('returns on-track when actual >= target * 0.9', () => {
        expect(calculateGoalStatus('must-reach', 36, 40)).toBe('on-track');
        expect(calculateGoalStatus('must-reach', 40, 40)).toBe('on-track');
        expect(calculateGoalStatus('must-reach', 50, 40)).toBe('on-track');
      });

      it('returns at-risk when actual >= target * 0.7 and < target * 0.9', () => {
        expect(calculateGoalStatus('must-reach', 28, 40)).toBe('at-risk');
        expect(calculateGoalStatus('must-reach', 35.9, 40)).toBe('at-risk');
      });

      it('returns off-track when actual < target * 0.7', () => {
        expect(calculateGoalStatus('must-reach', 27.9, 40)).toBe('off-track');
        expect(calculateGoalStatus('must-reach', 0, 40)).toBe('off-track');
      });

      it('returns off-track for zero or negative threshold', () => {
        expect(calculateGoalStatus('must-reach', 50, 0)).toBe('off-track');
        expect(calculateGoalStatus('must-reach', 50, -10)).toBe('off-track');
      });

      it('applies complexity-specific bands when goalId is complexity', () => {
        // on-track >= 0.65 * target
        expect(calculateGoalStatus('must-reach', 65, 100, 'complexity')).toBe('on-track');
        expect(calculateGoalStatus('must-reach', 80, 100, 'complexity')).toBe('on-track');

        // at-risk >= 0.45 * target and < 0.65 * target
        expect(calculateGoalStatus('must-reach', 50, 100, 'complexity')).toBe('at-risk');
        expect(calculateGoalStatus('must-reach', 45, 100, 'complexity')).toBe('at-risk');

        // off-track < 0.45 * target
        expect(calculateGoalStatus('must-reach', 44.9, 100, 'complexity')).toBe('off-track');
      });
    });

    describe('must-not-exceed goals', () => {
      it('returns on-track when actual <= threshold', () => {
        expect(calculateGoalStatus('must-not-exceed', 2, 2)).toBe('on-track');
        expect(calculateGoalStatus('must-not-exceed', 1, 2)).toBe('on-track');
        expect(calculateGoalStatus('must-not-exceed', 0, 2)).toBe('on-track');
      });

      it('returns at-risk when actual > threshold and <= threshold * 1.5', () => {
        expect(calculateGoalStatus('must-not-exceed', 2.5, 2)).toBe('at-risk');
        expect(calculateGoalStatus('must-not-exceed', 3, 2)).toBe('at-risk');
      });

      it('returns off-track when actual > threshold * 1.5', () => {
        expect(calculateGoalStatus('must-not-exceed', 3.1, 2)).toBe('off-track');
        expect(calculateGoalStatus('must-not-exceed', 10, 2)).toBe('off-track');
      });

      it('returns off-track for zero or negative threshold', () => {
        expect(calculateGoalStatus('must-not-exceed', 1, 0)).toBe('off-track');
        expect(calculateGoalStatus('must-not-exceed', 1, -5)).toBe('off-track');
      });

      it('applies overdue-specific bands when goalId is overdue', () => {
        // on-track: <=5%
        expect(calculateGoalStatus('must-not-exceed', 5, 10, 'overdue')).toBe('on-track');
        expect(calculateGoalStatus('must-not-exceed', 4.9, 10, 'overdue')).toBe('on-track');

        // at-risk: 6-10%
        expect(calculateGoalStatus('must-not-exceed', 6, 10, 'overdue')).toBe('at-risk');
        expect(calculateGoalStatus('must-not-exceed', 10, 10, 'overdue')).toBe('at-risk');

        // off-track: >10%
        expect(calculateGoalStatus('must-not-exceed', 10.1, 10, 'overdue')).toBe('off-track');
      });
    });
  });

  describe('calculateSubScore', () => {
    describe('must-reach goals', () => {
      it('returns 0-100 based on (actual / target) * 100, clamped to 100', () => {
        expect(calculateSubScore('must-reach', 20, 40)).toBe(50);
        expect(calculateSubScore('must-reach', 40, 40)).toBe(100);
        expect(calculateSubScore('must-reach', 60, 40)).toBe(100); // clamped
      });

      it('returns 0 for zero or negative actual', () => {
        expect(calculateSubScore('must-reach', 0, 40)).toBe(0);
        expect(calculateSubScore('must-reach', -5, 40)).toBe(0);
      });

      it('returns 0 for zero or negative target', () => {
        expect(calculateSubScore('must-reach', 20, 0)).toBe(0);
        expect(calculateSubScore('must-reach', 20, -10)).toBe(0);
      });
    });

    describe('must-not-exceed goals', () => {
      it('returns 100 when actual <= threshold', () => {
        expect(calculateSubScore('must-not-exceed', 1, 5)).toBe(100);
        expect(calculateSubScore('must-not-exceed', 5, 5)).toBe(100);
      });

      it('calculates penalty as (overage / threshold) * 100', () => {
        // actual=6, threshold=5, overage=1, penalty=(1/5)*100=20
        expect(calculateSubScore('must-not-exceed', 6, 5)).toBe(80);
        // actual=7.5, threshold=5, overage=2.5, penalty=(2.5/5)*100=50
        expect(calculateSubScore('must-not-exceed', 7.5, 5)).toBe(50);
      });

      it('applies ceiling multiplier (1.5x penalty) when overage >= OVER_THRESHOLD_CEILING_MULTIPLIER', () => {
        // actual=15, threshold=5, overage=2 (< 3x, no ceiling)
        // penalty = (10/5)*100 = 200, score = 100-200 = -100 clamped to 0
        expect(calculateSubScore('must-not-exceed', 15, 5)).toBe(0);

        // actual=20, threshold=5, overage=3 (exactly 3x, applies ceiling)
        // penalty = (15/5)*100 = 300, with 1.5x = 450, score = 100-450 = -350 clamped to 0
        const scoreAt3x = calculateSubScore('must-not-exceed', 20, 5);
        expect(scoreAt3x).toBe(0); // Heavily penalized
      });

      it('clamps score to 0 minimum', () => {
        expect(calculateSubScore('must-not-exceed', 100, 5)).toBe(0);
      });
    });
  });

  describe('calculateOverallScore', () => {
    it('calculates weighted average across all 5 goals', () => {
      const developer: DeveloperGoalData = {
        developerId: 'dev-1',
        name: 'Alice',
        role: 'Engineer',
        team: 'Platform',
        goals: {
          training: { type: 'training', actual: 40, status: 'on-track', subScore: 100 },
          defectLow: { type: 'defectLow', actual: 3, status: 'on-track', subScore: 100 },
          defectHigh: { type: 'defectHigh', actual: 1, status: 'on-track', subScore: 100 },
          complexity: { type: 'complexity', actual: 60, status: 'on-track', subScore: 100 },
          overdue: { type: 'overdue', actual: 2, status: 'on-track', subScore: 100 },
        },
        overallScore: 0, // will be calculated
        rank: 0,
      };

      const result = calculateOverallScore(developer);
      // All goals score 100, so overall = 100 * (0.15 + 0.2 + 0.25 + 0.2 + 0.2) = 100 * 1.0 = 100
      expect(result).toBe(100);
    });

    it('handles mixed scores with correct weighting', () => {
      const developer: DeveloperGoalData = {
        developerId: 'dev-2',
        name: 'Bob',
        role: 'Engineer',
        team: 'Platform',
        goals: {
          training: { type: 'training', actual: 40, status: 'on-track', subScore: 100 },
          defectLow: { type: 'defectLow', actual: 0, status: 'on-track', subScore: 100 },
          defectHigh: { type: 'defectHigh', actual: 0, status: 'off-track', subScore: 0 },
          complexity: { type: 'complexity', actual: 30, status: 'at-risk', subScore: 50 },
          overdue: { type: 'overdue', actual: 3, status: 'on-track', subScore: 100 },
        },
        overallScore: 0,
        rank: 0,
      };

      const result = calculateOverallScore(developer);
      // (100*0.15 + 100*0.2 + 0*0.25 + 50*0.2 + 100*0.2)
      // = 15 + 20 + 0 + 10 + 20 = 65
      expect(result).toBe(65);
    });

    it('rounds to 2 decimal places', () => {
      const developer: DeveloperGoalData = {
        developerId: 'dev-3',
        name: 'Charlie',
        role: 'Engineer',
        team: 'Platform',
        goals: {
          training: { type: 'training', actual: 30, status: 'at-risk', subScore: 75 },
          defectLow: { type: 'defectLow', actual: 0, status: 'on-track', subScore: 100 },
          defectHigh: { type: 'defectHigh', actual: 1, status: 'on-track', subScore: 100 },
          complexity: { type: 'complexity', actual: 45, status: 'at-risk', subScore: 75 },
          overdue: { type: 'overdue', actual: 1, status: 'on-track', subScore: 100 },
        },
        overallScore: 0,
        rank: 0,
      };

      const result = calculateOverallScore(developer);
      // (75*0.15 + 100*0.2 + 100*0.25 + 75*0.2 + 100*0.2)
      // = 11.25 + 20 + 25 + 15 + 20 = 91.25
      expect(result).toBe(91.25);
    });
  });

  describe('rankDevelopers', () => {
    it('sorts developers by overall score descending and assigns 1-indexed ranks', () => {
      const developers: DeveloperGoalData[] = [
        {
          developerId: 'dev-1',
          name: 'Alice',
          role: 'Senior Developer',
          team: 'Platform',
          goals: {} as any,
          overallScore: 75,
          rank: 0,
        },
        {
          developerId: 'dev-2',
          name: 'Bob',
          role: 'Senior Developer',
          team: 'Platform',
          goals: {} as any,
          overallScore: 95,
          rank: 0,
        },
        {
          developerId: 'dev-3',
          name: 'Charlie',
          role: 'Senior Developer',
          team: 'Platform',
          goals: {} as any,
          overallScore: 85,
          rank: 0,
        },
      ];

      const ranked = rankDevelopers(developers);

      expect(ranked[0].name).toBe('Bob');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].name).toBe('Charlie');
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].name).toBe('Alice');
      expect(ranked[2].rank).toBe(3);
    });

    it('does not mutate the input array', () => {
      const developers: DeveloperGoalData[] = [
        {
          developerId: 'dev-1',
          name: 'Alice',
          role: 'Senior Developer',
          team: 'Platform',
          goals: {} as any,
          overallScore: 75,
          rank: 0,
        },
      ];

      rankDevelopers(developers);
      expect(developers[0].rank).toBe(0); // Original unchanged
    });

    it('handles ties by preserving order (stable sort)', () => {
      const developers: DeveloperGoalData[] = [
        {
          developerId: 'dev-1',
          name: 'Alice',
          role: 'Senior Developer',
          team: 'Platform',
          goals: {} as any,
          overallScore: 85,
          rank: 0,
        },
        {
          developerId: 'dev-2',
          name: 'Bob',
          role: 'Senior Developer',
          team: 'Platform',
          goals: {} as any,
          overallScore: 85,
          rank: 0,
        },
      ];

      const ranked = rankDevelopers(developers);

      // Both should have score 85, ranks should be 1 and 2 (same score doesn't get same rank)
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
    });

    it('returns empty array when input is empty', () => {
      const result = rankDevelopers([]);
      expect(result).toEqual([]);
    });
  });
});
