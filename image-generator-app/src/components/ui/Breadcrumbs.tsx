import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-aigenr-gray mx-1" />
            )}
            
            {item.href && !item.current ? (
              <Link
                to={item.href}
                className="text-aigenr-gray hover:text-aigenr-orange transition-colors font-aigenr-medium"
              >
                {index === 0 ? (
                  <span className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </Link>
            ) : (
              <span 
                className={`${
                  item.current 
                    ? 'text-aigenr-dark font-aigenr-bold' 
                    : 'text-aigenr-gray font-aigenr-medium'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {index === 0 ? (
                  <span className="flex items-center gap-1">
                    <Home className="w-4 h-4" />
                    {item.label}
                  </span>
                ) : (
                  item.label
                )}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};