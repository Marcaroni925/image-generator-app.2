import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { BreadcrumbItem } from '../components/ui/Breadcrumbs';

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const items: BreadcrumbItem[] = [
      {
        label: 'Home',
        href: '/',
        current: location.pathname === '/'
      }
    ];

    if (location.pathname === '/') {
      return items;
    }

    // Build breadcrumbs based on path segments
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const isLast = index === pathSegments.length - 1;
      
      let label = segment;
      
      // Convert segment to readable label
      switch (segment) {
        case 'create':
          label = 'Create Coloring Page';
          break;
        case 'gallery':
          label = 'My Collection';
          break;
        case 'profile':
          label = 'Profile';
          break;
        case 'settings':
          label = 'Settings';
          break;
        default:
          // Capitalize first letter and replace dashes with spaces
          label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }
      
      items.push({
        label,
        href: isLast ? undefined : href,
        current: isLast
      });
    });

    return items;
  }, [location.pathname]);

  return breadcrumbs;
};