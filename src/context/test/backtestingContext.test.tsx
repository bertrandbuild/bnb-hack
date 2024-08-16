import { renderHook, act } from '@testing-library/react';
import { useBacktestingContext } from '../../hooks/useBacktestingContext';
import BacktestingProvider from '../backtestingContext';

describe('useBacktestingContext', () => {
  it('should return the context when used in the BacktestingProvider', () => {
    const { result } = renderHook(() => useBacktestingContext(), {
      wrapper: BacktestingProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current.showBacktesting).toBe(false);
  });

  it('should raise an error when used outside the BacktestingProvider', () => {
    // L'utilisation de `act` ici est cruciale pour capturer l'erreur correctement
    expect(() => {
      act(() => {
        renderHook(() => useBacktestingContext());
      });
    }).toThrow("useBacktestingContext must be used within a BacktestingProvider");
  });
});
