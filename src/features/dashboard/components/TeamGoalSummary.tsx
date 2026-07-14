import React, { useState } from 'react';
import type { TeamGoalSummary as TGS } from '../services/teamGoalService';
import type { UpskillingSummary as UPS } from '../services/upskillingService';
import type { DefectSummary as DS } from '../services/defectService';
import type { OverdueSummary as OS } from '../services/overdueService';

interface Props {
  summary: TGS;
  upskilling?: UPS | null;
  defects?: DS | null;
  overdue?: OS | null;
}

const formatNumber = (n: number) => n.toLocaleString();

const formatHoursMinutes = (hoursDecimal: number) => {
  const hrs = Math.floor(hoursDecimal || 0);
  let mins = Math.round(((hoursDecimal || 0) - hrs) * 60);
  if (mins === 60) {
    mins = 0;
    return `${hrs + 1}hrs 0m`;
  }
  return `${hrs}hrs ${mins}m`;
};

const valueColor = (value: number, target: number) => {
  const pct = target > 0 ? value / target : 0;
  return pct < 0.4 ? 'crimson' : pct < 0.7 ? 'orange' : 'green';
};

const DotPct: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width: 10, height: 10, borderRadius: 6, background: color, display: 'inline-block' }} />
    <span style={{ fontWeight: 700, fontSize: 13 }}>{text}</span>
  </div>
);

const styles = `
.team-goal-summary .kpi-grid{ display: grid; grid-template-columns: 3fr 1fr; gap: 16px; align-items: stretch; }
.team-goal-summary .surface{ border: 1px solid #eee; border-radius: 8px; }
.team-goal-summary .kpi-cards{ background: transparent }
.team-goal-summary .breakdown{ width: 220px; margin-top: 12px; border-top: 1px solid #eee; padding-top: 8px }
.team-goal-summary .breakdown .row{ display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f3f3f3 }
.team-goal-summary .breakdown .row:last-child{ border-bottom: none }
.team-goal-summary .quadrant-section{ margin-top: 16px; }
.team-goal-summary .quadrant-wrapper{ position: relative; }
.team-goal-summary .quadrant-tooltip{ position:absolute; background:rgba(30,30,30,0.92); color:#fff; padding:6px 10px; border-radius:6px; font-size:12px; pointer-events:none; white-space:nowrap; z-index:10; transform:translate(-50%,-120%); }
@media (max-width: 720px){
  .team-goal-summary .kpi-grid{ grid-template-columns: 1fr; }
  .team-goal-summary .breakdown{ width:100%; }
}
`;

