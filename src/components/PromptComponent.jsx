import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import './PromptComponent.css';

const PromptComponent = () => {
  const [formData, setFormData] = useState({
    prompt: '',
    theme: '',
    complexity: '',
    ageGroup: '',
    border: false,
    lineThickness: ''
  });
  
  const [validation, setValidation] = useState({
    prompt: { isValid: false, message: '' },
    complexity: { isValid: false, message: '' },
    ageGroup: { isValid: false, message: '' },
    lineThickness: { isValid: false, message: '' }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCustomizations, setShowCustomizations] = useState(false);
  const [refinedPrompt, setRefinedPrompt] = useState('');
  // Added error state for API call handling
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Real-time validation
  useEffect(() => {
    const newValidation = { ...validation };
    
    // Prompt validation
    if (formData.prompt.trim().length > 0) {
      newValidation.prompt = { isValid: true, message: '' };
    } else {
      newValidation.prompt = { isValid: false, message: 'Please enter a description' };
    }
    
    // Complexity validation
    if (formData.complexity) {
      newValidation.complexity = { isValid: true, message: '' };
    } else {
      newValidation.complexity = { isValid: false, message: 'Select complexity' };
    }
    
    // Age group validation
    if (formData.ageGroup) {
      newValidation.ageGroup = { isValid: true, message: '' };
    } else {
      newValidation.ageGroup = { isValid: false, message: 'Select age group' };
    }
    
    // Line thickness validation
    if (formData.lineThickness) {
      newValidation.lineThickness = { isValid: true, message: '' };
    } else {
      newValidation.lineThickness = { isValid: false, message: 'Select line thickness' };
    }
    
    setValidation(newValidation);
  }, [formData]);

  const isFormValid = () => {
    return validation.prompt.isValid && 
           validation.complexity.isValid && 
           validation.ageGroup.isValid && 
           validation.lineThickness.isValid;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Moved prompt refinement to backend API call per architecture.md
  const callPromptRefinementAPI = async (formData) => {
    try {
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: formData.prompt,
          customizations: {
            complexity: formData.complexity,
            ageGroup: formData.ageGroup,
            lineThickness: formData.lineThickness,
            border: formData.border ? 'with' : 'without',
            theme: formData.theme || null
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.refinedPrompt;
    } catch (error) {
      console.error('Prompt refinement API error:', error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (!isFormValid()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call backend API for prompt refinement
      const refined = await callPromptRefinementAPI(formData);
      setRefinedPrompt(refined);
      
      // Simulate DALL-E API call for demo - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated image
      setGeneratedImage('https://via.placeholder.com/600x600/ffffff/000000?text=Generated+Coloring+Page');
      setShowModal(true);
    } catch (error) {
      console.error('Generation failed:', error);
      setError('Failed to generate coloring page. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    // Implement PDF download logic
    console.log('Downloading PDF...');
    setShowModal(false);
  };

  const handleSaveToGallery = () => {
    // Implement save to gallery logic
    console.log('Saving to gallery...');
    setShowModal(false);
  };

  const CheckIcon = () => (
    <svg className="w-4 h-4 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  const MagicWandIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path d="M11 2L9 6l-4-2 4 6H3l8 2v4l2-6 4 2-4-6h6L11 2z"/>
    </svg>
  );

  const ChevronIcon = ({ isOpen }) => (
    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );

  // Added PaintbrushIcon for generate button
  const PaintbrushIcon = () => (
    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-5">
      {/* Form Section */}
      <div className="bg-white rounded-2xl shadow-md doodle-border p-5 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Prompt Input - Full Width */}
          <div className="lg:col-span-2">
            <label className="block text-base font-bold text-gray-800 mb-2 handlee-font">
              Describe your coloring page
            </label>
            <div className="relative">
              <textarea
                value={formData.prompt}
                onChange={(e) => handleInputChange('prompt', e.target.value)}
                placeholder="e.g., unicorn in a forest"
                className={`w-full h-24 p-3 border-2 rounded-lg resize-none transition-all duration-200 ${
                  validation.prompt.isValid
                    ? 'border-green-300 focus:border-pastel-blue'
                    : formData.prompt.length > 0
                    ? 'border-red-300'
                    : 'border-gray-300 focus:border-pastel-blue'
                } focus:ring-4 focus:ring-blue-100 focus:outline-none`}
                aria-invalid={!validation.prompt.isValid}
                aria-describedby="prompt-error"
                aria-label="Describe your coloring page"
              />
              {validation.prompt.isValid && <CheckIcon />}
            </div>
            {!validation.prompt.isValid && formData.prompt.length === 0 && (
              <p id="prompt-error" className="text-red-500 text-sm mt-1">
                {validation.prompt.message}
              </p>
            )}
          </div>

          {/* Theme Dropdown */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 handlee-font">
              Select Theme
            </label>
            <div className="relative">
              <div className="flex items-center">
                <MagicWandIcon />
                <select
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-pastel-blue focus:ring-4 focus:ring-blue-100 focus:outline-none appearance-none bg-white"
                  aria-label="Select theme for your coloring page"
                >
                  <option value="">Choose a theme (optional)</option>
                  <option value="animals">Animals</option>
                  <option value="mandalas">Mandalas</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="nature">Nature</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customization Accordion */}
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => setShowCustomizations(!showCustomizations)}
              className="flex items-center justify-between w-full text-sm font-bold text-gray-700 mb-3 p-2 hover:bg-gray-50 rounded-lg transition-colors handlee-font"
              aria-expanded={showCustomizations}
              aria-label="Toggle customization options"
            >
              Customization Options
              <ChevronIcon isOpen={showCustomizations} />
            </button>
            
            {showCustomizations && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Complexity */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 handlee-font">
                    Detail Complexity
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['simple', 'medium', 'detailed'].map(option => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="complexity"
                          value={option}
                          checked={formData.complexity === option}
                          onChange={(e) => handleInputChange('complexity', e.target.value)}
                          className="sr-only"
                          aria-label={`Select ${option} complexity`}
                        />
                        <div className={`px-4 py-2 rounded-full border-2 transition-all ${
                          formData.complexity === option
                            ? 'border-pastel-blue bg-pastel-blue text-white'
                            : 'border-gray-300 hover:border-pastel-blue'
                        }`}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </div>
                      </label>
                    ))}
                    {validation.complexity.isValid && <CheckIcon />}
                  </div>
                  {!validation.complexity.isValid && (
                    <p className="text-red-500 text-sm mt-1">{validation.complexity.message}</p>
                  )}
                </div>

                {/* Age Group */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 handlee-font">
                    Age Group
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['kids', 'teens', 'adults'].map(option => (
                      <label key={option} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="ageGroup"
                          value={option}
                          checked={formData.ageGroup === option}
                          onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                          className="sr-only"
                          aria-label={`Select ${option} age group`}
                        />
                        <div className={`px-4 py-2 rounded-full border-2 transition-all ${
                          formData.ageGroup === option
                            ? 'border-pastel-blue bg-pastel-blue text-white'
                            : 'border-gray-300 hover:border-pastel-blue'
                        }`}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </div>
                      </label>
                    ))}
                    {validation.ageGroup.isValid && <CheckIcon />}
                  </div>
                  {!validation.ageGroup.isValid && (
                    <p className="text-red-500 text-sm mt-1">{validation.ageGroup.message}</p>
                  )}
                </div>

                {/* Border Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="border"
                    checked={formData.border}
                    onChange={(e) => handleInputChange('border', e.target.checked)}
                    className="w-4 h-4 text-pastel-blue bg-gray-100 border-gray-300 rounded focus:ring-pastel-blue focus:ring-2"
                    aria-label="Include decorative border"
                  />
                  <label htmlFor="border" className="ml-2 text-sm font-bold text-gray-700 handlee-font">
                    With Border
                  </label>
                </div>

                {/* Line Thickness */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 handlee-font">
                    Line Thickness
                  </label>
                  <div className="relative">
                    <select
                      value={formData.lineThickness}
                      onChange={(e) => handleInputChange('lineThickness', e.target.value)}
                      className={`w-full p-3 border-2 rounded-lg appearance-none bg-white transition-all ${
                        validation.lineThickness.isValid
                          ? 'border-green-300'
                          : 'border-gray-300'
                      } focus:border-pastel-blue focus:ring-4 focus:ring-blue-100 focus:outline-none`}
                      aria-label="Select line thickness"
                    >
                      <option value="">Select thickness</option>
                      <option value="thin">Thin</option>
                      <option value="medium">Medium</option>
                      <option value="thick">Thick</option>
                    </select>
                    {validation.lineThickness.isValid && <CheckIcon />}
                  </div>
                  {!validation.lineThickness.isValid && (
                    <p className="text-red-500 text-sm mt-1">{validation.lineThickness.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleGenerate}
            disabled={!isFormValid() || isGenerating}
            className={`relative px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
              isFormValid() && !isGenerating
                ? 'bg-pastel-blue hover:bg-blue-500 animate-pulse-generate'
                : 'bg-gray-400 cursor-not-allowed opacity-50'
            } w-full md:w-auto min-w-48`}
            title={refinedPrompt && `Refined prompt: ${refinedPrompt}`}
            aria-disabled={!isFormValid() || isGenerating}
            aria-label="Generate coloring page"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <PaintbrushIcon />
                Generate
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="min-h-96 border border-gray-300 rounded-lg bg-white p-4 text-center">
        {generatedImage ? (
          <div className="animate-fade-in">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={3}
              centerOnInit={true}
            >
              <TransformComponent
                wrapperClass="w-full h-80"
                contentClass="flex items-center justify-center"
              >
                <img
                  src={generatedImage}
                  alt="Generated coloring page"
                  className="max-w-full max-h-full object-contain"
                  aria-label="Generated coloring book page preview"
                />
              </TransformComponent>
            </TransformWrapper>
            <div className="confetti-animation"></div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p>Your coloring page will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Post-Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center handlee-font">
              🎉 Your coloring page is ready!
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 bg-pastel-green hover:bg-green-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={handleSaveToGallery}
                className="flex-1 bg-pastel-purple hover:bg-purple-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Save to Gallery
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-red-600 mb-4 text-center handlee-font">
              ⚠️ Oops! Something went wrong
            </h3>
            <p className="text-gray-700 text-center mb-4">
              {error}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptComponent;