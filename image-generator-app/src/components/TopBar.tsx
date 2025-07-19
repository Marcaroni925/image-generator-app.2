import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, User, Settings, LogOut, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

interface TopBarProps {
  mode?: 'landing' | 'dashboard';
}

export const TopBar: React.FC<TopBarProps> = ({ mode = 'dashboard' }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <div className="h-16 bg-aigenr-container border-b border-aigenr-dark flex items-center px-6">
        {/* Left Section - Landing Info */}
        {mode === 'landing' && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-aigenr-primary border-aigenr border-aigenr-dark rounded-aigenr shadow-aigenr-hard">
              <span className="text-xs font-aigenr-bold text-aigenr-dark">PREVIEW</span>
            </div>
            <span className="text-sm text-aigenr-gray font-aigenr-light">Experience the full dashboard when you sign up</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Section - Always positioned in top right */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-aigenr-gray-light rounded-aigenr transition-colors relative"
            >
              <Bell className="w-5 h-5 text-aigenr-gray" />
              {/* Notification dot */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-aigenr-orange rounded-full"></div>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-aigenr-container rounded-aigenr-lg shadow-aigenr-card border-aigenr border-aigenr-dark z-50">
                <div className="p-4 border-b border-aigenr-dark">
                  <h3 className="font-aigenr-bold text-aigenr-dark">Notifications</h3>
                </div>
                <div className="p-4">
                  <div className="text-sm text-aigenr-gray text-center py-8 font-aigenr-light">
                    No new notifications
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-aigenr-gray-light rounded-aigenr transition-colors border-aigenr border-aigenr-dark shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <div className="w-8 h-8 bg-aigenr-primary rounded-full flex items-center justify-center border-aigenr border-aigenr-dark">
                <User className="w-4 h-4 text-aigenr-dark" />
              </div>
              <div className="text-left">
                <p className="text-sm font-aigenr-bold text-aigenr-dark">John Doe</p>
                <p className="text-xs text-aigenr-gray font-aigenr-light">john@example.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-aigenr-gray" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-aigenr-container rounded-aigenr-lg shadow-aigenr-card border-aigenr border-aigenr-dark z-50">
                <div className="p-2">
                  <Link 
                    to="/profile"
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-aigenr-gray-light rounded-aigenr transition-colors text-left"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4 text-aigenr-gray" />
                    <span className="text-sm text-aigenr-dark font-aigenr-medium">Account</span>
                  </Link>
                  <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-aigenr-gray-light rounded-aigenr transition-colors text-left">
                    <Settings className="w-4 h-4 text-aigenr-gray" />
                    <span className="text-sm text-aigenr-dark font-aigenr-medium">Settings</span>
                  </button>
                  <hr className="my-2 border-aigenr-dark" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-aigenr transition-colors text-left">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500 font-aigenr-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};