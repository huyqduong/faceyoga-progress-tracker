import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  Camera, 
  MessageCircle, 
  BookOpen, 
  Sparkles, 
  UserCircle, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/auth';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { path: '/progress', icon: Camera, label: 'Progress' },
  { path: '/coaching', icon: MessageCircle, label: 'AI Coach' },
  { path: '/resources', icon: BookOpen, label: 'Resources' },
];

function Navbar() {
  const location = useLocation();
  const { profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-mint-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-mint-500" />
            <span className="text-xl md:text-2xl font-bold text-mint-600 hidden sm:inline">
              Renew and Glow
            </span>
            <span className="text-xl font-bold text-mint-600 sm:hidden">
              R&G
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${location.pathname === path
                    ? 'text-mint-600 bg-mint-50'
                    : 'text-mint-500 hover:text-mint-600 hover:bg-mint-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            
            {/* Desktop Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-mint-100 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-mint-600" />
                  </div>
                )}
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-mint-50"
                      onClick={closeAllMenus}
                    >
                      <Settings className="w-4 h-4 inline-block mr-2" />
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-mint-50"
                    onClick={closeAllMenus}
                  >
                    <UserCircle className="w-4 h-4 inline-block mr-2" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4 inline-block mr-2" />
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-mint-500 hover:text-mint-600 hover:bg-mint-50"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-mint-100 py-2">
            <div className="space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors
                    ${location.pathname === path
                      ? 'text-mint-600 bg-mint-50'
                      : 'text-mint-500 hover:text-mint-600 hover:bg-mint-50'
                    }`}
                  onClick={closeAllMenus}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}

              <div className="border-t border-mint-100 pt-2 mt-2">
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-mint-50"
                    onClick={closeAllMenus}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-mint-50"
                  onClick={closeAllMenus}
                >
                  <UserCircle className="w-5 h-5" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;