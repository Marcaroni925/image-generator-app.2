import React, { useState } from 'react';
import { Palette, Sparkles, Download, Share2, Heart, Star, ArrowRight, Users, Trophy, Clock } from 'lucide-react';

const EXAMPLE_IMAGES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    title: 'Magical Unicorn',
    category: 'Fantasy',
    difficulty: 'Easy'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    title: 'Beautiful Mandala',
    category: 'Patterns',
    difficulty: 'Advanced'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    title: 'Garden Flowers',
    category: 'Nature',
    difficulty: 'Medium'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    title: 'Space Adventure',
    category: 'Adventure',
    difficulty: 'Medium'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    title: 'Cute Animals',
    category: 'Animals',
    difficulty: 'Easy'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    title: 'Ocean World',
    category: 'Nature',
    difficulty: 'Medium'
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Parent of 3',
    content: 'My kids absolutely love the coloring pages we create! The quality is amazing and they print beautifully.',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Art Teacher',
    content: 'I use this for my classroom activities. The variety of styles and complexity levels is perfect for all ages.',
    rating: 5
  },
  {
    id: 3,
    name: 'Emma Davis',
    role: 'Therapist',
    content: 'These coloring pages are therapeutic and engaging. My clients find them incredibly relaxing.',
    rating: 5
  }
];

