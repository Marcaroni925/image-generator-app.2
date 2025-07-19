import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useImageGenerator } from '../useImageGenerator';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto.randomUUID for consistent IDs
const mockCryptoRandomUUID = vi.fn();
Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID: mockCryptoRandomUUID },
  writable: true,
});

describe('useImageGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCryptoRandomUUID.mockReturnValue('test-uuid-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with isGenerating false', () => {
    const { result } = renderHook(() => useImageGenerator());
    
    expect(result.current.isGenerating).toBe(false);
  });

  it('generates an image successfully', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    const mockObjectURL = 'blob:test-url';
    URL.createObjectURL = vi.fn().mockReturnValue(mockObjectURL);

    const { result } = renderHook(() => useImageGenerator());
    
    const promise = result.current.generateImage('test prompt');
    
    // Should set isGenerating to true immediately
    expect(result.current.isGenerating).toBe(true);
    
    const image = await promise;
    
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    expect(image).toEqual({
      id: expect.any(String),
      url: mockObjectURL,
      prompt: 'test prompt',
      createdAt: expect.any(String),
    });
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useImageGenerator());
    
    await expect(result.current.generateImage('test prompt')).rejects.toThrow(
      'Failed to generate image: 500 Internal Server Error'
    );
    
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useImageGenerator());
    
    await expect(result.current.generateImage('test prompt')).rejects.toThrow(
      'Network error'
    );
    
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it('prevents multiple simultaneous generations', async () => {
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
      }), 100))
    );

    const { result } = renderHook(() => useImageGenerator());
    
    const promise1 = result.current.generateImage('prompt 1');
    const promise2 = result.current.generateImage('prompt 2');
    
    // Second call should throw an error
    await expect(promise2).rejects.toThrow(
      'Image generation already in progress'
    );
    
    // First call should still succeed
    await expect(promise1).resolves.toBeDefined();
  });

  it('generates unique IDs for each image', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');

    mockCryptoRandomUUID
      .mockReturnValueOnce('test-uuid-1')
      .mockReturnValueOnce('test-uuid-2');

    const { result } = renderHook(() => useImageGenerator());
    
    const image1 = await result.current.generateImage('prompt 1');
    const image2 = await result.current.generateImage('prompt 2');
    
    expect(image1.id).not.toBe(image2.id);
  });

  it('includes correct timestamp', async () => {
    const mockDate = '2023-01-01T00:00:00.000Z';
    const dateSpy = vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');

    const { result } = renderHook(() => useImageGenerator());
    
    const image = await result.current.generateImage('test prompt');
    
    expect(image.createdAt).toBe(mockDate);
    
    dateSpy.mockRestore();
  });

  it('handles empty prompt', async () => {
    const { result } = renderHook(() => useImageGenerator());
    
    await expect(result.current.generateImage('')).rejects.toThrow(
      'Prompt cannot be empty'
    );
    
    expect(result.current.isGenerating).toBe(false);
  });

  it('handles whitespace-only prompt', async () => {
    const { result } = renderHook(() => useImageGenerator());
    
    await expect(result.current.generateImage('   ')).rejects.toThrow(
      'Prompt cannot be empty'
    );
    
    expect(result.current.isGenerating).toBe(false);
  });

  it('handles prompts that are too short', async () => {
    const { result } = renderHook(() => useImageGenerator());
    
    await expect(result.current.generateImage('AB')).rejects.toThrow(
      'Prompt must be at least 3 characters long'
    );
    
    expect(result.current.isGenerating).toBe(false);
  });

  it('handles prompts that are too long', async () => {
    const { result } = renderHook(() => useImageGenerator());
    const longPrompt = 'A'.repeat(501);
    
    await expect(result.current.generateImage(longPrompt)).rejects.toThrow(
      'Prompt cannot exceed 500 characters'
    );
    
    expect(result.current.isGenerating).toBe(false);
  });

  it('sanitizes prompt input', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');

    const { result } = renderHook(() => useImageGenerator());
    
    const image = await result.current.generateImage('A <beautiful> sunset');
    
    expect(image.prompt).toBe('A beautiful sunset');
  });

  it('rejects unsafe prompt content', async () => {
    const { result } = renderHook(() => useImageGenerator());
    
    await expect(result.current.generateImage('A script test')).rejects.toThrow(
      'Prompt contains potentially unsafe content'
    );
    
    expect(result.current.isGenerating).toBe(false);
  });

  it('trims prompt before processing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');

    const { result } = renderHook(() => useImageGenerator());
    
    const image = await result.current.generateImage('  test prompt  ');
    
    expect(image.prompt).toBe('test prompt');
  });

  it('uses correct API endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });

    const { result } = renderHook(() => useImageGenerator());
    
    await result.current.generateImage('test prompt');
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('picsum.photos'),
      expect.any(Object)
    );
  });

  it('sets correct fetch options', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });

    const { result } = renderHook(() => useImageGenerator());
    
    await result.current.generateImage('test prompt');
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        cache: 'no-cache',
      })
    );
  });

  it('handles blob creation failure', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.reject(new Error('Blob creation failed')),
    });

    const { result } = renderHook(() => useImageGenerator());
    
    await expect(result.current.generateImage('test prompt')).rejects.toThrow(
      'Blob creation failed'
    );
    
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it('cleans up object URL on error', async () => {
    const mockObjectURL = 'blob:test-url';
    const createObjectURLSpy = vi.fn().mockReturnValue(mockObjectURL);
    const revokeObjectURLSpy = vi.fn();
    
    URL.createObjectURL = createObjectURLSpy;
    URL.revokeObjectURL = revokeObjectURLSpy;

    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob()),
    });

    // Mock an error after object URL creation
    createObjectURLSpy.mockImplementation(() => {
      throw new Error('Object URL creation failed');
    });

    const { result } = renderHook(() => useImageGenerator());
    
    await expect(result.current.generateImage('test prompt')).rejects.toThrow();
    
    // Object URL should not be created if it fails
    expect(revokeObjectURLSpy).not.toHaveBeenCalled();
  });
});