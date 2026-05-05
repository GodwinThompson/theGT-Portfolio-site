import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Menu, X, LogIn, LogOut, PlusCircle, Moon, Sun } from 'lucide-react';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogin = async () => {
    await authService.loginWithGoogle();
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const isAdmin = authService.isAdmin(user);

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex flex-col">
            <span className="serif text-2xl font-bold tracking-tight">theGT</span>
            <span className="mono text-[10px] uppercase tracking-widest opacity-60 -mt-1">Portfolio</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-brand-accent transition-colors">Home</Link>
            <Link to="/contact" className="text-sm font-medium hover:text-brand-accent transition-colors">Contact</Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 text-sm font-semibold text-brand-accent hover:opacity-80 transition-opacity">
                <PlusCircle size={18} />
                Upload
              </Link>
            )}
            
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-brand-ink/5 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs mono opacity-60">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 bg-brand-ink text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-brand-accent transition-all"
              >
                <LogIn size={18} />
                Admin Log In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-brand-ink/5 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-brand-ink"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-bg border-b border-brand-ink/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 text-lg font-medium">Home</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block py-2 text-lg font-medium">Contact</Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block py-2 text-lg font-semibold text-brand-accent">
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-4 border-t border-brand-ink/10">
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 text-red-600 font-medium"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 bg-brand-ink text-white w-full justify-center py-3 rounded-xl font-medium"
                  >
                    <LogIn size={20} />
                    Admin Log In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
