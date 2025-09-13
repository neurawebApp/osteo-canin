// src/components/Layout.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { 
  HeartIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  Bars3Icon, 
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { actualTheme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-blue-100 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <HeartIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">PawCare Osteopathy</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/services" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/services') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Services
                </Link>
                <Link 
                  to="/about" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/about') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/blog" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/blog') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Blog
                </Link>
                <Link 
                  to="/contact" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/contact') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Contact
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  aria-label="Toggle theme"
                >
                  {actualTheme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                </button>
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link to="/booking">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                      Book Now
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                  aria-label="Toggle theme"
                >
                  {actualTheme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
                >
                  {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-slate-800 border-t border-blue-100 dark:border-slate-700">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              <Link to="/services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium">
                Services
              </Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium">
                About
              </Link>
              <Link to="/blog" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium">
                Blog
              </Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium">
                Contact
              </Link>
              <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 rounded-md text-base font-medium">
                Dashboard
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="block px-3 py-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/booking" className="block px-3 py-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                    Book Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <HeartIcon className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">PawCare Osteopathy</span>
              </div>
              <p className="text-gray-300 dark:text-gray-400 mb-4">
                Professional canine osteopathy services dedicated to improving your dog's health and well-being through gentle, effective treatments.
              </p>
              <div className="flex space-x-4">
                <div className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-blue-400 cursor-pointer transition-colors">📘</div>
                <div className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-blue-400 cursor-pointer transition-colors">📷</div>
                <div className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-blue-400 cursor-pointer transition-colors">🐦</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/services" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/about" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/blog" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="text-gray-300 dark:text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 dark:text-gray-400">(555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 dark:text-gray-400">info@pawcareosteo.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 dark:text-gray-400">123 Wellness St, Pet City</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 dark:text-gray-500">
              © 2025 PawCare Osteopathy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;