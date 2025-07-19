import React from 'react';
import { Download, Share2, Trash2, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { GeneratedImage } from '../../types';

export interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  image: GeneratedImage | null;
  onDownload?: (image: GeneratedImage) => void;
  onShare?: (image: GeneratedImage) => void;
  onDelete?: (image: GeneratedImage) => void;
  showActions?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  onClose,
  image,
  onDownload,
  onShare,
  onDelete,
  showActions = true,
}) => {
  if (!image) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload(image);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `coloring-page-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(image);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: 'Check out this coloring page!',
          text: `Created with AI: ${image.prompt}`,
          url: image.url,
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(image.url);
      }
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(image);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* Image */}
        <div className="relative">
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-dark-700 rounded-lg"
          />
          
          {/* Close button overlay */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
            title="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Details */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
            Coloring Page
          </h3>
          <p className="text-gray-600 dark:text-dark-300">
            <span className="font-medium">Prompt:</span> {image.prompt}
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-400">
            Created on {new Date(image.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t dark:border-dark-600">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
            
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};