import { exportReport } from '../services/exportService';
import type { ReportRow } from '../hooks/useReports';

const sample: ReportRow = {
  id: 'rp1',
  name: 'Sprint Summary',
  category: 'Agile',
  lastRun: '2026-06-12',
  format: 'Excel',
};

describe('exportService', () => {
  it('produces an xlsx file name for excel exports', () => {
    expect(exportReport(sample, 'excel')).toBe('sprint_summary.xlsx');
  });

  it('produces a pdf file name for pdf exports', () => {
    expect(exportReport(sample, 'pdf')).toBe('sprint_summary.pdf');
  });
});
