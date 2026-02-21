import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative animate-fade-in-down">
        <Link to="/" className="inline-flex items-center mb-6 group hover:opacity-90 transition">
          <Logo size="lg" />
        </Link>
        <h2 className="text-3xl font-black text-slate-100 font-display">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass-panel py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-800">
          {children}
        </div>
      </div>
    </div>
  );
}