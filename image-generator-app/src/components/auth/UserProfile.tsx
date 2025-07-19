import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Camera, 
  Settings, 
  Image, 
  Calendar, 
  LogOut,
  Loader2,
  Save,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UpdateProfileFormData, UserMetadata } from '../../types/auth';

const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address')
});

const UserProfile: React.FC = () => {
  const { user, updateProfile, updateUserMetadata, signOut, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'stats'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || ''
    }
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      setIsSaving(true);
      clearError();
      await updateProfile(data);
      reset(data);
    } catch (error) {
      // Error is handled by the auth store
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeToggle = async () => {
    if (!user) return;
    
    const newTheme = user.metadata.theme === 'light' ? 'dark' : 'light';
    try {
      await updateUserMetadata({
        ...user.metadata,
        theme: newTheme
      });
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  const handlePreferenceChange = async (key: keyof UserMetadata['preferences'], value: boolean) => {
    if (!user) return;
    
    try {
      await updateUserMetadata({
        ...user.metadata,
        preferences: {
          ...user.metadata.preferences,
          [key]: value
        }
      });
    } catch (error) {
      // Error is handled by the auth store
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
      } catch (error) {
        // Error is handled by the auth store
      }
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="bg-aigenr-container rounded-aigenr p-8 shadow-aigenr-card border-aigenr border-aigenr-dark text-center">
          <Loader2 className="h-8 w-8 animate-spin text-aigenr-orange mx-auto mb-4" />
          <p className="text-aigenr-gray font-aigenr-light">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-aigenr-container rounded-aigenr p-6 shadow-aigenr-card border-aigenr border-aigenr-dark">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-aigenr-primary rounded-aigenr border-aigenr border-aigenr-dark">
            <User className="w-6 h-6 text-aigenr-dark" />
          </div>
          <div>
            <h1 className="text-aigenr-h3 font-aigenr-black text-aigenr-dark">
              My Profile
            </h1>
            <p className="text-aigenr-gray text-sm font-aigenr-light">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-aigenr-container rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-aigenr-primary px-6 py-8 relative">
          <div className="absolute inset-0 bg-aigenr-primary opacity-90"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-20 w-20 rounded-aigenr border-aigenr border-aigenr-dark shadow-aigenr-card"
                />
              ) : (
                <div className="h-20 w-20 rounded-aigenr bg-aigenr-container border-aigenr border-aigenr-dark shadow-aigenr-card flex items-center justify-center">
                  <User className="h-8 w-8 text-aigenr-gray" />
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 bg-aigenr-container rounded-full p-2 shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                <Camera className="h-4 w-4 text-aigenr-gray" />
              </button>
            </div>
            <div className="text-aigenr-dark">
              <h1 className="text-2xl font-aigenr-black">{user.displayName || 'Anonymous User'}</h1>
              <p className="text-aigenr-gray font-aigenr-medium">{user.email}</p>
              <p className="text-sm text-aigenr-gray font-aigenr-light">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-aigenr-dark">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'preferences', label: 'Preferences', icon: Settings },
              { id: 'stats', label: 'Statistics', icon: Image }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-4 px-2 border-b-2 font-aigenr-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                  activeTab === id
                    ? 'border-aigenr-orange text-aigenr-dark'
                    : 'border-transparent text-aigenr-gray hover:text-aigenr-orange'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-aigenr shadow-aigenr-card">
              <p className="text-sm text-red-600 font-aigenr-medium">{error}</p>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-aigenr-bold text-aigenr-dark mb-4">
                Profile Information
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-aigenr-medium text-aigenr-dark mb-2">
                    Display Name
                  </label>
                  <input
                    {...register('displayName')}
                    type="text"
                    id="displayName"
                    className="w-full px-3 py-2 border-aigenr border-aigenr-dark rounded-aigenr bg-aigenr-container placeholder-aigenr-gray focus:outline-none focus:ring-2 focus:ring-aigenr-orange focus:border-aigenr-orange transition-all duration-200 text-aigenr-dark font-aigenr-light"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600 font-aigenr-medium">{errors.displayName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-aigenr-medium text-aigenr-dark mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    disabled
                    className="w-full px-3 py-2 border-aigenr border-aigenr-dark rounded-aigenr bg-aigenr-gray-light text-aigenr-gray cursor-not-allowed font-aigenr-light"
                  />
                  <p className="mt-1 text-sm text-aigenr-gray font-aigenr-light">
                    Email changes are not supported yet
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-aigenr-primary text-aigenr-dark rounded-aigenr font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 border-aigenr border-aigenr-dark rounded-aigenr text-aigenr-dark bg-aigenr-container hover:bg-aigenr-gray-light transition-all duration-200 font-aigenr-bold shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg font-aigenr-bold text-aigenr-dark mb-4">
                Preferences
              </h2>
              
              <div className="space-y-6">
                <div className="bg-aigenr-gray-light rounded-aigenr p-4 shadow-aigenr-card border-aigenr border-aigenr-dark">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.metadata.theme === 'light' ? (
                        <Sun className="h-5 w-5 text-aigenr-orange" />
                      ) : (
                        <Moon className="h-5 w-5 text-aigenr-orange" />
                      )}
                      <div>
                        <p className="text-sm font-aigenr-medium text-aigenr-dark">Theme</p>
                        <p className="text-xs text-aigenr-gray font-aigenr-light">
                          Choose between light and dark mode
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleThemeToggle}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-aigenr-orange focus:ring-offset-2 ${
                        user.metadata.theme === 'dark' ? 'bg-aigenr-orange' : 'bg-aigenr-gray'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-aigenr-container shadow ring-0 transition duration-200 ease-in-out ${
                          user.metadata.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {[
                  {
                    key: 'generateOnEnter' as const,
                    label: 'Generate on Enter',
                    description: 'Generate images when pressing Enter key'
                  },
                  {
                    key: 'autoSaveImages' as const,
                    label: 'Auto-save Images',
                    description: 'Automatically save generated images to your gallery'
                  },
                  {
                    key: 'showAdvancedOptions' as const,
                    label: 'Show Advanced Options',
                    description: 'Display advanced generation settings'
                  }
                ].map(({ key, label, description }) => (
                  <div key={key} className="bg-aigenr-gray-light rounded-aigenr p-4 shadow-aigenr-card border-aigenr border-aigenr-dark">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-aigenr-medium text-aigenr-dark">{label}</p>
                        <p className="text-xs text-aigenr-gray font-aigenr-light">{description}</p>
                      </div>
                      <button
                        onClick={() => handlePreferenceChange(key, !user.metadata.preferences[key])}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-aigenr-orange focus:ring-offset-2 ${
                          user.metadata.preferences[key] ? 'bg-aigenr-orange' : 'bg-aigenr-gray'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-aigenr-container shadow ring-0 transition duration-200 ease-in-out ${
                            user.metadata.preferences[key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-lg font-aigenr-bold text-aigenr-dark mb-4">
                Statistics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-aigenr-gray-light rounded-aigenr p-6 shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-aigenr-primary rounded-aigenr border-aigenr border-aigenr-dark">
                      <Image className="h-6 w-6 text-aigenr-dark" />
                    </div>
                    <div>
                      <p className="text-2xl font-aigenr-black text-aigenr-dark">
                        {user.metadata.stats.imagesGenerated}
                      </p>
                      <p className="text-sm text-aigenr-gray font-aigenr-light">Images Generated</p>
                    </div>
                  </div>
                </div>

                <div className="bg-aigenr-gray-light rounded-aigenr p-6 shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-aigenr-orange rounded-aigenr border-aigenr border-aigenr-dark">
                      <Calendar className="h-6 w-6 text-aigenr-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-aigenr-medium text-aigenr-dark">
                        {formatDate(user.metadata.stats.lastGeneratedAt)}
                      </p>
                      <p className="text-sm text-aigenr-gray font-aigenr-light">Last Generated</p>
                    </div>
                  </div>
                </div>

                <div className="bg-aigenr-gray-light rounded-aigenr p-6 shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-aigenr-star rounded-aigenr border-aigenr border-aigenr-dark">
                      <User className="h-6 w-6 text-aigenr-dark" />
                    </div>
                    <div>
                      <p className="text-sm font-aigenr-medium text-aigenr-dark">
                        {formatDate(user.lastLoginAt)}
                      </p>
                      <p className="text-sm text-aigenr-gray font-aigenr-light">Last Login</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;