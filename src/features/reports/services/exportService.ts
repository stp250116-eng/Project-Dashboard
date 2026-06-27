import { LoggerService } from '@shared/services/logger';
import type { ReportRow } from '../hooks/useReports';

export type ExportFormat = 'excel' | 'pdf';

/**
 * Triggers an export. This is a scaffold — wire to a real export service
 * (e.g. server-side generation or Kendo's built-in export). Returns the
 * synthetic file name that would be produced.
 */
export const exportReport = (report: ReportRow, format: ExportFormat): string => {
  const extension = format === 'excel' ? 'xlsx' : 'pdf';
  const fileName = `${report.name.replace(/\s+/g, '_').toLowerCase()}.${extension}`;
  LoggerService.info('Report export requested', { report: report.id, format, fileName });
  return fileName;
};
