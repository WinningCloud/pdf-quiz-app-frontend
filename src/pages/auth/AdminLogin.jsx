import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Loader2, AlertTriangle, BookOpen, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

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
      if (user.is_admin || user.is_mentor) {
        navigate('/admin');
      } else {
        setError('Access Denied: This account does not have admin or mentor privileges.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
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
      if (user.is_admin || user.is_mentor) {
        navigate('/admin');
      } else {
        setError('Access Denied: Your email is not authorized for admin or mentor access.');
      }
    } catch (err) {
      console.error('Admin Google login error:', err);
      setError(err.response?.data?.detail || 'Authentication failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed.');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 animate-fade-in-up">
        <div className="bg-slate-900 p-8 text-center text-white border-b border-slate-800">
          <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4">
            <ShieldCheck className="w-8 h-8 text-teal-300" />
          </div>
          <h1 className="text-2xl font-bold font-display">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Authorized Access Only</p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-2xl text-sm font-medium animate-fade-in flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username/Password Form */}
          <form onSubmit={handleLocalLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin password"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition pr-12"
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
                  Verifying...
                </>
              ) : (
                'Sign In as Admin'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-900 text-slate-400">or use Google</span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-5">
            {isBusy ? (
              <div className="flex items-center gap-3 text-slate-300 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                <span className="text-sm font-medium">Verifying access...</span>
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
                  width="300"
                />
              </div>
            )}

            <div className="w-full p-3 bg-slate-950/50 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                Only authorized admin accounts can access this portal. Contact your system administrator if you need access.
              </p>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-slate-800">
            <Link to="/login" className="text-sm text-teal-400 hover:text-teal-300 font-medium transition">
              ← Back to Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}