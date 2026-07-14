import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('../services/goalDefinitions', () => ({
  getGoalLabel: jest.fn(() => 'Complexity Points'),
}));

import { GoalSettingGrid } from './GoalSettingGrid';

const sampleDevelopers = [
  {
    developerId: 'dev-1',
    name: 'Alice',
    team: 'Platform',
    role: 'Engineer',
    overallScore: 72,
    rank: 1,
    goals: {
      g1: { type: 'complexity', status: 'complete' },
    },
  },
  {
    developerId: 'dev-2',
    name: 'Bob',
    team: 'Infra',
    role: 'SRE',
    overallScore: 45,
    rank: 5,
    goals: {
      g1: { type: 'training', status: 'inprogress' },
    },
  },
];

describe('GoalSettingGrid', () => {
  it('renders developers, score and rank cells and goals', async () => {
    const { container } = render(<GoalSettingGrid developers={sampleDevelopers as any} />);

    // Names
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // Scores (use the score-value element to avoid duplicate progress text)
    const scoreEls = container.querySelectorAll('.score-value');
    expect(scoreEls.length).toBeGreaterThanOrEqual(2);
    expect(Array.from(scoreEls).some((el) => el.textContent === '72')).toBe(true);
    expect(Array.from(scoreEls).some((el) => el.textContent === '45')).toBe(true);

    // Rank badges
    expect(container.querySelector('.rank-badge')?.textContent).toContain('#1');

    // Goal label truncated to first 10 chars by the component
    expect(screen.getAllByText(/Complexit/)[0]).toBeInTheDocument();
  });

  it('calls onRowClick with developerId when a row is clicked', async () => {
    const handleRowClick = jest.fn();
    const { container } = render(<GoalSettingGrid developers={sampleDevelopers as any} onRowClick={handleRowClick} />);

    // Try the developer name span first, fall back to clicking the grid row
    const aliceSpan = container.querySelector('span[data-developer-id="dev-1"]');
    if (aliceSpan) {
      fireEvent.click(aliceSpan);
    } else {
      // Click the grid row containing Alice (Grid onRowClick fires)
      const aliceCell = screen.getByText('Alice');
      const row = aliceCell.closest('tr');
      expect(row).toBeTruthy();
      if (row) fireEvent.click(row);
    }

    expect(handleRowClick).toHaveBeenCalledWith('dev-1');
  });
});
