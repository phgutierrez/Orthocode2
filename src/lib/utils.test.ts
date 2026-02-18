import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
    it('should merge class names correctly', () => {
        const result = cn('foo', 'bar');
        expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
        const result = cn('foo', false && 'bar', 'baz');
        expect(result).toBe('foo baz');
    });

    it('should merge Tailwind classes and resolve conflicts', () => {
        // twMerge should keep the last conflicting class
        const result = cn('px-2 py-1', 'px-4');
        expect(result).toBe('py-1 px-4');
    });

    it('should handle arrays of classes', () => {
        const result = cn(['foo', 'bar'], 'baz');
        expect(result).toBe('foo bar baz');
    });

    it('should handle undefined and null values', () => {
        const result = cn('foo', undefined, null, 'bar');
        expect(result).toBe('foo bar');
    });

    it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle objects with boolean values', () => {
        const result = cn({
            foo: true,
            bar: false,
            baz: true,
        });
        expect(result).toBe('foo baz');
    });

    it('should combine multiple input types', () => {
        const result = cn('base', { active: true, disabled: false }, ['extra', 'classes']);
        expect(result).toBe('base active extra classes');
    });
});