export const TeamGoalSummary = ({ summary, upskilling, defects, overdue }: Props) => {
  const [hovered, setHovered] = useState<{ name: string; x: number; y: number; pxX: number; pxY: number } | null>(null);

  const throughput = summary.teamThroughput;
  const throughputTarget = summary.teamTarget || 0;

  // Compute normalized percentages for gauge (0..100)
  const complexityPct = throughputTarget > 0 ? Math.min(100, (throughput / throughputTarget) * 100) : 0;
  const upskillingPct = upskilling && upskilling.teamTarget > 0 ? Math.min(100, (upskilling.totalTrainingHours / upskilling.teamTarget) * 100) : 0;

  // Defect: pass if defect rate <= 15%
  const defectActualPct = defects ? (defects.totalDefects / (summary.teamThroughput || 1)) * 100 : 0;
  const defectThreshold = 15; // percent
  const defectOnTrack = defectActualPct <= defectThreshold;

  // Overdue: pass if overdue ratio <= 10%
  const overdueActualPct = overdue ? overdue.ratio * 100 : 0;
  const overdueThreshold = 10; // percent
  const overdueOnTrack = overdueActualPct <= overdueThreshold;

  // Team Goal Score: each KPI contributes max 25 points (total 100)
  const complexityWeighted = Math.min(25, (complexityPct / 100) * 25);
  const upskillingWeighted = Math.min(25, ((upskillingPct || 0) / 100) * 25);
  const defectWeighted = defectOnTrack ? 25 : 0;
  const overdueWeighted = overdueOnTrack ? 25 : 0;
  const teamScore = Math.round((complexityWeighted + upskillingWeighted + defectWeighted + overdueWeighted) * 100) / 100;

  const defectColor = (pct: number) => {
    return pct <= 0.15 ? 'green' : 'crimson';
  };

  const defectPct = defects ? (defects.totalDefects / (summary.teamThroughput || 1)) * 100 : 0;
  const defectDisplay = Number.isFinite(defectPct) ? defectPct.toFixed(2) : '0.00';
  const severityTotals = defects
    ? defects.rows.reduce(
        (acc, r) => {
          if (!r.excluded) {
            acc.critical += r.counts.critical || 0;
            acc.high += r.counts.high || 0;
            acc.medium += r.counts.medium || 0;
            acc.low += r.counts.low || 0;
          }
          return acc;
        },
        { critical: 0, high: 0, medium: 0, low: 0 },
      )
    : { critical: 0, high: 0, medium: 0, low: 0 };

  return (
    <div className="team-goal-summary">
      <style>{styles}</style>
      <div className="kpi-grid">
        {/* KPI cards: 2-column layout */}
        <section className="surface kpi-cards" style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Column 1: Complexity Throughput + Total Defect Rate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <section className="surface" style={{ padding: 16, flex: 1 }}>
              <h2 style={{ margin: 0 }}>Complexity Throughput</h2>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: valueColor(throughput, throughputTarget) }}>
                  {formatNumber(throughput)}
                </div>
                <div style={{ opacity: 0.7 }}>/ {formatNumber(throughputTarget)}</div>
              </div>
              <div style={{ marginTop: 8, opacity: 0.7 }}>{Math.round((throughputTarget > 0 ? (throughput / throughputTarget) * 100 : 0))}% of team target</div>
            </section>

            {defects ? (
              <section className="surface" style={{ padding: 16, flex: 1 }}>
                <h2 style={{ margin: 0 }}>Total Defect Rate</h2>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: defectColor(defectPct / 100) }}>
                    {`${defectDisplay}% `}
                  </div>
                  <div style={{ opacity: 0.7 }}>{`/ 15%`}</div>
                </div>
                <div style={{ marginTop: 8, opacity: 0.7 }}>
                  {severityTotals.critical > 0 ? `Critical : ${severityTotals.critical} | ` : ''}
                  {`High : ${severityTotals.high} | Medium : ${severityTotals.medium} | Low : ${severityTotals.low}`}
                </div>
              </section>
            ) : null}
          </div>

          {/* Column 2: Resource Upskilling + Delivery Efficiency */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {upskilling ? (
              <section className="surface" style={{ padding: 16, flex: 1 }}>
                <h2 style={{ margin: 0 }}>Resource Upskilling</h2>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: valueColor(upskilling.totalTrainingHours, upskilling.teamTarget) }}>
                    {formatHoursMinutes(upskilling.totalTrainingHours)}
                  </div>
                  <div style={{ opacity: 0.7 }}>/ {formatNumber(upskilling.teamTarget)} hrs</div>
                </div>
                <div style={{ marginTop: 8, opacity: 0.7 }}>{Math.round((upskilling.teamTarget > 0 ? (upskilling.totalTrainingHours / upskilling.teamTarget) * 100 : 0))}% of training target</div>
              </section>
            ) : null}

            {overdue ? (
              <section className="surface" style={{ padding: 16, flex: 1 }}>
                <h2 style={{ margin: 0 }}>Delivery Efficiency</h2>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: overdue.ratio <= 0.1 ? 'green' : 'crimson',
                    }}
                  >
                    {`${(overdue.ratio * 100).toFixed(2)}% `}
                  </div>
                  <div style={{ opacity: 0.7 }}>{`/ 10%`}</div>
                </div>
                <div style={{ marginTop: 8, opacity: 0.7 }}>{`${overdue.overdueEpicCount} overdue / ${overdue.totalEpicCount} total epics`}</div>
              </section>
            ) : null}
          </div>
        </section>

        <section className="surface" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Circular gauge filling the card */}
          <svg width="100%" height="auto" viewBox="0 0 96 96" style={{ maxWidth: 200 }}>
            <circle cx="48" cy="48" r="40" stroke="#eee" strokeWidth="8" fill="none" />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={teamScore >= 70 ? 'green' : teamScore >= 40 ? 'orange' : 'crimson'}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              style={{ strokeDasharray: 2 * Math.PI * 40, strokeDashoffset: `${2 * Math.PI * 40 * (1 - teamScore / 100)}` }}
            />
            <text x="48" y="52" textAnchor="middle" fontSize="14" fontWeight={700} fill="currentColor">
              {`${teamScore}%`}
            </text>
            <text x="48" y="66" textAnchor="middle" fontSize="8" fill="currentColor" opacity={0.7}>
              Goal Progress
            </text>
          </svg>

          <div className="breakdown" style={{ width: '100%' }}>
            <div className="row"><div style={{ opacity: 0.85 }}>Complexity Throughput</div><DotPct color={valueColor(throughput, throughputTarget)} text={`${complexityWeighted.toFixed(2)} / 25`} /></div>
            <div className="row"><div style={{ opacity: 0.85 }}>Resource Upskilling</div><DotPct color={upskilling ? valueColor(upskilling.totalTrainingHours, upskilling.teamTarget) : '#999'} text={`${upskillingWeighted.toFixed(2)} / 25`} /></div>
            <div className="row"><div style={{ opacity: 0.85 }}>Total Defect Rate</div><DotPct color={defectOnTrack ? 'green' : 'crimson'} text={defectOnTrack ? '25.00 / 25' : '0.00 / 25'} /></div>
            <div className="row"><div style={{ opacity: 0.85 }}>Delivery Efficiency</div><DotPct color={overdueOnTrack ? 'green' : 'crimson'} text={overdueOnTrack ? '25.00 / 25' : '0.00 / 25'} /></div>
          </div>
        </section>
      </div>

      {/* Quadrant Chart: Developer Goal Summary */}
      {summary.rows.length > 0 && (
        <section className="surface quadrant-section" style={{ padding: 16 }}>
          <h2 style={{ margin: '0 0 12px' }}>Developer Goal Quadrant</h2>
          <div style={{ opacity: 0.7, fontSize: 13, marginBottom: 12 }}>
            X = Complexity Throughput (% of 220 target) · Y = Training Hours (% of 40 target)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          <div className="quadrant-wrapper" style={{ width: '100%' }}>
            {hovered && (
              <div className="quadrant-tooltip" style={{ left: hovered.pxX, top: hovered.pxY }}>
                <strong>{hovered.name}</strong><br/>
                Complexity: {hovered.x.toFixed(0)}% · Training: {hovered.y.toFixed(0)}%
              </div>
            )}
            <svg viewBox="0 0 440 280" width="100%" style={{ overflow: 'visible' }}>
              {/* Background quadrant fills */}
              <rect x="60" y="10" width="185" height="120" fill="rgba(255,165,0,0.06)" />
              <rect x="245" y="10" width="185" height="120" fill="rgba(76,175,80,0.06)" />
              <rect x="60" y="130" width="185" height="120" fill="rgba(244,67,54,0.06)" />
              <rect x="245" y="130" width="185" height="120" fill="rgba(33,150,243,0.06)" />

              {/* Quadrant labels */}
              <text x="152" y="26" textAnchor="middle" fontSize="9" fill="orange" opacity={0.8}>⬆ Trainers</text>
              <text x="337" y="26" textAnchor="middle" fontSize="9" fill="green" opacity={0.8}>⭐ Stars</text>
              <text x="152" y="244" textAnchor="middle" fontSize="9" fill="crimson" opacity={0.8}>⚠ At Risk</text>
              <text x="337" y="244" textAnchor="middle" fontSize="9" fill="#2196F3" opacity={0.8}>➡ Builders</text>

              {/* Axes */}
              <line x1="60" y1="250" x2="430" y2="250" stroke="currentColor" opacity={0.3} />
              <line x1="60" y1="10" x2="60" y2="250" stroke="currentColor" opacity={0.3} />

              {/* 50% threshold lines */}
              <line x1="245" y1="10" x2="245" y2="250" stroke="currentColor" opacity={0.15} strokeDasharray="4 4" />
              <line x1="60" y1="130" x2="430" y2="130" stroke="currentColor" opacity={0.15} strokeDasharray="4 4" />

              {/* Axis labels */}
              <text x="245" y="278" textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>Complexity Throughput (%)</text>
              <text x="16" y="130" textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7} transform="rotate(-90 16 130)">Training Hours (%)</text>

              {/* Tick marks */}
              <text x="60" y="264" textAnchor="middle" fontSize="8" fill="currentColor" opacity={0.5}>0%</text>
              <text x="245" y="264" textAnchor="middle" fontSize="8" fill="currentColor" opacity={0.5}>50%</text>
              <text x="430" y="264" textAnchor="middle" fontSize="8" fill="currentColor" opacity={0.5}>100%</text>
              <text x="52" y="253" textAnchor="end" fontSize="8" fill="currentColor" opacity={0.5}>0%</text>
              <text x="52" y="133" textAnchor="end" fontSize="8" fill="currentColor" opacity={0.5}>50%</text>
              <text x="52" y="16" textAnchor="end" fontSize="8" fill="currentColor" opacity={0.5}>100%</text>

              {/* Developer dots */}
              {(() => {
                const perDevTarget = 220;
                const perTrainingTarget = 40;
                const upskillingMap = new Map<string, number>();
                if (upskilling) {
                  for (const row of upskilling.rows) {
                    if (!row.excluded) {
                      upskillingMap.set(row.accountId ?? row.developer, row.totalTrainingHours);
                    }
                  }
                }

                return summary.rows
                  .filter((r) => !r.excluded)
                  .map((dev) => {
                    const xPct = Math.min(100, (dev.complexity / perDevTarget) * 100);
                    const trainHrs = upskillingMap.get(dev.accountId ?? dev.assignee) ?? 0;
                    const yPct = Math.min(100, (trainHrs / perTrainingTarget) * 100);

                    const cx = 60 + (xPct / 100) * 370;
                    const cy = 250 - (yPct / 100) * 240;

                    const dotColor =
                      xPct >= 50 && yPct >= 50 ? 'green' :
                      xPct >= 50 ? '#2196F3' :
                      yPct >= 50 ? 'orange' : 'crimson';

                    return (
                      <circle
                        key={dev.accountId ?? dev.assignee}
                        cx={cx}
                        cy={cy}
                        r="6"
                        fill={dotColor}
                        opacity={0.85}
                        stroke="#fff"
                        strokeWidth="1.5"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          const svg = (e.target as SVGCircleElement).closest('svg');
                          if (svg) {
                            const rect = svg.getBoundingClientRect();
                            const scaleX = rect.width / 440;
                            const scaleY = rect.height / 280;
                            setHovered({ name: dev.assignee, x: xPct, y: yPct, pxX: cx * scaleX, pxY: cy * scaleY });
                          }
                        }}
                        onMouseLeave={() => setHovered(null)}
                      />
                    );
                  });
              })()}
            </svg>
          </div>

          {/* Legend / Action table */}
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Quadrant Legend</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '4px 6px', opacity: 0.7 }}>Quadrant</th>
                  <th style={{ textAlign: 'left', padding: '4px 6px', opacity: 0.7 }}>Meaning</th>
                  <th style={{ textAlign: 'left', padding: '4px 6px', opacity: 0.7 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 6px' }}><span style={{ color: 'green' }}>⭐</span> Top-right</td>
                  <td style={{ padding: '4px 6px' }}>Met both targets</td>
                  <td style={{ padding: '4px 6px' }}>Recognize</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 6px' }}><span style={{ color: 'orange' }}>⬆</span> Top-left</td>
                  <td style={{ padding: '4px 6px' }}>Training strong, output low</td>
                  <td style={{ padding: '4px 6px' }}>Check capacity/blockers</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 6px' }}><span style={{ color: '#2196F3' }}>➡</span> Bottom-right</td>
                  <td style={{ padding: '4px 6px' }}>High output, skipping training</td>
                  <td style={{ padding: '4px 6px' }}>Remind to upskill</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 6px' }}><span style={{ color: 'crimson' }}>⚠️</span> Bottom-left</td>
                  <td style={{ padding: '4px 6px' }}>Behind on both</td>
                  <td style={{ padding: '4px 6px' }}>Needs support</td>
                </tr>
              </tbody>
            </table>

            {/* Top 3 developers needing attention (lowest combined score) */}
            <h3 style={{ margin: '16px 0 8px', fontSize: 14 }}>⚠️ Top 3 Need Attention</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {(() => {
                const perDevTarget = 220;
                const perTrainingTarget = 40;
                const upskillingMap = new Map<string, number>();
                if (upskilling) {
                  for (const row of upskilling.rows) {
                    if (!row.excluded) {
                      upskillingMap.set(row.accountId ?? row.developer, row.totalTrainingHours);
                    }
                  }
                }
                const scored = summary.rows
                  .filter((r) => !r.excluded)
                  .map((dev) => {
                    const xPct = Math.min(100, (dev.complexity / perDevTarget) * 100);
                    const trainHrs = upskillingMap.get(dev.accountId ?? dev.assignee) ?? 0;
                    const yPct = Math.min(100, (trainHrs / perTrainingTarget) * 100);
                    return { name: dev.assignee, score: xPct + yPct, xPct, yPct };
                  })
                  .sort((a, b) => a.score - b.score);

                const bottom3 = scored.slice(0, 3);
                const mvp = scored[scored.length - 1];

                return (
                  <>
                    {bottom3.map((dev, i) => (
                      <li key={dev.name} style={{ padding: '4px 0', borderBottom: i < 2 ? '1px solid rgba(128,128,128,0.15)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{dev.name}</span>
                        <span style={{ fontSize: 11, opacity: 0.7 }}>{Math.round(dev.xPct)}% / {Math.round(dev.yPct)}%</span>
                      </li>
                    ))}
                    {mvp && (
                      <>
                        <h3 style={{ margin: '16px 0 8px', fontSize: 14 }}>🏆 MVP</h3>
                        <li style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700 }}>{mvp.name}</span>
                          <span style={{ fontSize: 11, opacity: 0.7 }}>{Math.round(mvp.xPct)}% / {Math.round(mvp.yPct)}%</span>
                        </li>
                      </>
                    )}
                  </>
                );
              })()}
            </ul>
          </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TeamGoalSummary;
