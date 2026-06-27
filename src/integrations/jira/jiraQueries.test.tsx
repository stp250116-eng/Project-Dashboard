import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('./jiraApi', () => ({
  jiraApi: {
    searchIssues: jest.fn().mockResolvedValue([{ key: 'DASH-1' }]),
    getBoards: jest.fn().mockResolvedValue([{ id: 1 }]),
    getSprints: jest.fn().mockResolvedValue([{ id: 2 }]),
    getDefects: jest.fn().mockResolvedValue([{ key: 'OO-1' }]),
  },
}));

import {
  useJiraIssues,
  useJiraBoards,
  useJiraSprints,
  useJiraDefects,
} from './jiraQueries';
import { jiraApi } from './jiraApi';

const createWrapper = (): ((props: { children: ReactNode }) => JSX.Element) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('jiraQueries', () => {
  beforeEach(() => jest.clearAllMocks());

  it('useJiraIssues fetches when a JQL string is provided', async () => {
    const { result } = renderHook(() => useJiraIssues('project = DASH'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ key: 'DASH-1' }]);
    expect(jiraApi.searchIssues).toHaveBeenCalledWith('project = DASH');
  });

  it('useJiraIssues stays disabled for an empty JQL string', () => {
    const { result } = renderHook(() => useJiraIssues(''), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(jiraApi.searchIssues).not.toHaveBeenCalled();
  });

  it('useJiraBoards fetches the board list', async () => {
    const { result } = renderHook(() => useJiraBoards(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(jiraApi.getBoards).toHaveBeenCalledTimes(1);
  });

  it('useJiraSprints stays disabled when the board id is null', () => {
    const { result } = renderHook(() => useJiraSprints(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(jiraApi.getSprints).not.toHaveBeenCalled();
  });

  it('useJiraSprints fetches for a concrete board id', async () => {
    const { result } = renderHook(() => useJiraSprints(7), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(jiraApi.getSprints).toHaveBeenCalledWith(7);
  });

  it('useJiraDefects loads the saved filter', async () => {
    const { result } = renderHook(() => useJiraDefects(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(jiraApi.getDefects).toHaveBeenCalledTimes(1);
  });
});
