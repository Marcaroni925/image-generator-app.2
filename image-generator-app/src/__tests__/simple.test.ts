import { describe, it, expect } from 'vitest';

describe('Simple Test Suite', () => {
  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
  });

  it('should work with strings', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toContain('World');
    expect(greeting.length).toBe(13);
  });

  it('should handle arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers[0]).toBe(1);
    expect(numbers.includes(3)).toBe(true);
  });

  it('should test async operations', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => resolve('success'), 10);
    });
    
    const result = await promise;
    expect(result).toBe('success');
  });
});