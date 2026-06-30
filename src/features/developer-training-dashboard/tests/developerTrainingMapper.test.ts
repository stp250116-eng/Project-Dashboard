import { mapTrainingRecords } from '../services/developerTrainingMapper';
import type { DeveloperTrainingRawRecord } from '../models/developerTrainingApiModels';

describe('mapTrainingRecords', () => {
  it('maps raw Jira training records with defaults for missing or invalid values', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Ada Lovelace' },
          aggregatetimespent: 3600,
          customfield_11546: { value: 'Workshop' },
          customfield_11547: 'Internal',
        },
      },
      {
        id: '2',
        key: 'TRAIN-2',
        fields: {
          assignee: null,
          aggregatetimespent: null,
          customfield_11546: '   ',
          customfield_11547: { value: 42 },
        },
      },
      {
        id: '3',
        key: 'TRAIN-3',
        fields: {
          assignee: { displayName: 'Grace Hopper' },
          aggregatetimespent: Number.NaN,
          customfield_11546: { value: '  Online Learning  ' },
          customfield_11547: null,
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)).toEqual([
      {
        developer: 'Ada Lovelace',
        trainingType: 'Workshop',
        vendorType: 'Internal',
        aggregatedTimeSeconds: 3600,
      },
      {
        developer: 'Unassigned',
        trainingType: 'Unknown',
        vendorType: 'Unknown',
        aggregatedTimeSeconds: 0,
      },
      {
        developer: 'Grace Hopper',
        trainingType: 'Online Learning',
        vendorType: 'Unknown',
        aggregatedTimeSeconds: 0,
      },
    ]);
  });
});
