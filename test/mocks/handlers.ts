import { http, HttpResponse } from 'msw';
import { appConfig } from '../../src/shared/constants/appConfig';
import { jiraSearchFixture } from '../fixtures/jiraIssues';
import { jiraDefectsFixture } from '../fixtures/jiraDefects';

/**
 * MSW request handlers. Centralizing them lets unit/integration tests run
 * against realistic responses without hitting the network.
 */
export const handlers = [
  http.get(`${appConfig.jiraApiBase}/rest/api/3/search/jql`, ({ request }) => {
    const jql = new URL(request.url).searchParams.get('jql') ?? '';
    // The defect dashboard queries via `filter = <id>`; everything else gets the
    // generic issue fixture.
    if (jql.includes('filter')) {
      return HttpResponse.json(jiraDefectsFixture);
    }
    return HttpResponse.json(jiraSearchFixture);
  }),
  http.get(`${appConfig.apiBaseUrl}/health`, () => HttpResponse.json({ status: 'ok' })),
];
