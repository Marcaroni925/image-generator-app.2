import React from 'react';
import { Heart, Eye, Download, Share2, MoreHorizontal } from 'lucide-react';

interface CommunityCardProps {
  image: string;
  title: string;
  username: string;
  avatar?: string;
  likes: number;
  views: number;
  timeAgo: string;
  onLike?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  image,
  title,
  username,
  avatar,
  likes,
  views,
  timeAgo,
  onLike,
  onDownload,
  onShare,
  className = ''
}) => {
  return (
    <div className={`bg-background-card rounded-xl shadow-arrow-card hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}>
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Download className="w-4 h-4 text-text-primary" />
            </button>
            <button
              onClick={onShare}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Share2 className="w-4 h-4 text-text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* User Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt={username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-primary-600">
                  {username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">{username}</p>
              <p className="text-xs text-text-muted">{timeAgo}</p>
            </div>
          </div>
          
          <button className="p-1 hover:bg-background-hover rounded transition-colors">
            <MoreHorizontal className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-text-primary mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onLike}
            className="flex items-center gap-1 text-text-subtle hover:text-red-500 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs">{likes}</span>
          </button>
          
          <div className="flex items-center gap-1 text-text-subtle">
            <Eye className="w-4 h-4" />
            <span className="text-xs">{views}</span>
          </div>
        </div>
      </div>
    </div>
  );
};