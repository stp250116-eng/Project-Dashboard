describe('overduePointApi', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('maps issues to OverduePointRecord correctly', async () => {
    const fakeClient = { get: jest.fn().mockResolvedValue({ data: { issues: [
      { fields: { assignee: { displayName: 'Alice' }, parent: { key: 'P-1', fields: { summary: 'Parent summary' } }, fixVersions: [ { name: '1.0' } ] } },
      { fields: { assignee: null, parent: null, fixVersions: [] } },
    ], isLast: true } }) };

    jest.resetModules();
    jest.doMock('@shared/api', () => ({ createApiClient: () => fakeClient }));
    const { overduePointApi } = require('./overduePointApi');

    const res = await overduePointApi.getOverduePointRecords(50);

    expect(fakeClient.get).toHaveBeenCalled();
    expect(res).toEqual([
      {
        developer: 'Alice',
        parentIssueId: 'P-1',
        parentIssueSummary: 'Parent summary',
        releaseVersion: '1.0',
      },
      {
        developer: 'Unassigned',
        parentIssueId: 'Unknown',
        parentIssueSummary: 'No parent summary',
        releaseVersion: 'No Release',
      },
    ]);
  });

  it('handles pagination across multiple pages', async () => {
    const fakeClient = { get: jest.fn() };
    fakeClient.get.mockResolvedValueOnce({ data: { issues: [ { fields: { assignee: { displayName: 'A' }, parent: { key: 'X', fields: { summary: 'X summary' } }, fixVersions: [] } } ], isLast: false, nextPageToken: 'tok1' } });
    fakeClient.get.mockResolvedValueOnce({ data: { issues: [ { fields: { assignee: { displayName: 'B' }, parent: { key: 'Y', fields: { summary: 'Y summary' } }, fixVersions: [] } } ], isLast: true } });

    jest.resetModules();
    jest.doMock('@shared/api', () => ({ createApiClient: () => fakeClient }));
    const { overduePointApi } = require('./overduePointApi');

    const res = await overduePointApi.getOverduePointRecords();

    expect(fakeClient.get).toHaveBeenCalledTimes(2);
    expect(res.map(r => r.developer)).toEqual(['A', 'B']);
  });
});
