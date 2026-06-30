import { createApiClient } from '@shared/api';
import { complexityApi } from '../api/complexityApi';

jest.mock('@shared/api', () => {
  const mockGet = jest.fn();
  return {
    createApiClient: jest.fn(() => ({
      get: mockGet,
    })),
    __mockGet: mockGet,
  };
});

const { __mockGet } = jest.requireMock('@shared/api') as { __mockGet: jest.Mock };
const mockedCreateApiClient = createApiClient as jest.Mock;

describe('complexityApi', () => {
  beforeEach(() => {
    __mockGet.mockReset();
    mockedCreateApiClient.mockClear();
  });

  it('fetches complexity records from Jira and maps them to the feature model', async () => {
    __mockGet.mockResolvedValueOnce({
      data: {
        issues: [{ fields: { assignee: { displayName: 'Alice' }, customfield_10704: '6' } }],
        isLast: true,
        nextPageToken: undefined,
      },
    });

    const records = await complexityApi.getComplexityPoints();

    expect(records).toEqual([{ assignee: 'Alice', complexity: 6 }]);
    expect(__mockGet).toHaveBeenCalledTimes(1);
  });

  it('continues paging until the Jira search response is marked as last', async () => {
    __mockGet
      .mockResolvedValueOnce({
        data: {
          issues: [{ fields: { assignee: { displayName: 'Bob' }, customfield_10704: '3' } }],
          isLast: false,
          nextPageToken: 'page-2',
        },
      })
      .mockResolvedValueOnce({
        data: {
          issues: [{ fields: { assignee: { displayName: 'Cara' }, customfield_10704: '4' } }],
          isLast: true,
          nextPageToken: undefined,
        },
      });

    const records = await complexityApi.getComplexityPoints();

    expect(records).toEqual([
      { assignee: 'Bob', complexity: 3 },
      { assignee: 'Cara', complexity: 4 },
    ]);
    expect(__mockGet).toHaveBeenCalledTimes(2);
  });

  it('uses the fallback assignee label when Jira omits the assignee', async () => {
    __mockGet.mockResolvedValueOnce({
      data: {
        issues: [{ fields: { customfield_10704: '5' } }],
        isLast: true,
        nextPageToken: undefined,
      },
    });

    const records = await complexityApi.getComplexityPoints();

    expect(records).toEqual([{ assignee: 'Unassigned', complexity: 5 }]);
  });
});
