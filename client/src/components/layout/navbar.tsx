import { Link, useLocation } from "wouter";
import { Sparkles, Bell, User, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Add scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <nav className={`bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50 transition-all duration-200 ${
      isScrolled ? 'py-2' : 'py-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 glow-gradient rounded-full flex items-center justify-center">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">GlowAI</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Your AI Skincare Companion</p>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/dashboard" isActive={isActive('/dashboard')}>
              Dashboard
            </NavLink>
            <NavLink href="/tips" isActive={isActive('/tips')}>
              Daily Tips
            </NavLink>
            <NavLink href="/products" isActive={isActive('/products')}>
              Products
            </NavLink>
            <NavLink href="/blog" isActive={isActive('/blog')}>
              Blog
            </NavLink>
            <NavLink href="/routine" isActive={isActive('/routine')}>
              My Routine
            </NavLink>
            <NavLink href="/social" isActive={isActive('/social')}>
              Social
            </NavLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-glow-pink focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop Profile/Actions */}
          <div className="hidden md:flex items-center space-x-4" ref={notificationRef}>
            <button 
              className="p-2 text-gray-600 hover:text-glow-pink transition-colors relative"
              aria-label="Notifications"
              onClick={() => setShowNotifications((v) => !v)}
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge example */}
              {/* <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1">3</span> */}
            </button>
            {showNotifications && (
              <div className="absolute right-12 mt-12 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in-up">
                <div className="p-4 border-b font-semibold text-gray-700">Notifications</div>
                <div className="p-4 text-gray-500 text-sm">No new notifications.</div>
              </div>
            )}
            <Link 
              href="/profile" 
              className="w-8 h-8 glow-gradient rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
              aria-label="Profile"
            >
              <User className="text-white w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 mt-2 py-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavLink href="/dashboard" isActive={isActive('/dashboard')}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/tips" isActive={isActive('/tips')}>
                Daily Tips
              </MobileNavLink>
              <MobileNavLink href="/products" isActive={isActive('/products')}>
                Products
              </MobileNavLink>
              <MobileNavLink href="/blog" isActive={isActive('/blog')}>
                Blog
              </MobileNavLink>
              <MobileNavLink href="/routine" isActive={isActive('/routine')}>
                My Routine
              </MobileNavLink>
              <MobileNavLink href="/social" isActive={isActive('/social')}>
                Social
              </MobileNavLink>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <Link 
                  href="/profile"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-glow-pink hover:bg-gray-50 rounded-md"
                >
                  <User className="h-5 w-5 mr-3 text-gray-500" />
                  Profile
                </Link>
                <button 
                  className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-glow-pink hover:bg-gray-50 rounded-md"
                  onClick={() => alert('No new notifications.')}
                >
                  <Bell className="h-5 w-5 mr-3 text-gray-500" />
                  Notifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Reusable NavLink component for desktop
function NavLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'text-glow-pink font-semibold'
          : 'text-gray-700 hover:text-glow-pink hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

// Reusable MobileNavLink component
function MobileNavLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? 'bg-gray-50 text-glow-pink font-semibold'
          : 'text-gray-700 hover:bg-gray-50 hover:text-glow-pink'
      }`}
    >
      {children}
    </Link>
  );
}
