import type { DeveloperTrainingRawRecord } from '../models/developerTrainingApiModels';
import type { DeveloperTrainingRecord } from '../models/developerTrainingModels';

const readOptionValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'value' in value) {
    const raw = value as { value: unknown };
    return typeof raw.value === 'string' ? raw.value : '';
  }
  return '';
};

const normalizeText = (value: unknown): string => {
  const text = readOptionValue(value).trim();
  return text.length > 0 ? text : 'Unknown';
};

const toSeconds = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return 0;
};

export const mapTrainingRecords = (
  rawRecords: readonly DeveloperTrainingRawRecord[],
): DeveloperTrainingRecord[] =>
  rawRecords.map((record) => ({
    developer: record.fields.assignee?.displayName ?? 'Unassigned',
    trainingType: normalizeText(record.fields.customfield_11546),
    vendorType: normalizeText(record.fields.customfield_11547),
    aggregatedTimeSeconds: toSeconds(record.fields.aggregatetimespent),
  }));
