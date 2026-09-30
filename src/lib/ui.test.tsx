import { render, screen } from '@testing-library/react';
import { compareSeverities, getChips, getLifecycle, IN_USE_SEVERITIES } from './ui';

const counts = (critical: number, high = 0, medium = 0, low = 0, negligible = 0) =>
  ({ critical, high, medium, low, negligible });

describe('compareSeverities', () => {
  it('orders by critical first, then lower severities as tie-breakers', () => {
    const sorted = [counts(0, 50), counts(2, 0), counts(2, 5), counts(0, 50, 1)].sort(compareSeverities);
    expect(sorted).toEqual([counts(0, 50), counts(0, 50, 1), counts(2, 0), counts(2, 5)]);
  });

  it('sorts missing data below any counts', () => {
    expect(compareSeverities(undefined, counts(0))).toBeLessThan(0);
    expect(compareSeverities(counts(0), undefined)).toBeGreaterThan(0);
  });
});

describe('getLifecycle', () => {
  it('shows EOL for past dates, Active for future ones, nothing when unknown', () => {
    const { rerender, container } = render(<>{getLifecycle('2018-05-01T00:00:00Z')}</>);
    expect(screen.getByText('EOL')).toBeInTheDocument();
    rerender(<>{getLifecycle('2999-01-01T00:00:00Z')}</>);
    expect(screen.getByText('Active')).toBeInTheDocument();
    rerender(<>{getLifecycle(undefined)}</>);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('getChips', () => {
  it('only renders the requested severities', () => {
    render(<>{getChips(counts(2, 17, 22, 4, 16), IN_USE_SEVERITIES)}</>);
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    expect(screen.queryByText('16')).not.toBeInTheDocument();
  });
});
