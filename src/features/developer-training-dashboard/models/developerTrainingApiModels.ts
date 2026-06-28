export interface DeveloperTrainingRawFields {
  assignee: { displayName: string } | null;
  aggregatetimespent: number | null;
  customfield_11546: { value: string } | string | null;
  customfield_11547: { value: string } | string | null;
  [customField: string]: unknown;
}

export interface DeveloperTrainingRawRecord {
  id: string;
  key: string;
  fields: DeveloperTrainingRawFields;
}
