import React, { useState } from 'react';
import { Download, Save, Sparkles, Check, AlertCircle } from 'lucide-react';
import { GeneratedImage } from '../types';
import { useGalleryStore } from '../store/imageStore';

interface GenerationResultProps {
  image: GeneratedImage;
  onGenerateNew: () => void;
}

export const GenerationResult: React.FC<GenerationResultProps> = ({ 
  image, 
  onGenerateNew 
}) => {
  const { saveToGallery, isImageSaved } = useGalleryStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isSaved = isImageSaved(image.id);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `ai-generated-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToGallery = async () => {
    if (isSaved) return;
    
    setSaveStatus('saving');
    try {
      // Simulate a brief saving animation
      await new Promise(resolve => setTimeout(resolve, 500));
      saveToGallery(image);
      setSaveStatus('saved');
      
      // Reset status after showing success
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const getSaveButtonContent = () => {
    if (isSaved) {
      return (
        <>
          <Check className="w-4 h-4" />
          <span className="hidden sm:inline">Saved</span>
        </>
      );
    }
    
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">Saving...</span>
          </>
        );
      case 'saved':
        return (
          <>
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">Saved!</span>
          </>
        );
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Error</span>
          </>
        );
      default:
        return (
          <>
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save to Gallery</span>
          </>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-aigenr-container rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark overflow-hidden">
        {/* Image Display */}
        <div className="relative aspect-square bg-aigenr-gray-light">
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Prompt */}
          <div className="mb-4">
            <h3 className="text-aigenr-body font-aigenr-bold text-aigenr-dark mb-2">
              Generated Image
            </h3>
            <p className="text-aigenr-gray text-sm leading-relaxed font-aigenr-light">
              "{image.prompt}"
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-aigenr-gray mb-6 font-aigenr-light">
            <span>Created {new Date(image.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>ID: {image.id.slice(0, 8)}...</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Save to Gallery Button */}
            <button
              onClick={handleSaveToGallery}
              disabled={isSaved || saveStatus === 'saving'}
              className={`
                flex items-center justify-center gap-2 px-4 py-2.5 rounded-aigenr
                font-aigenr-bold transition-all duration-200 flex-1 border-aigenr border-aigenr-dark
                ${isSaved 
                  ? 'bg-green-600 text-white cursor-default shadow-aigenr-button' 
                  : saveStatus === 'error'
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5'
                  : 'bg-aigenr-primary text-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5'
                }
                ${saveStatus === 'saving' ? 'cursor-not-allowed' : ''}
              `}
            >
              {getSaveButtonContent()}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="
                flex items-center justify-center gap-2 px-4 py-2.5 rounded-aigenr
                border-aigenr border-aigenr-dark text-aigenr-dark font-aigenr-bold
                hover:bg-aigenr-gray-light transition-all duration-200 shadow-aigenr-hard
                hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 flex-1 sm:flex-initial
              "
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Generate New Button */}
            <button
              onClick={onGenerateNew}
              className="
                flex items-center justify-center gap-2 px-4 py-2.5 rounded-aigenr
                border-aigenr border-aigenr-dark text-aigenr-dark font-aigenr-bold
                hover:bg-aigenr-gray-light transition-all duration-200 shadow-aigenr-hard
                hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 flex-1 sm:flex-initial
              "
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate New</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};