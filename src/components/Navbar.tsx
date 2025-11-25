import { Menu, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { callNumber } from '@/lib/constants';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-gray-900/95 backdrop-blur-md shadow-md'
            : 'bg-gray-900'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand/Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="text-lg font-bold text-gray-200">
                  Anyimadu Suites
                </div>
                <div className="text-xs text-gray-400">
                  Relaxation & Natural Serenity
                </div>
              </div>
            </Link>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Book Now Button */}
              {location.pathname !== '/suites' && (
                <Link to="/suites">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 text-sm font-medium">
                    Find Suites
                  </Button>
                </Link>
              )}

              {/* Contact Info */}
              <div className="text-right border-l border-gray-600 pl-4">
                <p className="text-sm text-primary">
                  <Phone className="inline-block mr-0.5 w-4 h-4" /> Call Us
                </p>
                <p className="text-base font-medium text-white">{callNumber}</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="text-white" size={24} />
              ) : (
                <Menu className="text-white" size={24} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 bg-gray-800 rounded-lg shadow-lg mt-2">
              <Link
                to="/suites"
                className={`block px-4 py-3 text-base font-medium transition-colors hover:bg-gray-700 ${
                  location.pathname === '/suites'
                    ? 'text-white'
                    : 'text-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Our Suites
              </Link>
              <Link
                to="/contact"
                className={`block px-4 py-3 text-base font-medium transition-colors hover:bg-gray-700 ${
                  location.pathname === '/contact'
                    ? 'text-white'
                    : 'text-gray-300'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact us
              </Link>
              <div className="px-4 py-3 border-t border-gray-700 mt-2">
                <Link to="/suites">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-3">
                    Find Suites
                  </Button>
                </Link>

                <div className="flex items-center justify-between my-4">
                  <span className="text-gray-300">Call us:</span>
                  <span className="text-white">{callNumber}</span>
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className="bg-white text-center text-xl font-bold py-1 block md:hidden">
          <Phone className="inline-block mr-1 w-5 h-5" />
          {callNumber}
        </div>
      </header>
      <div className="h-20 md:h-16" />
    </>
  );
}
