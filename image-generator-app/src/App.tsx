import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LandingPage } from './pages/LandingPage';
import { GenerationPage } from './pages/GenerationPage';
import { GalleryPage } from './pages/GalleryPage';
import { Breadcrumbs } from './components/ui/Breadcrumbs';
import { useBreadcrumbs } from './hooks/useBreadcrumbs';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { useGalleryStore } from './store/imageStore';
import { useEffect } from 'react';

function AppContent() {
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs();
  const { user, isAuthenticated, initialized } = useAuth();
  const { loadUserGallery, migrateAnonymousImages } = useGalleryStore();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  // Load user gallery when authenticated
  useEffect(() => {
    if (isAuthenticated && user && initialized) {
      loadUserGallery(user.uid);
    }
  }, [isAuthenticated, user, initialized, loadUserGallery]);

  // Migrate anonymous images when user signs in
  useEffect(() => {
    if (isAuthenticated && user && initialized) {
      const hasAnonymousImages = localStorage.getItem('gallery-storage');
      if (hasAnonymousImages) {
        migrateAnonymousImages(user.uid);
      }
    }
  }, [isAuthenticated, user, initialized, migrateAnonymousImages]);

  // Auth pages have different layout
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-aigenr-page font-aigenr">
        <Routes>
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <RegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPasswordPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    );
  }

  // Unified dashboard layout with Aigenr styling
  return (
    <div className="min-h-screen bg-aigenr-page font-aigenr p-4">
      <div className="bg-aigenr-container border-aigenr border-aigenr-dark rounded-aigenr-2xl shadow-aigenr-container min-h-[calc(100vh-2rem)]">
        <div className="flex">
          <Sidebar mode={isLandingPage ? 'landing' : 'dashboard'} />
          
          <div className="flex-1 ml-64">
            <TopBar mode={isLandingPage ? 'landing' : 'dashboard'} />
            
            {/* Breadcrumbs - only for internal pages */}
            {!isLandingPage && (
              <div className="bg-aigenr-container border-b border-aigenr-dark px-6 py-3">
                <Breadcrumbs items={breadcrumbs} />
              </div>
            )}
            
            {/* Main Content */}
            <main className={isLandingPage ? "p-0" : "p-6"}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/create" element={<GenerationPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/profile" element={
                  <ProtectedRoute requireAuth={true}>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;