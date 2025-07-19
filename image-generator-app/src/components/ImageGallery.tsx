import React, { useState } from 'react';
import { Download, Trash2, Eye, X } from 'lucide-react';
import { useGalleryStore } from '../store/imageStore';
import { GeneratedImage } from '../types';

export const ImageGallery: React.FC = () => {
  const { savedImages: images, removeFromGallery: removeImage } = useGalleryStore();
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `generated-image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    removeImage(id);
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No images generated yet.</p>
        <p className="text-gray-400 text-sm mt-2">Generate your first image to see it here!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Generated Images ({images.length})
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={image.url}
                alt={image.prompt}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedImage(image)}
              />
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedImage(image)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(image)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="p-3">
              <p className="text-sm text-gray-600 line-clamp-2" title={image.prompt}>
                {image.prompt}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(image.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img
              src={selectedImage.url}
              alt={selectedImage.prompt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <p className="text-sm mb-2">{selectedImage.prompt}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => handleDelete(selectedImage.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};