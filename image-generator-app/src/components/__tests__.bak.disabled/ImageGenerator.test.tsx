import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerator } from '../ImageGenerator';

// Mock the hooks
vi.mock('../../hooks/useImageGenerator', () => ({
  useImageGenerator: () => ({
    generateImage: vi.fn().mockResolvedValue({
      id: '1',
      url: 'https://example.com/image.jpg',
      prompt: 'test prompt',
      createdAt: new Date().toISOString(),
    }),
    isGenerating: false,
  }),
}));

vi.mock('../../store/imageStore', () => ({
  useImageStore: () => ({
    addImage: vi.fn(),
  }),
}));

describe('ImageGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with all elements', () => {
    render(<ImageGenerator />);
    
    expect(screen.getByText('AI Image Generator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe the image you want to generate...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
  });

  it('allows typing in the textarea', () => {
    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(textarea, { target: { value: 'a beautiful sunset' } });
    
    expect(textarea).toHaveValue('a beautiful sunset');
  });

  it('disables the submit button when prompt is empty', () => {
    render(<ImageGenerator />);
    
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables the submit button when prompt is not empty', () => {
    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(textarea, { target: { value: 'a beautiful sunset' } });
    
    expect(submitButton).not.toBeDisabled();
  });

  it('calls generateImage when form is submitted', async () => {
    const mockGenerateImage = vi.fn().mockResolvedValue({
      id: '1',
      url: 'https://example.com/image.jpg',
      prompt: 'test prompt',
      createdAt: new Date().toISOString(),
    });

    const mockAddImage = vi.fn();

    vi.doMock('../../hooks/useImageGenerator', () => ({
      useImageGenerator: () => ({
        generateImage: mockGenerateImage,
        isGenerating: false,
      }),
    }));

    vi.doMock('../../store/imageStore', () => ({
      useImageStore: () => ({
        addImage: mockAddImage,
      }),
    }));

    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(textarea, { target: { value: 'a beautiful sunset' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockGenerateImage).toHaveBeenCalledWith('a beautiful sunset');
    });
  });

  it('clears the prompt after successful generation', async () => {
    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(textarea, { target: { value: 'a beautiful sunset' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('shows loading state during generation', () => {
    vi.doMock('../../hooks/useImageGenerator', () => ({
      useImageGenerator: () => ({
        generateImage: vi.fn(),
        isGenerating: true,
      }),
    }));

    render(<ImageGenerator />);
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('handles form submission via Enter key', async () => {
    const mockGenerateImage = vi.fn().mockResolvedValue({
      id: '1',
      url: 'https://example.com/image.jpg',
      prompt: 'test prompt',
      createdAt: new Date().toISOString(),
    });

    vi.doMock('../../hooks/useImageGenerator', () => ({
      useImageGenerator: () => ({
        generateImage: mockGenerateImage,
        isGenerating: false,
      }),
    }));

    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    fireEvent.change(textarea, { target: { value: 'a beautiful sunset' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    
    await waitFor(() => {
      expect(mockGenerateImage).toHaveBeenCalledWith('a beautiful sunset');
    });
  });

  it('does not submit when prompt is only whitespace', () => {
    const mockGenerateImage = vi.fn();

    vi.doMock('../../hooks/useImageGenerator', () => ({
      useImageGenerator: () => ({
        generateImage: mockGenerateImage,
        isGenerating: false,
      }),
    }));

    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText('Describe the image you want to generate...');
    const submitButton = screen.getByRole('button', { name: /generate image/i });
    
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(submitButton);
    
    expect(mockGenerateImage).not.toHaveBeenCalled();
  });
});