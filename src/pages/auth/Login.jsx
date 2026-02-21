import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Sparkles, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/common/Logo';

export default function Login() {
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for redirect param from shared quiz links
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  const getPostLoginPath = (user) => {
    if (redirectPath) return redirectPath;
    if (user.is_admin || user.is_mentor) return '/admin';
    return '/dashboard';
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setIsBusy(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      const user = await login(params);
      navigate(getPostLoginPath(user));
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsBusy(true);
    setError('');
    try {
      const user = await googleLogin(credentialResponse.credential);
      if (!user.profile_completed && !user.is_admin && !user.is_mentor) {
        navigate('/complete-profile');
      } else {
        navigate(getPostLoginPath(user));
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.detail || 'Google authentication failed. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative animate-fade-in-down">
        <Link to="/" className="inline-flex items-center mb-6 group hover:opacity-90 transition">
          <Logo size="lg" />
        </Link>
        <h2 className="text-3xl font-black text-slate-100 font-display">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-400">Sign in to continue</p>
      </div>

      {/* Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass-panel py-10 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-800">
          
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-2xl text-sm font-medium animate-fade-in flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username/Password Form */}
          <form onSubmit={handleLocalLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-900 text-slate-400">or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <div className="flex flex-col items-center space-y-6">
            {isBusy ? (
              <div className="flex items-center gap-3 text-slate-300 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                <span className="text-sm font-medium">Signing you in...</span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="signin_with"
                  width="320"
                />
              </div>
            )}

            {/* Info badges */}
            <div className="w-full space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Students</p>
                  <p className="text-xs text-slate-500">Sign in with Google or username/password</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Admins</p>
                  <p className="text-xs text-slate-500">Use admin login page for admin access</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-sm text-slate-400">Don't have an account? </span>
            <Link to="/register" className="text-sm font-bold text-teal-300 hover:text-teal-200 transition">Sign up</Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}