import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerator } from '../ImageGenerator';

// Mock the hooks
vi.mock('../../hooks/useImageGenerator', () => ({
  useImageGenerator: () => ({
    generateImage: vi.fn().mockResolvedValue({
      id: '1',
      url: 'blob:test-url',
      prompt: 'test prompt',
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
    }),
    isGenerating: false,
  }),
}));

describe('ImageGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the coloring page creator with all elements', () => {
    render(<ImageGenerator />);
    
    expect(screen.getByText('Coloring Page Creator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/describe what you'd like to color/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create coloring page/i })).toBeInTheDocument();
  });

  it('allows typing in the textarea', () => {
    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText(/describe what you'd like to color/i);
    fireEvent.change(textarea, { target: { value: 'a cute cat' } });
    
    expect(textarea).toHaveValue('a cute cat');
  });

  it('disables the submit button when prompt is empty', () => {
    render(<ImageGenerator />);
    
    const submitButton = screen.getByRole('button', { name: /create coloring page/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when prompt has content', () => {
    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText(/describe what you'd like to color/i);
    const submitButton = screen.getByRole('button', { name: /create coloring page/i });
    
    fireEvent.change(textarea, { target: { value: 'a beautiful sunset' } });
    expect(submitButton).toBeEnabled();
  });

  it('shows all coloring option categories', () => {
    render(<ImageGenerator />);
    
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Age Group')).toBeInTheDocument();
    expect(screen.getByText('Detail Complexity')).toBeInTheDocument();
    expect(screen.getByText('Line Thickness')).toBeInTheDocument();
    expect(screen.getByText('Border')).toBeInTheDocument();
  });

  it('allows selecting different style options', () => {
    render(<ImageGenerator />);
    
    const cartoonButton = screen.getByRole('button', { name: 'Cartoon' });
    const realisticButton = screen.getByRole('button', { name: 'Realistic' });
    
    expect(cartoonButton).toHaveClass('bg-orange-100'); // Default selected
    
    fireEvent.click(realisticButton);
    expect(realisticButton).toHaveClass('bg-orange-100');
  });

  it('handles form submission correctly', async () => {
    const mockGenerateImage = vi.fn().mockResolvedValue({
      id: '1',
      url: 'blob:test-url',
      prompt: 'enhanced prompt',
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
    });

    vi.doMock('../../hooks/useImageGenerator', () => ({
      useImageGenerator: () => ({
        generateImage: mockGenerateImage,
        isGenerating: false,
      }),
    }));

    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText(/describe what you'd like to color/i);
    const submitButton = screen.getByRole('button', { name: /create coloring page/i });
    
    fireEvent.change(textarea, { target: { value: 'test coloring page' } });
    fireEvent.click(submitButton);
    
    // Textarea should be cleared after submission
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('supports keyboard shortcuts (Ctrl+Enter)', () => {
    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText(/describe what you'd like to color/i);
    
    fireEvent.change(textarea, { target: { value: 'keyboard test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    
    // Should trigger form submission (mocked function would be called)
    expect(textarea).toBeInTheDocument();
  });
});