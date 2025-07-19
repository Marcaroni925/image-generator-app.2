import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Palette, BookOpen, Paintbrush, User, LogIn, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useGalleryStore } from '../store/imageStore';
import { ThemeToggle } from './ui/ThemeToggle';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { savedImages } = useGalleryStore();
  const galleryCount = savedImages.length;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Mock user state - in real app this would come from auth context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Palette,
      description: 'Back to home page'
    },
    {
      path: '/create',
      label: 'Create',
      icon: Paintbrush,
      description: 'Create coloring pages'
    },
    {
      path: '/gallery',
      label: 'My Collection',
      icon: BookOpen,
      description: 'View saved coloring pages',
      badge: galleryCount > 0 ? galleryCount : undefined
    }
  ];

  return (
    <header className="bg-background-white shadow-sm border-b border-border-default sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Palette className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Coloring Book Creator
              </h1>
              <p className="text-xs text-text-muted">
                Create beautiful coloring pages to print and enjoy
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-lg
                      transition-all duration-200 font-medium focus:outline-none
                      focus:ring-2 focus:ring-border-focus focus:ring-offset-2
                      ${isActive 
                        ? 'bg-primary-50 text-primary-600 font-semibold' 
                        : 'text-text-muted hover:text-text-primary hover:bg-background-hover'
                      }
                    `}
                    title={item.description}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.badge ? `${item.label} (${item.badge} items)` : item.label}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{item.label}</span>
                    
                    {/* Badge for gallery count */}
                    {item.badge && (
                      <span 
                        className="
                          absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto
                          bg-primary-600 text-white text-xs font-semibold
                          rounded-full min-w-[20px] h-5 px-1.5
                          flex items-center justify-center
                        "
                        aria-label={`${item.badge} saved images`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle and Auth */}
            <div className="flex items-center gap-2 ml-4 border-l pl-4 border-border-default">
              <ThemeToggle />
              
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-text-muted hover:text-text-primary hover:bg-background-hover rounded-lg transition-all duration-200 border border-border-default"
                    title="Log in to your account"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Log In</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-primary text-white hover:bg-gradient-primary-hover rounded-lg transition-all duration-200 shadow-arrow-button hover:shadow-arrow-button-hover"
                    title="Create a new account"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </button>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors dark:text-dark-300 dark:hover:text-dark-100 dark:hover:bg-dark-800"
                    title="User menu"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:inline">{user?.name || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 dark:bg-dark-800 dark:border-dark-600">
                      <div className="px-4 py-3 border-b dark:border-dark-600">
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
                          {user?.name || 'John Doe'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            // TODO: Navigate to profile page
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-dark-200 dark:hover:bg-dark-700"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            // TODO: Navigate to settings page
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-dark-200 dark:hover:bg-dark-700"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        
                        <hr className="my-1 dark:border-dark-600" />
                        
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setIsLoggedIn(false);
                            setUser(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {authMode === 'signup' ? 'Sign Up' : 'Log In'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="text-green-600 hover:text-green-700"
              >
                {authMode === 'signup' 
                  ? 'Already have an account? Log in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};