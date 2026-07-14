import React from 'react';

interface Props {
  assignee: string;
  accountId?: string | null;
  complexity: number;
  excluded?: boolean;
}

export const DeveloperRow = ({ assignee, accountId, complexity, excluded }: Props) => (
  <div className="developer-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
    <div>
      <div style={{ fontWeight: 600 }}>{assignee}</div>
      {accountId ? <div style={{ fontSize: 12, color: '#666' }}>{accountId}</div> : null}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {excluded ? <span className="badge badge--muted">Excluded</span> : null}
      <div style={{ fontWeight: 700 }}>{complexity}</div>
    </div>
  </div>
);

export default DeveloperRow;
