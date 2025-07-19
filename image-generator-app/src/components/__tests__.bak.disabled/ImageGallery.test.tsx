import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGallery } from '../ImageGallery';
import { GeneratedImage } from '../../types';

// Mock the store
const mockImages: GeneratedImage[] = [
  {
    id: '1',
    url: 'https://example.com/image1.jpg',
    prompt: 'a beautiful sunset',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    url: 'https://example.com/image2.jpg',
    prompt: 'a mountain landscape',
    createdAt: '2023-01-02T00:00:00Z',
  },
];

const mockDeleteImage = vi.fn();

vi.mock('../store/imageStore', () => ({
  useImageStore: () => ({
    images: mockImages,
    deleteImage: mockDeleteImage,
  }),
}));

// Mock URL.createObjectURL for download functionality
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:test-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

describe('ImageGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the gallery with images', () => {
    render(<ImageGallery />);
    
    expect(screen.getByText('Generated Images')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('displays image prompts', () => {
    render(<ImageGallery />);
    
    expect(screen.getByText('a beautiful sunset')).toBeInTheDocument();
    expect(screen.getByText('a mountain landscape')).toBeInTheDocument();
  });

  it('shows empty state when no images', () => {
    vi.doMock('../store/imageStore', () => ({
      useImageStore: () => ({
        images: [],
        deleteImage: mockDeleteImage,
      }),
    }));

    render(<ImageGallery />);
    
    expect(screen.getByText('No images generated yet')).toBeInTheDocument();
  });

  it('opens modal when image is clicked', () => {
    render(<ImageGallery />);
    
    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(<ImageGallery />);
    
    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal when overlay is clicked', () => {
    render(<ImageGallery />);
    
    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);
    
    const modal = screen.getByRole('dialog');
    fireEvent.click(modal);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal when Escape key is pressed', () => {
    render(<ImageGallery />);
    
    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deletes image when delete button is clicked', () => {
    render(<ImageGallery />);
    
    const deleteButtons = screen.getAllByLabelText('Delete image');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockDeleteImage).toHaveBeenCalledWith('1');
  });

  it('downloads image when download button is clicked', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob()),
    });
    global.fetch = mockFetch;

    const mockClick = vi.fn();
    const mockAnchor = {
      click: mockClick,
      href: '',
      download: '',
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

    render(<ImageGallery />);
    
    const downloadButtons = screen.getAllByLabelText('Download image');
    fireEvent.click(downloadButtons[0]);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/image1.jpg');
    });
  });

  it('handles image load errors gracefully', () => {
    render(<ImageGallery />);
    
    const images = screen.getAllByRole('img');
    fireEvent.error(images[0]);
    
    // Should not crash and image should still be displayed
    expect(images[0]).toBeInTheDocument();
  });

  it('displays correct creation dates', () => {
    render(<ImageGallery />);
    
    // Check that dates are formatted correctly
    expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 2, 2023/)).toBeInTheDocument();
  });

  it('maintains aspect ratio for images', () => {
    render(<ImageGallery />);
    
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveClass('object-cover');
    });
  });

  it('shows loading state for images', () => {
    render(<ImageGallery />);
    
    const images = screen.getAllByRole('img');
    // Images should have loading="lazy" attribute
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('navigates between images in modal with keyboard', () => {
    render(<ImageGallery />);
    
    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);
    
    // Should be able to navigate with arrow keys
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    
    const modalImage = screen.getByRole('dialog').querySelector('img');
    expect(modalImage).toHaveAttribute('src', 'https://example.com/image2.jpg');
  });

  it('handles empty prompt gracefully', () => {
    const imagesWithEmptyPrompt = [
      {
        id: '1',
        url: 'https://example.com/image1.jpg',
        prompt: '',
        createdAt: '2023-01-01T00:00:00Z',
      },
    ];

    vi.doMock('../store/imageStore', () => ({
      useImageStore: () => ({
        images: imagesWithEmptyPrompt,
        deleteImage: mockDeleteImage,
      }),
    }));

    render(<ImageGallery />);
    
    expect(screen.getByText('No description')).toBeInTheDocument();
  });
});