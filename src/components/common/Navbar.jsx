import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { AuthContext } from '../../context/AuthContext';

const NAV_SECTIONS = [
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'Features', id: 'features' },
  { label: 'Who It\'s For', id: 'who-its-for' },
  { label: 'Use Cases', id: 'use-cases' },
  { label: 'FAQ', id: 'faq' },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    setMobileOpen(false);
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="glass-panel border-b border-slate-700/80 shadow-lg shadow-slate-950/40">
        <div className="w-full px-6 sm:px-10 lg:px-14">
          <div className="flex justify-between h-20 items-center">
            {/* Logo — flush left */}
            <Link to="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
              <Logo size="md" />
            </Link>

            {/* Desktop section links — centered */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_SECTIONS.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="px-4 py-2.5 text-[15px] font-semibold text-slate-400 hover:text-teal-300 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Right side — flush right */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to={user.is_admin ? '/admin' : '/dashboard'}
                    className="flex items-center gap-2.5 text-slate-300 hover:text-white font-semibold transition text-[15px]"
                  >
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt="" className="w-9 h-9 rounded-full ring-2 ring-teal-500/40" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal-500/20 flex items-center justify-center text-sm font-bold text-teal-300">
                        {(user.full_name || user.username || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline">{user.full_name || user.username}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-slate-400 hover:text-rose-400 transition p-2.5 rounded-xl hover:bg-slate-800"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:inline-block text-[15px] text-slate-300 hover:text-white font-bold transition">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-teal-500 text-slate-900 px-7 py-2.5 rounded-xl text-[15px] font-bold hover:bg-teal-400 transition shadow-lg shadow-teal-900/40 hover:shadow-teal-800/50"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden glass-panel border-b border-slate-800 shadow-lg animate-fade-in-down">
          <div className="px-6 py-4 space-y-1">
            {NAV_SECTIONS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full text-left px-4 py-3 text-base font-semibold text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-xl transition"
              >
                {label}
              </button>
            ))}
            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block sm:hidden w-full text-left px-4 py-3 text-base font-semibold text-slate-300 hover:text-teal-300 hover:bg-slate-800/60 rounded-xl transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="h-1 bg-gradient-to-r from-teal-500 via-sky-400 to-indigo-400" />
    </nav>
  );
}