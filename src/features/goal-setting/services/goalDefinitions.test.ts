import { getGoalLabel, getGoalDefinition, GOAL_DEFINITIONS } from './goalDefinitions';

describe('goalDefinitions', () => {
  it('returns the label for a known goal type', () => {
    expect(getGoalLabel('training' as any)).toBe(GOAL_DEFINITIONS.training.label);
  });

  it('returns the full definition for a known goal type', () => {
    const def = getGoalDefinition('complexity' as any);
    expect(def).toEqual(GOAL_DEFINITIONS.complexity);
  });

  it('throws for an unknown goal type', () => {
    expect(() => getGoalDefinition('not-a-real-goal' as any)).toThrow(/Unknown goal type/);
  });
});
