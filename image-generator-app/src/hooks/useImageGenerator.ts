import { GeneratedImage } from '../types';
import { validateAndSanitizePrompt } from '../utils/validation';
import { errorTracker } from '../utils/errorTracking';
import { useGenerationStore } from '../store/generationStore';

export const useImageGenerator = () => {
  const { setCurrentImage, setIsGenerating, addToHistory, isGenerating } = useGenerationStore();

  const generateImage = async (prompt: string): Promise<GeneratedImage> => {
    if (isGenerating) {
      throw new Error('Image generation already in progress');
    }

    const validation = validateAndSanitizePrompt(prompt);
    if (!validation.isValid) {
      const error = new Error(validation.error!);
      errorTracker.captureError(error, {
        component: 'useImageGenerator',
        action: 'validatePrompt',
        prompt: prompt.substring(0, 100), // Log first 100 chars for debugging
      });
      throw error;
    }

    const sanitizedPrompt = validation.sanitizedValue!;
    setIsGenerating(true);
    
    try {
      
      // Simulate AI image generation with a placeholder service
      // In a real app, this would call an AI service like OpenAI DALL-E, Midjourney, etc.
      const response = await fetch(`https://picsum.photos/512/512?random=${Date.now()}`, {
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url,
        prompt: sanitizedPrompt,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      };
      
      // Update store with new image
      setCurrentImage(newImage);
      addToHistory(newImage);
      
      return newImage;
    } catch (error) {
      console.error('Error generating image:', error);
      errorTracker.captureError(
        error instanceof Error ? error : new Error('Failed to generate image'),
        {
          component: 'useImageGenerator',
          action: 'generateImage',
          prompt: sanitizedPrompt,
          timestamp: Date.now(),
        }
      );
      throw error instanceof Error ? error : new Error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateImage, isGenerating };
};