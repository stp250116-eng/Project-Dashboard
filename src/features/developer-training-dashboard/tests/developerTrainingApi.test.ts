import { developerTrainingApi } from '../api/developerTrainingApi';
import { jiraApi } from '@integrations/jira';

jest.mock('@integrations/jira');

const mockedJiraApi = jiraApi as jest.Mocked<typeof jiraApi>;

describe('developerTrainingApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrainingRecords', () => {
    it('calls jiraApi.getTrainingInformation with default page size', async () => {
      const mockRecords: any[] = [
        {
          id: '1',
          key: 'TRAIN-1',
          fields: {
            assignee: { displayName: 'Alice' },
            aggregatetimespent: 3600,
            customfield_11546: 'Training',
            customfield_11547: 'Vendor',
          },
        },
      ];

      mockedJiraApi.getTrainingInformation.mockResolvedValue(mockRecords as any);

      const result = await developerTrainingApi.getTrainingRecords();

      expect(mockedJiraApi.getTrainingInformation).toHaveBeenCalledWith(100);
      expect(result).toEqual(mockRecords);
    });

    it('calls jiraApi.getTrainingInformation with custom page size', async () => {
      const mockRecords: any[] = [];
      mockedJiraApi.getTrainingInformation.mockResolvedValue(mockRecords);

      await developerTrainingApi.getTrainingRecords(50);

      expect(mockedJiraApi.getTrainingInformation).toHaveBeenCalledWith(50);
    });

    it('returns records from jiraApi', async () => {
      const mockRecords = [
        {
          id: '1',
          key: 'TRAIN-1',
          fields: {
            assignee: { displayName: 'Alice' },
            aggregatetimespent: 3600,
            customfield_11546: 'Training',
            customfield_11547: 'Vendor',
          },
        },
        {
          id: '2',
          key: 'TRAIN-2',
          fields: {
            assignee: { displayName: 'Bob' },
            aggregatetimespent: 7200,
            customfield_11546: 'Course',
            customfield_11547: 'External',
          },
        },
      ];

        mockedJiraApi.getTrainingInformation.mockResolvedValue(mockRecords as any);

      const result = await developerTrainingApi.getTrainingRecords();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockRecords[0]);
      expect(result[1]).toEqual(mockRecords[1]);
    });

    it('handles empty result from jiraApi', async () => {
      mockedJiraApi.getTrainingInformation.mockResolvedValue([] as any);

      const result = await developerTrainingApi.getTrainingRecords();

      expect(result).toEqual([]);
    });

    it('propagates errors from jiraApi', async () => {
      const error = new Error('API Error');
      mockedJiraApi.getTrainingInformation.mockRejectedValue(error);

      await expect(developerTrainingApi.getTrainingRecords()).rejects.toThrow('API Error');
    });

    it('uses page size 100 as default', async () => {
      mockedJiraApi.getTrainingInformation.mockResolvedValue([] as any);

      await developerTrainingApi.getTrainingRecords();

      expect(mockedJiraApi.getTrainingInformation).toHaveBeenCalledWith(100);
    });

    it('respects custom page sizes', async () => {
      mockedJiraApi.getTrainingInformation.mockResolvedValue([] as any);

      await developerTrainingApi.getTrainingRecords(200);

      expect(mockedJiraApi.getTrainingInformation).toHaveBeenCalledWith(200);
    });
  });
});
