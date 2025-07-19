import { create } from 'zustand';
import { GeneratedImage } from '../types';

interface GenerationStore {
  currentImage: GeneratedImage | null;
  isGenerating: boolean;
  generationHistory: GeneratedImage[];
  setCurrentImage: (image: GeneratedImage | null) => void;
  setIsGenerating: (generating: boolean) => void;
  addToHistory: (image: GeneratedImage) => void;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 10;

export const useGenerationStore = create<GenerationStore>((set) => ({
  currentImage: null,
  isGenerating: false,
  generationHistory: [],
  
  setCurrentImage: (image) => set({ currentImage: image }),
  
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  
  addToHistory: (image) => set((state) => ({
    generationHistory: [
      image,
      ...state.generationHistory.slice(0, MAX_HISTORY_SIZE - 1)
    ]
  })),
  
  clearHistory: () => set({ generationHistory: [] })
}));