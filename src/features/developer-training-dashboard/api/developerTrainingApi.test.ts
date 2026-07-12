import { developerTrainingApi } from './developerTrainingApi';
jest.mock('@integrations/jira', () => ({
  jiraApi: {
    getTrainingInformation: jest.fn(),
  },
}));

const mockJiraApi = require('@integrations/jira').jiraApi as jest.Mocked<
  typeof import('@integrations/jira').jiraApi
>;

describe('developerTrainingApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns training records from jiraApi', async () => {
    const sample = [ { fields: { assignee: { displayName: 'Alice' }, aggregatetimespent: 3600 } } ];
    mockJiraApi.getTrainingInformation.mockResolvedValue(sample as any);

    const res = await developerTrainingApi.getTrainingRecords(50);

    expect(mockJiraApi.getTrainingInformation).toHaveBeenCalledWith(50);
    expect(res).toBe(sample);
  });
});
