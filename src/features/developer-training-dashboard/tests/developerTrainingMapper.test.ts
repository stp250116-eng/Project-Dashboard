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

  it('maps records with all valid string values', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'John Doe' },
          aggregatetimespent: 7200,
          customfield_11546: 'Conference',
          customfield_11547: 'External Partner',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)).toEqual([
      {
        developer: 'John Doe',
        trainingType: 'Conference',
        vendorType: 'External Partner',
        aggregatedTimeSeconds: 7200,
      },
    ]);
  });

  it('handles customfield_11546 as object with value property', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Jane' },
          aggregatetimespent: 3600,
          customfield_11546: { value: 'Webinar' },
          customfield_11547: 'Internal',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)).toEqual([
      {
        developer: 'Jane',
        trainingType: 'Webinar',
        vendorType: 'Internal',
        aggregatedTimeSeconds: 3600,
      },
    ]);
  });

  it('handles customfield_11546 as string directly', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Bob' },
          aggregatetimespent: 3600,
          customfield_11546: 'Certification',
          customfield_11547: 'Vendor',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)).toEqual([
      {
        developer: 'Bob',
        trainingType: 'Certification',
        vendorType: 'Vendor',
        aggregatedTimeSeconds: 3600,
      },
    ]);
  });

  it('handles customfield_11547 as object with value property', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Alice' },
          aggregatetimespent: 3600,
          customfield_11546: 'Training',
          customfield_11547: { value: 'Partner Name' },
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)).toEqual([
      {
        developer: 'Alice',
        trainingType: 'Training',
        vendorType: 'Partner Name',
        aggregatedTimeSeconds: 3600,
      },
    ]);
  });

  it('maps with null assignee to Unassigned', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: null,
          aggregatetimespent: 3600,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)[0]?.developer).toBe('Unassigned');
  });

  it('trims whitespace from text fields', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: 3600,
          customfield_11546: '  Trimmed Training  ',
          customfield_11547: '  Vendor  ',
        },
      },
    ];

    const result = mapTrainingRecords(rawRecords)[0]!;
    expect(result.trainingType).toBe('Trimmed Training');
    expect(result.vendorType).toBe('Vendor');
  });

  it('converts blank whitespace to Unknown', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: 3600,
          customfield_11546: '   ',
          customfield_11547: '\t\n',
        },
      },
    ];

    const result = mapTrainingRecords(rawRecords)[0]!;
    expect(result.trainingType).toBe('Unknown');
    expect(result.vendorType).toBe('Unknown');
  });

  it('handles object value with non-string value property as Unknown', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: 3600,
          customfield_11546: { value: 123 },
          customfield_11547: { value: null },
        },
      },
    ];

    const result = mapTrainingRecords(rawRecords)[0]!;
    expect(result.trainingType).toBe('Unknown');
    expect(result.vendorType).toBe('Unknown');
  });

  it('handles null aggregatetimespent as 0', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: null,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)[0]?.aggregatedTimeSeconds).toBe(0);
  });

  it('handles NaN aggregatetimespent as 0', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: Number.NaN,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)[0]?.aggregatedTimeSeconds).toBe(0);
  });

  it('handles Infinity as 0', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: Infinity,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)[0]?.aggregatedTimeSeconds).toBe(0);
  });

  it('handles non-numeric aggregatetimespent as 0', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: 'invalid' as any,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)[0]?.aggregatedTimeSeconds).toBe(0);
  });

  it('maps array with single record', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Solo' },
          aggregatetimespent: 3600,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)).toHaveLength(1);
  });

  it('maps empty array', () => {
    expect(mapTrainingRecords([])).toEqual([]);
  });

  it('maps multiple records maintaining order', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'First' },
          aggregatetimespent: 3600,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
      {
        id: '2',
        key: 'TRAIN-2',
        fields: {
          assignee: { displayName: 'Second' },
          aggregatetimespent: 7200,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
    ];

    const result = mapTrainingRecords(rawRecords);
    expect(result).toHaveLength(2);
    expect(result[0]?.developer).toBe('First');
    expect(result[1]?.developer).toBe('Second');
  });

  it('preserves valid numeric time values', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: 7200,
          customfield_11546: 'Training',
          customfield_11547: 'Vendor',
        },
      },
    ];

    expect(mapTrainingRecords(rawRecords)[0]?.aggregatedTimeSeconds).toBe(7200);
  });

  it('handles object without value property as Unknown', () => {
    const rawRecords: DeveloperTrainingRawRecord[] = [
      {
        id: '1',
        key: 'TRAIN-1',
        fields: {
          assignee: { displayName: 'Person' },
          aggregatetimespent: 3600,
          customfield_11546: { name: 'Training' } as any,
          customfield_11547: { name: 'Vendor' } as any,
        },
      },
    ];

    const result = mapTrainingRecords(rawRecords)[0]!;
    expect(result.trainingType).toBe('Unknown');
    expect(result.vendorType).toBe('Unknown');
  });
});
