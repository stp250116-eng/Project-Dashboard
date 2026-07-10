export const LOW_DEFECT_TOOLTIP = `Low-Level Defect Rate\nPassing threshold: 8% (must not exceed 8%).\nCriteria:\n - On-Track: ≤ 5%\n - At-Risk: > 5% and ≤ 8%\n - Off-Track: > 8%\nFormula: (Low + Medium) / ComplexityPoints × 100`;

export const HIGH_DEFECT_TOOLTIP = `High-Level Defect Rate\nPassing threshold: 5% (must not exceed 5%).\nCriteria:\n - On-Track: ≤ 3%\n - At-Risk: > 3% and ≤ 5%\n - Off-Track: > 5%\nFormula: (High + Critical) / ComplexityPoints × 100`;
