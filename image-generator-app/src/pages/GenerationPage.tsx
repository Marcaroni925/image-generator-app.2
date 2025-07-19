import React from 'react';
import { ImageGenerator } from '../components/ImageGenerator';
import { GenerationResult } from '../components/GenerationResult';
import { useGenerationStore } from '../store/generationStore';
import { Palette, Clock } from 'lucide-react';

export const GenerationPage: React.FC = () => {
  const { currentImage, isGenerating, generationHistory, setCurrentImage } = useGenerationStore();

  const handleGenerateNew = () => {
    // This will be triggered when user wants to generate a new image
    // The ImageGenerator component will handle clearing currentImage
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-aigenr-container rounded-aigenr p-6 shadow-aigenr-card border-aigenr border-aigenr-dark">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-aigenr-primary rounded-aigenr border-aigenr border-aigenr-dark">
            <Palette className="w-6 h-6 text-aigenr-dark" />
          </div>
          <div>
            <h1 className="text-aigenr-h3 font-aigenr-black text-aigenr-dark">
              Coloring Book Creator
            </h1>
            <p className="text-aigenr-gray text-sm font-aigenr-light">
              AI-powered coloring page generation
            </p>
          </div>
        </div>
        <p className="text-aigenr-gray font-aigenr-light">
          Describe what you'd like to color and let AI create beautiful 
          coloring pages perfect for printing and enjoying.
        </p>
      </div>

      {/* Generation Section */}
      <div className="bg-aigenr-container rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark">
        <ImageGenerator />
      </div>

      {/* Result Section */}
      {currentImage && !isGenerating && (
        <div className="bg-aigenr-container rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark">
          <GenerationResult 
            image={currentImage} 
            onGenerateNew={handleGenerateNew}
          />
        </div>
      )}

      {/* Generation History */}
      {generationHistory.length > 0 && !isGenerating && (
        <div className="bg-aigenr-container rounded-aigenr p-6 shadow-aigenr-card border-aigenr border-aigenr-dark">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-aigenr-gray" />
            <h2 className="text-xl font-aigenr-bold text-aigenr-dark">
              Recent Coloring Pages
            </h2>
            <span className="text-sm text-aigenr-gray bg-aigenr-gray-light px-2 py-1 rounded-aigenr border-aigenr border-aigenr-dark font-aigenr-light">
              {generationHistory.length}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {generationHistory.map((image, index) => (
              <div
                key={image.id}
                className="bg-aigenr-gray-light rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="aspect-square bg-aigenr-gray-light relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <button
                      onClick={() => {
                        setCurrentImage(image);
                      }}
                      className="bg-aigenr-container text-aigenr-dark px-3 py-1.5 rounded-aigenr text-sm font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
                    >
                      View
                    </button>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-aigenr-primary rounded-full flex items-center justify-center border-aigenr border-aigenr-dark">
                        <span className="text-xs font-aigenr-bold text-aigenr-dark">
                          {String.fromCharCode(65 + (index % 26))}
                        </span>
                      </div>
                      <span className="text-xs text-aigenr-gray font-aigenr-light">You</span>
                    </div>
                  </div>
                  <p className="text-xs text-aigenr-gray line-clamp-2 font-aigenr-light">
                    {image.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State for First Time Users */}
      {!currentImage && !isGenerating && generationHistory.length === 0 && (
        <div className="bg-aigenr-container rounded-aigenr p-8 shadow-aigenr-card border-aigenr border-aigenr-dark text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-aigenr-primary rounded-aigenr flex items-center justify-center mx-auto mb-4 border-aigenr border-aigenr-dark">
              <Palette className="w-8 h-8 text-aigenr-dark" />
            </div>
            <h3 className="text-lg font-aigenr-bold text-aigenr-dark mb-2">
              Ready to create your first coloring page?
            </h3>
            <p className="text-aigenr-gray text-sm font-aigenr-light">
              Describe what you'd like to color and customize your coloring page options above.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};