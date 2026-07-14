import { teamGoalService } from '../services/teamGoalService';
import { complexityApi } from '@features/complexity-point/api/complexityApi';

jest.mock('@features/complexity-point/api/complexityApi');

const mockedComplexityApi = complexityApi as jest.Mocked<typeof complexityApi>;

describe('teamGoalService', () => {
  it('computes throughput and excludes specified accountIds', async () => {
    mockedComplexityApi.getComplexityPoints.mockResolvedValue([
      { assignee: 'Alice', accountId: 'A1', complexity: 250 },
      { assignee: 'Bob', accountId: 'B1', complexity: 220 },
      { assignee: 'Eve', accountId: '712020:1d57f2eb-225a-4bf7-9e53-55c3d2141466', complexity: 100 },
    ] as any);

    const summary = await teamGoalService.fetchTeamGoalSummary();

    expect(summary.teamThroughput).toBe(470); // Alice + Bob (Eve excluded)
    expect(summary.includedDeveloperCount).toBe(2);
    expect(summary.teamTarget).toBe(2 * 220);
    expect(summary.pass).toBe(false);
  });
});
