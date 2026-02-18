import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return the initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));
        expect(result.current).toBe('initial');
    });

    it('should debounce value changes', async () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 'initial', delay: 500 },
            }
        );

        expect(result.current).toBe('initial');

        // Update the value
        rerender({ value: 'updated', delay: 500 });

        // Value should not change immediately
        expect(result.current).toBe('initial');

        // Fast-forward time and run all timers
        await vi.runAllTimersAsync();

        // Now the value should be updated
        expect(result.current).toBe('updated');
    });

    it('should handle multiple rapid value changes', async () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 'initial', delay: 500 },
            }
        );

        // Rapid changes
        rerender({ value: 'change1', delay: 500 });
        await vi.advanceTimersByTimeAsync(100);

        rerender({ value: 'change2', delay: 500 });
        await vi.advanceTimersByTimeAsync(100);

        rerender({ value: 'change3', delay: 500 });

        // Value should still be initial
        expect(result.current).toBe('initial');

        // Fast-forward past the debounce delay
        await vi.runAllTimersAsync();

        // Should have the last value
        expect(result.current).toBe('change3');
    });

    it('should work with different delay values', async () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 'initial', delay: 1000 },
            }
        );

        rerender({ value: 'updated', delay: 1000 });

        await vi.advanceTimersByTimeAsync(500);
        expect(result.current).toBe('initial');

        await vi.runAllTimersAsync();
        expect(result.current).toBe('updated');
    });

    it('should work with non-string values', async () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            {
                initialProps: { value: 42, delay: 500 },
            }
        );

        expect(result.current).toBe(42);

        rerender({ value: 100, delay: 500 });
        await vi.runAllTimersAsync();

        expect(result.current).toBe(100);
    });

    it('should cleanup timeout on unmount', () => {
        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

        const { unmount } = renderHook(() => useDebounce('test', 500));

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
});
