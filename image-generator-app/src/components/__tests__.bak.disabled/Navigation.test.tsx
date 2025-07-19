import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../Navigation';

// Mock the gallery store
vi.mock('../../store/imageStore', () => ({
  useGalleryStore: () => ({
    savedImages: [
      { id: '1', url: 'test1.jpg', prompt: 'test 1', createdAt: '2023-01-01' },
      { id: '2', url: 'test2.jpg', prompt: 'test 2', createdAt: '2023-01-02' },
    ]
  }),
}));

const NavigationWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Navigation', () => {
  it('renders navigation with correct links', () => {
    render(
      <NavigationWrapper>
        <Navigation />
      </NavigationWrapper>
    );

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Generate' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gallery.*2 items/ })).toBeInTheDocument();
  });

  it('shows gallery badge with correct count', () => {
    render(
      <NavigationWrapper>
        <Navigation />
      </NavigationWrapper>
    );

    const galleryBadge = screen.getByLabelText('2 saved images');
    expect(galleryBadge).toBeInTheDocument();
    expect(galleryBadge).toHaveTextContent('2');
  });

  it('has proper accessibility attributes', () => {
    render(
      <NavigationWrapper>
        <Navigation />
      </NavigationWrapper>
    );

    const generateLink = screen.getByRole('link', { name: 'Generate' });
    expect(generateLink).toHaveAttribute('title', 'Create new images');

    const galleryLink = screen.getByRole('link', { name: /Gallery/ });
    expect(galleryLink).toHaveAttribute('title', 'View saved images');
  });
});