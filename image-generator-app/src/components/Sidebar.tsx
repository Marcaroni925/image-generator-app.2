import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Palette, 
  BookOpen, 
  Settings, 
  HelpCircle, 
  Crown,
  Sparkles,
  Lock,
  Users,
  User
} from 'lucide-react';

// Type definitions for navigation items
interface DashboardNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

interface LandingNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: string;
  accessible: boolean;
  path?: string;
}

// Dashboard mode navigation
const dashboardNavigationItems: DashboardNavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'create', label: 'Create', icon: Palette, path: '/create' },
  { id: 'gallery', label: 'My Gallery', icon: BookOpen, path: '/gallery' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

// Landing mode navigation
const landingNavigationItems: LandingNavItem[] = [
  { 
    id: 'hero', 
    label: 'Home', 
    icon: Home, 
    action: 'scroll-to-hero',
    accessible: true 
  },
  { 
    id: 'create', 
    label: 'Create', 
    icon: Palette, 
    action: 'navigate',
    accessible: true,
    path: '/create'
  },
  { 
    id: 'gallery', 
    label: 'My Gallery', 
    icon: BookOpen, 
    action: 'navigate',
    accessible: true,
    path: '/gallery'
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User, 
    action: 'navigate',
    accessible: true,
    path: '/profile'
  }
];

const bottomItems: DashboardNavItem[] = [
  { id: 'help', label: 'Help', icon: HelpCircle, path: '/help' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

interface SidebarProps {
  mode?: 'landing' | 'dashboard';
}

export const Sidebar: React.FC<SidebarProps> = ({ mode = 'dashboard' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (item: LandingNavItem) => {
    if (mode === 'landing') {
      if (!item.accessible) {
        setShowAuthModal(true);
        return;
      }
      
      if (item.action === 'scroll-to-hero') {
        scrollToSection('hero-section');
      } else if (item.action === 'navigate' && item.path) {
        // Navigate to the specified path
        navigate(item.path);
      }
    }
  };

  const DashboardNavLink = ({ item }: { item: DashboardNavItem }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link
        to={item.path}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-aigenr text-sm font-aigenr-medium transition-all duration-200
          ${isActive 
            ? 'bg-aigenr-dark text-aigenr-container border-aigenr border-aigenr-dark' 
            : 'text-aigenr-gray hover:text-aigenr-orange hover:bg-aigenr-gray-light'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        {item.label}
      </Link>
    );
  };

  const LandingNavLink = ({ item }: { item: LandingNavItem }) => {
    const Icon = item.icon;
    const isLocked = !item.accessible;

    return (
      <button
        onClick={() => handleNavClick(item)}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-aigenr text-sm font-aigenr-medium transition-all duration-200 text-left
          ${isLocked 
            ? 'text-aigenr-gray opacity-60 cursor-pointer hover:opacity-80' 
            : 'text-aigenr-gray hover:text-aigenr-orange hover:bg-aigenr-gray-light'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        {item.label}
        {isLocked && <Lock className="w-4 h-4 ml-auto text-aigenr-gray" />}
      </button>
    );
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-64 bg-aigenr-container border-r border-aigenr-dark z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-aigenr-dark">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-aigenr-primary rounded-aigenr border-aigenr border-aigenr-dark shadow-aigenr-card">
                <Palette className="w-6 h-6 text-aigenr-dark" />
              </div>
              <div>
                <h1 className="text-aigenr-h3 font-aigenr-bold text-aigenr-dark">
                  Coloring Creator
                </h1>
                <p className="text-xs text-aigenr-gray font-aigenr-medium">
                  {mode === 'landing' ? 'Preview Dashboard' : 'AI-powered coloring pages'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-1">
              {mode === 'dashboard' ? (
                dashboardNavigationItems.map((item) => (
                  <DashboardNavLink key={item.id} item={item} />
                ))
              ) : (
                landingNavigationItems.map((item) => (
                  <LandingNavLink key={item.id} item={item} />
                ))
              )}
            </nav>
            
            {/* Upgrade/Get Started Section */}
            <div className="mt-8 p-4 bg-aigenr-container border-aigenr border-aigenr-dark rounded-aigenr-lg shadow-aigenr-card">
              {mode === 'landing' ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-aigenr-orange" />
                    <h3 className="font-aigenr-bold text-aigenr-dark">Get Started</h3>
                  </div>
                  <p className="text-sm text-aigenr-gray mb-3 font-aigenr-light">
                    Sign up to unlock all features and start creating amazing coloring pages
                  </p>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-aigenr-primary text-aigenr-dark py-3 px-4 rounded-aigenr text-sm font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      Join 50K+ Users
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-aigenr-orange" />
                    <h3 className="font-aigenr-bold text-aigenr-dark">Go Pro</h3>
                  </div>
                  <p className="text-sm text-aigenr-gray mb-3 font-aigenr-light">
                    Unlock unlimited generations and premium features
                  </p>
                  <button className="w-full bg-aigenr-primary text-aigenr-dark py-3 px-4 rounded-aigenr text-sm font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Upgrade Now
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          {mode === 'dashboard' && (
            <div className="p-4 border-t border-aigenr-dark">
              <nav className="space-y-1">
                {bottomItems.map((item) => (
                  <DashboardNavLink key={item.id} item={item} />
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal for Landing Mode */}
      {mode === 'landing' && showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-aigenr-container border-aigenr border-aigenr-dark rounded-aigenr-lg p-6 w-full max-w-md shadow-aigenr-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-aigenr-bold text-aigenr-dark">
                Sign Up to Continue
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-aigenr-gray hover:text-aigenr-orange text-2xl font-aigenr-bold"
              >
                ×
              </button>
            </div>
            
            <p className="text-aigenr-gray mb-6 font-aigenr-light">
              Create an account to access the full coloring page creator and save your creations.
            </p>

            <div className="space-y-3">
              <button className="w-full bg-aigenr-primary text-aigenr-dark py-3 px-4 rounded-aigenr font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                Sign Up Free
              </button>
              <button className="w-full border-aigenr border-aigenr-dark text-aigenr-dark py-3 px-4 rounded-aigenr font-aigenr-bold hover:bg-aigenr-gray-light transition-all duration-200">
                Already have an account? Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};