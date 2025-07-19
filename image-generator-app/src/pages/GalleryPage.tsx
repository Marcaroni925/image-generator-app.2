import React, { useState } from 'react';
import { Download, Trash2, Eye, X, Check, Circle } from 'lucide-react';
import { useGalleryStore } from '../store/imageStore';
import { GeneratedImage } from '../types';

export const GalleryPage: React.FC = () => {
  const { savedImages, removeFromGallery } = useGalleryStore();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());

  // Sort images by newest first
  const filteredImages = savedImages
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDownload = async (image: GeneratedImage) => {
    try {
      // For blob URLs, we need to fetch the blob first
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Create a new blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ai-generated-${image.id.slice(0, 8)}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
      
      console.log('Download initiated for image:', image.id);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try direct link download
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `ai-generated-${image.id.slice(0, 8)}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this image from your gallery?')) {
      removeFromGallery(id);
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
      console.log('Image deleted from gallery:', id);
    }
  };

  // Selection management functions
  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(imageId)) {
        newSelection.delete(imageId);
      } else {
        newSelection.add(imageId);
      }
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedImageIds(new Set());
  };

  const removeSelectedImages = () => {
    const count = selectedImageIds.size;
    if (window.confirm(`Are you sure you want to remove ${count} selected image${count !== 1 ? 's' : ''} from your gallery?`)) {
      selectedImageIds.forEach(id => {
        removeFromGallery(id);
        if (selectedImage?.id === id) {
          setSelectedImage(null);
        }
      });
      clearSelection();
      console.log(`Removed ${count} images from gallery`);
    }
  };

  const selectAllImages = () => {
    setSelectedImageIds(new Set(filteredImages.map(img => img.id)));
  };

  const isAllSelected = filteredImages.length > 0 && selectedImageIds.size === filteredImages.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-aigenr-container rounded-aigenr p-6 shadow-aigenr-card border-aigenr border-aigenr-dark">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-aigenr-h3 font-aigenr-black text-aigenr-dark">
              My Gallery
            </h1>
            <p className="text-aigenr-gray mt-1 font-aigenr-light">
              {savedImages.length} saved image{savedImages.length !== 1 ? 's' : ''}
              {selectedImageIds.size > 0 && (
                <span className="ml-2 text-aigenr-orange font-aigenr-medium">
                  • {selectedImageIds.size} selected
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedImages.length > 0 && (
              <button
                onClick={isAllSelected ? clearSelection : selectAllImages}
                className="flex items-center gap-2 px-3 py-2 text-aigenr-gray hover:text-aigenr-orange hover:bg-aigenr-gray-light rounded-aigenr transition-colors text-sm font-aigenr-medium border-aigenr border-aigenr-dark shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5"
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>
            )}
            
            {selectedImageIds.size > 0 && (
              <button
                onClick={removeSelectedImages}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-aigenr hover:bg-red-700 transition-colors shadow-aigenr-button border-aigenr border-aigenr-dark hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 font-aigenr-bold"
              >
                <Trash2 className="w-4 h-4" />
                Remove Selected ({selectedImageIds.size})
              </button>
            )}
          </div>
        </div>
      </div>

        {savedImages.length === 0 ? (
          /* Empty State */
          <div className="bg-aigenr-container rounded-aigenr p-8 shadow-aigenr-card border-aigenr border-aigenr-dark text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-aigenr-primary rounded-aigenr flex items-center justify-center mx-auto mb-6 border-aigenr border-aigenr-dark">
                <Eye className="w-10 h-10 text-aigenr-dark" />
              </div>
              <h3 className="text-xl font-aigenr-bold text-aigenr-dark mb-3">
                Your gallery is empty
              </h3>
              <p className="text-aigenr-gray mb-6 font-aigenr-light">
                Generate some images and save them to your gallery to see them here.
              </p>
              <a
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-aigenr-primary text-aigenr-dark rounded-aigenr font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
              >
                Start Generating
              </a>
            </div>
          </div>
        ) : (
          <>

            {/* Gallery Grid */}
            <div className="bg-aigenr-container rounded-aigenr p-6 shadow-aigenr-card border-aigenr border-aigenr-dark">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`group relative bg-aigenr-gray-light rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark overflow-hidden hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 ${
                      selectedImageIds.has(image.id) 
                        ? 'ring-2 ring-aigenr-orange ring-offset-2' 
                        : ''
                    }`}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
                        onClick={() => setSelectedImage(image)}
                      />
                      
                      {/* Selection Checkbox - Top Left */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleImageSelection(image.id);
                        }}
                        className="absolute top-2 left-2 z-20 p-1 bg-aigenr-container/90 backdrop-blur-sm rounded-full shadow-aigenr-card hover:bg-aigenr-container border-aigenr border-aigenr-dark transition-all duration-200"
                        title={selectedImageIds.has(image.id) ? 'Unselect image' : 'Select image'}
                      >
                        {selectedImageIds.has(image.id) ? (
                          <Check className="w-4 h-4 text-aigenr-orange" />
                        ) : (
                          <Circle className="w-4 h-4 text-aigenr-gray" />
                        )}
                      </button>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              console.log('Download button clicked for image:', image.id);
                              handleDownload(image);
                            }}
                            className="p-2 bg-aigenr-container rounded-aigenr border-aigenr border-aigenr-dark shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-aigenr-dark" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              console.log('Delete button clicked for image:', image.id);
                              handleDelete(image.id);
                            }}
                            className="p-2 bg-aigenr-container rounded-aigenr border-aigenr border-aigenr-dark shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
                            title="Delete from Gallery"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Info */}
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
                        <span className="text-xs text-aigenr-gray font-aigenr-light">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-aigenr-gray line-clamp-2 font-aigenr-light" title={image.prompt}>
                        {image.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Enhanced Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Action Bar */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="p-3 bg-aigenr-container/20 backdrop-blur-md rounded-aigenr border-aigenr border-aigenr-dark/20 hover:bg-aigenr-container/30 transition-all duration-200 shadow-aigenr-card"
                  title="Download Image"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedImage.id);
                    setSelectedImage(null);
                  }}
                  className="p-3 bg-aigenr-container/20 backdrop-blur-md rounded-aigenr border-aigenr border-aigenr-dark/20 hover:bg-red-500/30 transition-all duration-200 shadow-aigenr-card group"
                  title="Delete from Gallery"
                >
                  <Trash2 className="w-5 h-5 text-white group-hover:text-red-400" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-3 bg-aigenr-container/20 backdrop-blur-md rounded-aigenr border-aigenr border-aigenr-dark/20 hover:bg-aigenr-container/30 transition-all duration-200 shadow-aigenr-card"
                  title="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* Main Image */}
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="max-w-full max-h-full object-contain rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark"
                style={{ maxHeight: 'calc(90vh - 120px)' }}
              />
              
              {/* Bottom Info Panel */}
              <div className="absolute bottom-4 left-4 right-4 bg-aigenr-container/80 backdrop-blur-md text-aigenr-dark p-4 rounded-aigenr border-aigenr border-aigenr-dark shadow-aigenr-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-aigenr-bold mb-1 line-clamp-2">
                      "{selectedImage.prompt}"
                    </p>
                    <div className="flex items-center gap-4 text-xs text-aigenr-gray font-aigenr-light">
                      <span>Created {new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>ID: {selectedImage.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                  
                  {/* Mobile Action Buttons */}
                  <div className="flex gap-2 sm:hidden">
                    <button
                      onClick={() => handleDownload(selectedImage)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-aigenr-orange/80 rounded-aigenr text-xs hover:bg-aigenr-orange transition-colors text-aigenr-dark font-aigenr-bold border-aigenr border-aigenr-dark"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedImage.id);
                        setSelectedImage(null);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600/80 rounded-aigenr text-xs hover:bg-red-600 transition-colors text-white font-aigenr-bold border-aigenr border-aigenr-dark"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};