import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeneratedImage } from '../types';

interface GalleryStore {
  savedImages: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  saveToGallery: (image: GeneratedImage) => void;
  removeFromGallery: (id: string) => void;
  updateImage: (id: string, updates: Partial<GeneratedImage>) => void;
  clearGallery: () => void;
  isImageSaved: (id: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth-related methods (placeholders)
  loadUserGallery: (userId: string) => Promise<void>;
  migrateAnonymousImages: (userId: string) => Promise<void>;
}

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set, get) => ({
      savedImages: [],
      isLoading: false,
      error: null,
      
      saveToGallery: (image) => {
        const state = get();
        // Check if image is already saved
        if (state.savedImages.some(img => img.id === image.id)) {
          return;
        }
        
        set((state) => ({
          savedImages: [image, ...state.savedImages]
        }));
      },
      
      removeFromGallery: (id) => {
        set((state) => ({
          savedImages: state.savedImages.filter(img => img.id !== id)
        }));
      },
      
      updateImage: (id, updates) => {
        set((state) => ({
          savedImages: state.savedImages.map(img => 
            img.id === id ? { ...img, ...updates } : img
          )
        }));
      },
      
      clearGallery: () => {
        set({ savedImages: [] });
      },
      
      isImageSaved: (id) => {
        const state = get();
        return state.savedImages.some(img => img.id === id);
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      // Placeholder auth methods
      loadUserGallery: async (userId: string) => {
        console.log('Load user gallery placeholder - Firebase not configured');
      },
      migrateAnonymousImages: async (userId: string) => {
        console.log('Migrate images placeholder - Firebase not configured');
      }
    }),
    {
      name: 'gallery-storage',
      partialize: (state) => ({
        savedImages: state.savedImages
      })
    }
  )
);

// Legacy export for backward compatibility
export const useImageStore = useGalleryStore;