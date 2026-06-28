import { jiraApi } from '@integrations/jira';
import type { DeveloperTrainingRawRecord } from '../models/developerTrainingApiModels';

export const developerTrainingApi = {
  async getTrainingRecords(pageSize = 100): Promise<DeveloperTrainingRawRecord[]> {
    return jiraApi.getTrainingInformation(pageSize);
  },
};
