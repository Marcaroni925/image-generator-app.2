import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../App';

// Mock the image generation API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock URL.createObjectURL
const mockObjectURL = 'blob:test-url';
URL.createObjectURL = vi.fn().mockReturnValue(mockObjectURL);
URL.revokeObjectURL = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' })),
    });
  });

  it('should render the complete application', () => {
    render(<App />);
    
    expect(screen.getByText('AI Image Generator')).toBeInTheDocument();
    expect(screen.getByText('Generated Images')).toBeInTheDocument();
    expect(screen.getByText('No images generated yet')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe the image you want to generate...')).toBeInTheDocument();
  });

  it('should complete the full image generation workflow', async () => {
    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    // Enter prompt and submit
    fireEvent.change(textarea, { target: { value: 'integration test image' } });
    fireEvent.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    
    // Wait for image to be generated and added to gallery
    await waitFor(() => {
      expect(screen.getByText('integration test image')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Should clear the prompt
    expect(textarea).toHaveValue('');
    
    // Should show the image in gallery
    expect(screen.getByAltText('integration test image')).toBeInTheDocument();
    
    // Should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'generated-images',
      expect.stringContaining('integration test image')
    );
  });

  it('should handle the complete modal workflow', async () => {
    render(<App />);
    
    // Generate an image first
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(textarea, { target: { value: 'modal test image' } });
    fireEvent.click(screen.getByRole('button', { name: /generate image/i }));
    
    await waitFor(() => {
      expect(screen.getByText('modal test image')).toBeInTheDocument();
    });
    
    // Click on the image to open modal
    const image = screen.getByAltText('modal test image');
    fireEvent.click(image);
    
    // Modal should open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog').querySelector('img')).toBeInTheDocument();
    
    // Close modal with close button
    fireEvent.click(screen.getByLabelText('Close'));
    
    // Modal should close
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should handle image deletion workflow', async () => {
    render(<App />);
    
    // Generate an image
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(textarea, { target: { value: 'delete test image' } });
    fireEvent.click(screen.getByRole('button', { name: /generate image/i }));
    
    await waitFor(() => {
      expect(screen.getByText('delete test image')).toBeInTheDocument();
    });
    
    // Delete the image
    fireEvent.click(screen.getByLabelText('Delete image'));
    
    // Image should be removed
    expect(screen.queryByText('delete test image')).not.toBeInTheDocument();
    expect(screen.getByText('No images generated yet')).toBeInTheDocument();
    
    // Should update localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'generated-images',
      '[]'
    );
  });

  it('should handle multiple image generation', async () => {
    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    // Generate first image
    fireEvent.change(textarea, { target: { value: 'first image' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('first image')).toBeInTheDocument();
    });
    
    // Generate second image
    fireEvent.change(textarea, { target: { value: 'second image' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('second image')).toBeInTheDocument();
    });
    
    // Both images should be visible
    expect(screen.getByText('first image')).toBeInTheDocument();
    expect(screen.getByText('second image')).toBeInTheDocument();
    
    // Should have both images in the DOM
    expect(screen.getByAltText('first image')).toBeInTheDocument();
    expect(screen.getByAltText('second image')).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(textarea, { target: { value: 'error test' } });
    fireEvent.click(submitButton);
    
    // Should show loading state initially
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    
    // Wait for error to be handled
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    });
    
    // Should not add any image to gallery
    expect(screen.getByText('No images generated yet')).toBeInTheDocument();
  });

  it('should load persisted images from localStorage on startup', () => {
    const persistedImages = [
      {
        id: '1',
        url: 'blob:persisted-url',
        prompt: 'persisted image',
        createdAt: new Date().toISOString(),
      },
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(persistedImages));
    
    render(<App />);
    
    // Should load the persisted image
    expect(screen.getByText('persisted image')).toBeInTheDocument();
    expect(screen.getByAltText('persisted image')).toBeInTheDocument();
    expect(screen.queryByText('No images generated yet')).not.toBeInTheDocument();
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    render(<App />);
    
    // Should still render without crashing
    expect(screen.getByText('AI Image Generator')).toBeInTheDocument();
    expect(screen.getByText('No images generated yet')).toBeInTheDocument();
  });

  it('should prevent simultaneous image generation', async () => {
    // Mock a slow API response
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
      }), 1000))
    );
    
    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    // Start first generation
    fireEvent.change(textarea, { target: { value: 'first request' } });
    fireEvent.click(submitButton);
    
    // Button should be disabled during generation
    expect(submitButton).toBeDisabled();
    
    // Try to generate another image (should not work)
    fireEvent.change(textarea, { target: { value: 'second request' } });
    fireEvent.click(submitButton);
    
    // Should still show loading for first request
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should handle keyboard shortcuts', async () => {
    render(<App />);
    
    // Generate an image first
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(textarea, { target: { value: 'keyboard test' } });
    fireEvent.click(screen.getByRole('button', { name: /generate image/i }));
    
    await waitFor(() => {
      expect(screen.getByText('keyboard test')).toBeInTheDocument();
    });
    
    // Open modal by clicking image
    fireEvent.click(screen.getByAltText('keyboard test'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Close modal with Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should maintain proper focus management', async () => {
    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    
    // Focus should be manageable
    textarea.focus();
    expect(document.activeElement).toBe(textarea);
    
    // Generate an image
    fireEvent.change(textarea, { target: { value: 'focus test' } });
    fireEvent.click(screen.getByRole('button', { name: /generate image/i }));
    
    await waitFor(() => {
      expect(screen.getByText('focus test')).toBeInTheDocument();
    });
    
    // Open and close modal to test focus management
    fireEvent.click(screen.getByAltText('focus test'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should handle edge cases with prompt input', async () => {
    render(<App />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    // Test with whitespace-only prompt
    fireEvent.change(textarea, { target: { value: '   ' } });
    expect(submitButton).toBeDisabled();
    
    // Test with very long prompt
    const longPrompt = 'a'.repeat(1000);
    fireEvent.change(textarea, { target: { value: longPrompt } });
    expect(submitButton).not.toBeDisabled();
    
    // Test with special characters
    fireEvent.change(textarea, { target: { value: 'test with émojis 🌟 and spëcial chars!' } });
    expect(submitButton).not.toBeDisabled();
  });
});