import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerationResult } from '../GenerationResult';
import { GeneratedImage } from '../../types';

// Mock the gallery store
const mockSaveToGallery = vi.fn();
const mockIsImageSaved = vi.fn().mockReturnValue(false);

vi.mock('../../store/imageStore', () => ({
  useGalleryStore: () => ({
    saveToGallery: mockSaveToGallery,
    isImageSaved: mockIsImageSaved,
  }),
}));

// Mock URL.createObjectURL and related methods
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:test-url'),
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
  })),
});

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
});

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
});

const mockImage: GeneratedImage = {
  id: 'test-id-123',
  url: 'https://example.com/test-image.jpg',
  prompt: 'A beautiful sunset over mountains',
  timestamp: Date.now(),
  createdAt: '2023-01-01T12:00:00Z',
};

const mockOnGenerateNew = vi.fn();

describe('GenerationResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsImageSaved.mockReturnValue(false);
  });

  it('renders image and content correctly', () => {
    render(
      <GenerationResult image={mockImage} onGenerateNew={mockOnGenerateNew} />
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', mockImage.url);
    expect(screen.getByRole('img')).toHaveAttribute('alt', mockImage.prompt);
    expect(screen.getByText(`"${mockImage.prompt}"`)).toBeInTheDocument();
    expect(screen.getByText(/ID: test-id-1/)).toBeInTheDocument();
  });

  it('handles save to gallery action', async () => {
    render(
      <GenerationResult image={mockImage} onGenerateNew={mockOnGenerateNew} />
    );

    const saveButton = screen.getByRole('button', { name: /Save to Gallery/ });
    fireEvent.click(saveButton);

    // Should show saving state
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    // Should call save function
    await waitFor(() => {
      expect(mockSaveToGallery).toHaveBeenCalledWith(mockImage);
    });

    // Should show saved state
    await waitFor(() => {
      expect(screen.getByText('Saved!')).toBeInTheDocument();
    });
  });

  it('shows saved state when image is already saved', () => {
    mockIsImageSaved.mockReturnValue(true);

    render(
      <GenerationResult image={mockImage} onGenerateNew={mockOnGenerateNew} />
    );

    expect(screen.getByRole('button', { name: /Saved/ })).toBeInTheDocument();
  });

  it('handles download action', () => {
    render(
      <GenerationResult image={mockImage} onGenerateNew={mockOnGenerateNew} />
    );

    const downloadButton = screen.getByRole('button', { name: /Download/ });
    fireEvent.click(downloadButton);

    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('handles generate new action', () => {
    render(
      <GenerationResult image={mockImage} onGenerateNew={mockOnGenerateNew} />
    );

    const generateNewButton = screen.getByRole('button', { name: /Generate New/ });
    fireEvent.click(generateNewButton);

    expect(mockOnGenerateNew).toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <GenerationResult image={mockImage} onGenerateNew={mockOnGenerateNew} />
    );

    const saveButton = screen.getByRole('button', { name: /Save to Gallery/ });
    expect(saveButton).toBeInTheDocument();

    const downloadButton = screen.getByRole('button', { name: /Download/ });
    expect(downloadButton).toBeInTheDocument();

    const generateButton = screen.getByRole('button', { name: /Generate New/ });
    expect(generateButton).toBeInTheDocument();
  });
});