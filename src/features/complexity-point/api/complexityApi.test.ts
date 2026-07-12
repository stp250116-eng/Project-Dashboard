import { complexityApi } from './complexityApi';
jest.mock('@shared/api', () => ({
  createApiClient: jest.fn(),
}));
jest.mock('../services/complexityAnalytics', () => ({
  getComplexityValueFromFields: jest.fn(),
}));

const mockCreateApiClient = require('@shared/api').createApiClient as jest.MockedFunction<any>;
const { getComplexityValueFromFields } = require('../services/complexityAnalytics') as {
  getComplexityValueFromFields: jest.MockedFunction<any>;
};

describe('complexityApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('maps issues to ComplexityRecord using the analytics helper', async () => {
    const fakeClient = { get: jest.fn().mockResolvedValue({ data: { issues: [
      { fields: { assignee: { displayName: 'Alice' }, customfield_11530: 8 } },
      { fields: { assignee: null, customfield_11530: 5 } },
    ], isLast: true } }) };

    mockCreateApiClient.mockReturnValue(fakeClient);
    getComplexityValueFromFields.mockImplementation((fields: any) => fields.customfield_11530 ?? 0);

    const res = await complexityApi.getComplexityPoints();

    expect(fakeClient.get).toHaveBeenCalled();
    expect(res).toEqual([
      { assignee: 'Alice', complexity: 8 },
      { assignee: 'Unassigned', complexity: 5 },
    ]);
  });

  it('handles pagination by requesting multiple pages', async () => {
    const fakeClient = { get: jest.fn() };
    // first call: not last, provides nextPageToken
    fakeClient.get.mockResolvedValueOnce({ data: { issues: [ { fields: { assignee: { displayName: 'A' }, customfield_11530: 1 } } ], isLast: false, nextPageToken: 'tok1' } });
    // second call: last
    fakeClient.get.mockResolvedValueOnce({ data: { issues: [ { fields: { assignee: { displayName: 'B' }, customfield_11530: 2 } } ], isLast: true } });

    mockCreateApiClient.mockReturnValue(fakeClient);
    getComplexityValueFromFields.mockReturnValueOnce(1).mockReturnValueOnce(2);

    const res = await complexityApi.getComplexityPoints();

    expect(fakeClient.get).toHaveBeenCalledTimes(2);
    expect(res.map(r => r.assignee)).toEqual(['A', 'B']);
  });
});
