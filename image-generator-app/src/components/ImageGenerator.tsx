import React, { useState } from 'react';
import { Paintbrush, Loader2 } from 'lucide-react';
import { useImageGenerator } from '../hooks/useImageGenerator';

interface ColoringOptions {
  style: string;
  ageGroup: string;
  complexity: string;
  lineThickness: string;
  border: string;
}

const COLORING_OPTIONS = {
  styles: [
    { id: 'cartoon', label: 'Cartoon', description: 'Fun and playful' },
    { id: 'realistic', label: 'Realistic', description: 'Detailed and lifelike' },
    { id: 'mandala', label: 'Mandala', description: 'Intricate patterns' },
    { id: 'geometric', label: 'Geometric', description: 'Shapes and patterns' },
  ],
  ageGroups: [
    { id: 'preschool', label: 'Preschool', description: '3-5 years' },
    { id: 'elementary', label: 'Elementary', description: '6-11 years' },
    { id: 'teen', label: 'Teen', description: '12-17 years' },
    { id: 'adult', label: 'Adult', description: '18+ years' },
  ],
  complexity: [
    { id: 'simple', label: 'Simple', description: 'Easy to color' },
    { id: 'medium', label: 'Medium', description: 'Moderate detail' },
    { id: 'detailed', label: 'Detailed', description: 'Intricate design' },
  ],
  lineThickness: [
    { id: 'thin', label: 'Thin', description: 'Fine lines' },
    { id: 'medium', label: 'Medium', description: 'Standard thickness' },
    { id: 'bold', label: 'Bold', description: 'Thick lines' },
  ],
  borders: [
    { id: 'none', label: 'None', description: 'No border' },
    { id: 'simple', label: 'Simple', description: 'Clean border' },
    { id: 'decorative', label: 'Decorative', description: 'Ornate border' },
    { id: 'themed', label: 'Themed', description: 'Matches content' },
  ],
};

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<ColoringOptions>({
    style: 'cartoon',
    ageGroup: 'elementary',
    complexity: 'medium',
    lineThickness: 'medium',
    border: 'simple',
  });
  const { generateImage, isGenerating } = useImageGenerator();

  const updateOption = (category: keyof ColoringOptions, value: string) => {
    setOptions(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    try {
      // Enhance prompt with selected options
      const enhancedPrompt = `${prompt}, ${options.style} style, ${options.complexity} detail, ${options.lineThickness} lines, ${options.border} border, black and white line art, coloring book style, suitable for ${options.ageGroup} age group`;
      await generateImage(enhancedPrompt);
      setPrompt('');
    } catch (error) {
      console.error('Failed to generate coloring page:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-aigenr-container rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark">
      <h2 className="text-aigenr-h3 font-aigenr-black text-aigenr-dark mb-6 text-center">
        Coloring Page Creator
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label htmlFor="prompt-input" className="sr-only">
            Image description prompt
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you'd like to color (e.g., a cute cat, beautiful flowers, space adventure)..."
            className="w-full h-32 p-4 border-aigenr border-aigenr-dark rounded-aigenr resize-none focus:outline-none focus:ring-2 focus:ring-aigenr-orange bg-aigenr-container text-aigenr-dark font-aigenr-light placeholder-aigenr-gray"
            disabled={isGenerating}
            aria-describedby="prompt-help"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!isGenerating && prompt.trim()) {
                  handleSubmit(e as any);
                }
              }
            }}
          />
          <div id="prompt-help" className="sr-only">
            Describe the coloring page you want to create. Press Ctrl+Enter to generate.
          </div>
        </div>
        
        {/* Category Options */}
        <div className="space-y-6">
          {/* Style Selection */}
          <div>
            <h3 className="text-aigenr-body font-aigenr-bold text-aigenr-dark mb-3">Style</h3>
            <div className="flex flex-wrap gap-2">
              {COLORING_OPTIONS.styles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => updateOption('style', style.id)}
                  className={`px-4 py-2 rounded-aigenr border-aigenr border-aigenr-dark transition-all font-aigenr-medium shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 ${
                    options.style === style.id
                      ? 'bg-aigenr-primary text-aigenr-dark'
                      : 'bg-aigenr-gray-light text-aigenr-dark hover:bg-aigenr-container'
                  }`}
                  title={style.description}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group Selection */}
          <div>
            <h3 className="text-aigenr-body font-aigenr-bold text-aigenr-dark mb-3">Age Group</h3>
            <div className="flex flex-wrap gap-2">
              {COLORING_OPTIONS.ageGroups.map((age) => (
                <button
                  key={age.id}
                  type="button"
                  onClick={() => updateOption('ageGroup', age.id)}
                  className={`px-4 py-2 rounded-aigenr border-aigenr border-aigenr-dark transition-all font-aigenr-medium shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 ${
                    options.ageGroup === age.id
                      ? 'bg-aigenr-primary text-aigenr-dark'
                      : 'bg-aigenr-gray-light text-aigenr-dark hover:bg-aigenr-container'
                  }`}
                  title={age.description}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity Selection */}
          <div>
            <h3 className="text-aigenr-body font-aigenr-bold text-aigenr-dark mb-3">Detail Complexity</h3>
            <div className="flex flex-wrap gap-2">
              {COLORING_OPTIONS.complexity.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => updateOption('complexity', level.id)}
                  className={`px-4 py-2 rounded-aigenr border-aigenr border-aigenr-dark transition-all font-aigenr-medium shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 ${
                    options.complexity === level.id
                      ? 'bg-aigenr-primary text-aigenr-dark'
                      : 'bg-aigenr-gray-light text-aigenr-dark hover:bg-aigenr-container'
                  }`}
                  title={level.description}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Thickness Selection */}
          <div>
            <h3 className="text-aigenr-body font-aigenr-bold text-aigenr-dark mb-3">Line Thickness</h3>
            <div className="flex flex-wrap gap-2">
              {COLORING_OPTIONS.lineThickness.map((thickness) => (
                <button
                  key={thickness.id}
                  type="button"
                  onClick={() => updateOption('lineThickness', thickness.id)}
                  className={`px-4 py-2 rounded-aigenr border-aigenr border-aigenr-dark transition-all font-aigenr-medium shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 ${
                    options.lineThickness === thickness.id
                      ? 'bg-aigenr-primary text-aigenr-dark'
                      : 'bg-aigenr-gray-light text-aigenr-dark hover:bg-aigenr-container'
                  }`}
                  title={thickness.description}
                >
                  {thickness.label}
                </button>
              ))}
            </div>
          </div>

          {/* Border Selection */}
          <div>
            <h3 className="text-aigenr-body font-aigenr-bold text-aigenr-dark mb-3">Border</h3>
            <div className="flex flex-wrap gap-2">
              {COLORING_OPTIONS.borders.map((border) => (
                <button
                  key={border.id}
                  type="button"
                  onClick={() => updateOption('border', border.id)}
                  className={`px-4 py-2 rounded-aigenr border-aigenr border-aigenr-dark transition-all font-aigenr-medium shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 ${
                    options.border === border.id
                      ? 'bg-aigenr-primary text-aigenr-dark'
                      : 'bg-aigenr-gray-light text-aigenr-dark hover:bg-aigenr-container'
                  }`}
                  title={border.description}
                >
                  {border.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3 px-6 bg-aigenr-primary text-aigenr-dark rounded-aigenr font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 disabled:bg-aigenr-gray disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-aigenr-orange"
          aria-describedby={isGenerating ? 'generating-status' : undefined}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span id="generating-status">Generating...</span>
            </>
          ) : (
            <>
              <Paintbrush className="w-5 h-5" aria-hidden="true" />
              Create Coloring Page
            </>
          )}
        </button>
      </form>
    </div>
  );
};