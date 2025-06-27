import { Link, useLocation } from "wouter";
import { Sparkles, Bell, User } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 glow-gradient rounded-full flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">GlowAI</h1>
              <p className="text-xs text-gray-600">Your AI Skincare Companion</p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className={`transition-colors ${
                isActive('/dashboard') 
                  ? 'text-glow-pink font-medium' 
                  : 'text-gray-700 hover:text-glow-pink'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/tips" 
              className={`transition-colors ${
                isActive('/tips') 
                  ? 'text-glow-pink font-medium' 
                  : 'text-gray-700 hover:text-glow-pink'
              }`}
            >
              Daily Tips
            </Link>
            <Link 
              href="/products" 
              className={`transition-colors ${
                isActive('/products') 
                  ? 'text-glow-pink font-medium' 
                  : 'text-gray-700 hover:text-glow-pink'
              }`}
            >
              Products
            </Link>
            <Link 
              href="/routine" 
              className={`transition-colors ${
                isActive('/routine') 
                  ? 'text-glow-pink font-medium' 
                  : 'text-gray-700 hover:text-glow-pink'
              }`}
            >
              My Routine
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-glow-pink transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 glow-gradient rounded-full flex items-center justify-center">
              <User className="text-white w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