export const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  const openAuth = (mode: 'signup' | 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen">{/* Removed navigation - now handled by TopBar */}

      {/* Hero Section */}
      <section id="hero-section" className="relative overflow-hidden">
        <div className="p-6">
          {/* Main Hero Card */}
          <div className="bg-aigenr-container rounded-aigenr-2xl shadow-aigenr-card border-aigenr border-aigenr-dark p-12 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-aigenr-primary opacity-10"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="p-4 bg-aigenr-primary rounded-aigenr border-aigenr border-aigenr-dark shadow-aigenr-card">
                  <Palette className="w-8 h-8 text-aigenr-dark" />
                </div>
                <Sparkles className="w-6 h-6 text-aigenr-orange" />
              </div>
              
              <h1 className="text-aigenr-h1 font-aigenr-black text-aigenr-dark mb-6 leading-tight">
                Create Magical
                <span className="bg-aigenr-primary bg-clip-text text-transparent block">Coloring Pages</span>
                in Seconds
              </h1>
              
              <p className="text-aigenr-body text-aigenr-gray max-w-3xl mx-auto mb-8 leading-relaxed font-aigenr-light">
                Transform your imagination into beautiful, printable coloring pages with AI. 
                Perfect for kids, adults, teachers, and therapy sessions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button
                  onClick={() => openAuth('signup')}
                  className="bg-aigenr-primary text-aigenr-dark px-8 py-4 rounded-aigenr font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Creating Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => openAuth('signup')}
                  className="border-aigenr border-aigenr-dark text-aigenr-dark px-8 py-4 rounded-aigenr font-aigenr-bold hover:bg-aigenr-gray-light transition-all duration-200 shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  Join 50K+ Creators
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-aigenr-container rounded-aigenr p-4 shadow-aigenr-card border-aigenr border-aigenr-dark">
                  <div className="flex items-center justify-center gap-2 text-aigenr-orange">
                    <Users className="w-5 h-5" />
                    <span className="font-aigenr-bold">50K+</span>
                  </div>
                  <p className="text-sm text-aigenr-gray mt-1 font-aigenr-light">Active Users</p>
                </div>
                <div className="bg-aigenr-container rounded-aigenr p-4 shadow-aigenr-card border-aigenr border-aigenr-dark">
                  <div className="flex items-center justify-center gap-2 text-aigenr-orange">
                    <Trophy className="w-5 h-5" />
                    <span className="font-aigenr-bold">500K+</span>
                  </div>
                  <p className="text-sm text-aigenr-gray mt-1 font-aigenr-light">Pages Created</p>
                </div>
                <div className="bg-aigenr-container rounded-aigenr p-4 shadow-aigenr-card border-aigenr border-aigenr-dark">
                  <div className="flex items-center justify-center gap-2 text-aigenr-star">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-aigenr-bold text-aigenr-dark">4.9/5</span>
                  </div>
                  <p className="text-sm text-aigenr-gray mt-1 font-aigenr-light">User Rating</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-8 left-8 w-16 h-16 bg-aigenr-orange rounded-full opacity-20"></div>
            <div className="absolute bottom-8 right-8 w-24 h-24 bg-aigenr-orange-light rounded-full opacity-15"></div>
          </div>
        </div>
      </section>

      {/* Ad Placement - Top Banner */}
      <section className="bg-aigenr-gray-light border-y border-aigenr-dark">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-aigenr-container rounded-aigenr p-6 text-center border-2 border-dashed border-aigenr-dark shadow-aigenr-card">
            <p className="text-aigenr-gray font-aigenr-medium">Advertisement Space</p>
            <p className="text-sm text-aigenr-gray font-aigenr-light">728x90 Banner Ad</p>
          </div>
        </div>
      </section>

      {/* Example Gallery */}
      <section id="examples-section" className="py-16">
        <div className="px-6">
          {/* Section Header Card */}
          <div className="bg-aigenr-container rounded-aigenr p-8 shadow-aigenr-card border-aigenr border-aigenr-dark mb-8 text-center">
            <h2 className="text-aigenr-h2 font-aigenr-black text-aigenr-dark mb-4">
              Endless Creative Possibilities
            </h2>
            <p className="text-aigenr-body text-aigenr-gray max-w-2xl mx-auto font-aigenr-light">
              From simple designs for kids to intricate mandalas for adults - create any coloring page you can imagine
            </p>
          </div>

          {/* Gallery Card */}
          <div className="bg-aigenr-container rounded-aigenr p-8 shadow-aigenr-card border-aigenr border-aigenr-dark mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {EXAMPLE_IMAGES.map((image, index) => (
                <div key={image.id} className="bg-aigenr-gray-light rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 overflow-hidden">
                  <div className="aspect-square bg-aigenr-gray-light relative overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.title}
                      className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-aigenr-container rounded-aigenr border-aigenr border-aigenr-dark shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                          <Download className="w-4 h-4 text-aigenr-dark" />
                        </button>
                        <button className="p-2 bg-aigenr-container rounded-aigenr border-aigenr border-aigenr-dark shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                          <Share2 className="w-4 h-4 text-aigenr-dark" />
                        </button>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-aigenr-orange text-aigenr-dark px-2 py-1 rounded-aigenr text-xs font-aigenr-bold border-aigenr border-aigenr-dark">
                        {image.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-aigenr-container text-aigenr-dark px-2 py-1 rounded-aigenr text-xs font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-hard">
                        {image.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-aigenr-primary rounded-full flex items-center justify-center border-aigenr border-aigenr-dark">
                          <span className="text-xs font-aigenr-bold text-aigenr-dark">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-aigenr-medium text-aigenr-gray">Creator</p>
                          <p className="text-xs text-aigenr-gray font-aigenr-light">2 days ago</p>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-aigenr-bold text-aigenr-dark mb-2 line-clamp-2">{image.title}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-aigenr-gray">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs font-aigenr-light">{Math.floor(Math.random() * 100) + 10}</span>
                      </div>
                      <div className="flex items-center gap-1 text-aigenr-gray">
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-aigenr-light">{Math.floor(Math.random() * 500) + 50}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-aigenr-container rounded-aigenr p-8 shadow-aigenr-card border-aigenr border-aigenr-dark text-center">
            <button
              onClick={() => openAuth('signup')}
              className="inline-flex items-center gap-2 bg-aigenr-primary text-aigenr-dark px-8 py-4 rounded-aigenr font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              Create Your Own Now
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-16">
        <div className="px-6">
          {/* Features Container Card */}
          <div className="bg-aigenr-container rounded-aigenr p-8 shadow-aigenr-card border-aigenr border-aigenr-dark">
            <div className="text-center mb-12">
              <h2 className="text-aigenr-h2 font-aigenr-black text-aigenr-dark mb-4">
                Why Choose Our AI Creator?
              </h2>
              <p className="text-aigenr-body text-aigenr-gray font-aigenr-light">
                The most advanced and user-friendly coloring page generator
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-aigenr-gray-light p-6 rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                  <div className="w-16 h-16 bg-aigenr-primary rounded-aigenr flex items-center justify-center mx-auto mb-4 border-aigenr border-aigenr-dark">
                    <Clock className="w-8 h-8 text-aigenr-dark" />
                  </div>
                  <h3 className="text-xl font-aigenr-bold text-aigenr-dark mb-2">Instant Generation</h3>
                  <p className="text-aigenr-gray font-aigenr-light">Create professional-quality coloring pages in under 30 seconds</p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-aigenr-gray-light p-6 rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                  <div className="w-16 h-16 bg-aigenr-primary rounded-aigenr flex items-center justify-center mx-auto mb-4 border-aigenr border-aigenr-dark">
                    <Download className="w-8 h-8 text-aigenr-dark" />
                  </div>
                  <h3 className="text-xl font-aigenr-bold text-aigenr-dark mb-2">Print Ready</h3>
                  <p className="text-aigenr-gray font-aigenr-light">High-resolution images optimized for printing on any paper size</p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-aigenr-gray-light p-6 rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                  <div className="w-16 h-16 bg-aigenr-primary rounded-aigenr flex items-center justify-center mx-auto mb-4 border-aigenr border-aigenr-dark">
                    <Share2 className="w-8 h-8 text-aigenr-dark" />
                  </div>
                  <h3 className="text-xl font-aigenr-bold text-aigenr-dark mb-2">Easy Sharing</h3>
                  <p className="text-aigenr-gray font-aigenr-light">Share your creations with friends or save them to your personal gallery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Placement - Side Banner */}
      <section className="py-8 bg-aigenr-gray-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="bg-aigenr-container rounded-aigenr p-6 border-2 border-dashed border-aigenr-dark h-64 flex items-center justify-center shadow-aigenr-card">
                <div className="text-center">
                  <p className="text-aigenr-gray font-aigenr-medium">Advertisement Space</p>
                  <p className="text-sm text-aigenr-gray font-aigenr-light">300x250 Rectangle Ad</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-aigenr-container rounded-aigenr p-6 border-2 border-dashed border-aigenr-dark h-64 flex items-center justify-center shadow-aigenr-card">
                <div className="text-center">
                  <p className="text-aigenr-gray font-aigenr-medium">Advertisement Space</p>
                  <p className="text-sm text-aigenr-gray font-aigenr-light">300x250 Rectangle Ad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials-section" className="py-16">
        <div className="px-6">
          {/* Testimonials Container Card */}
          <div className="bg-aigenr-container rounded-aigenr p-8 shadow-aigenr-card border-aigenr border-aigenr-dark">
            <div className="text-center mb-12">
              <h2 className="text-aigenr-h2 font-aigenr-black text-aigenr-dark mb-4">
                Loved by Thousands
              </h2>
              <p className="text-aigenr-body text-aigenr-gray font-aigenr-light">
                Join our community of creative individuals worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial) => (
                <div key={testimonial.id} className="bg-aigenr-gray-light p-6 rounded-aigenr shadow-aigenr-card border-aigenr border-aigenr-dark hover:shadow-aigenr-hard hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-aigenr-star fill-current" />
                    ))}
                  </div>
                  <p className="text-aigenr-gray mb-4 italic font-aigenr-light">"{testimonial.content}"</p>
                  <div>
                    <p className="font-aigenr-bold text-aigenr-dark">{testimonial.name}</p>
                    <p className="text-sm text-aigenr-gray font-aigenr-light">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="px-6">
          <div className="bg-aigenr-primary text-aigenr-dark rounded-aigenr-2xl p-12 text-center shadow-aigenr-card border-aigenr border-aigenr-dark">
            <h2 className="text-aigenr-h2 font-aigenr-black mb-4">
              Ready to Create Your First Coloring Page?
            </h2>
            <p className="text-aigenr-body mb-8 opacity-90 font-aigenr-light">
              Join thousands of creators and start making beautiful coloring pages today
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openAuth('signup')}
                className="bg-aigenr-container text-aigenr-dark px-8 py-4 rounded-aigenr font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Start Creating Free
              </button>
              
              <button
                onClick={() => openAuth('signup')}
                className="border-aigenr border-aigenr-dark text-aigenr-dark px-8 py-4 rounded-aigenr font-aigenr-bold hover:bg-aigenr-container transition-all duration-200 shadow-aigenr-hard hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5"
              >
                Sign Up for Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-aigenr-container rounded-aigenr-lg p-6 w-full max-w-md border-aigenr border-aigenr-dark shadow-aigenr-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-aigenr-bold text-aigenr-dark">
                {authMode === 'signup' ? 'Sign Up' : 'Log In'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-aigenr-gray hover:text-aigenr-orange text-2xl font-aigenr-bold"
              >
                ×
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-aigenr-medium text-aigenr-dark mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border-aigenr border-aigenr-dark rounded-aigenr focus:outline-none focus:ring-2 focus:ring-aigenr-orange bg-aigenr-container font-aigenr-light"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-aigenr-medium text-aigenr-dark mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border-aigenr border-aigenr-dark rounded-aigenr focus:outline-none focus:ring-2 focus:ring-aigenr-orange bg-aigenr-container font-aigenr-light"
                  placeholder="Enter your password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-aigenr-primary text-aigenr-dark py-2 px-4 rounded-aigenr font-aigenr-bold border-aigenr border-aigenr-dark shadow-aigenr-button hover:shadow-aigenr-button-hover hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200"
              >
                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="text-aigenr-orange hover:text-aigenr-orange-hover font-aigenr-medium"
              >
                {authMode === 'signup' 
                  ? 'Already have an account? Log in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};