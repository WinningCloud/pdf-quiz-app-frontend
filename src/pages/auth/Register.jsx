import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../../context/AuthContext';
import { Sparkles, Users, Brain, Loader2, AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';
import api from '../../api/axios';

const PURPOSE_OPTIONS = [
  'Creating quizzes for my students',
  'Self-study & practice tests',
  'Corporate training & assessments',
  'Exam preparation',
  'Other',
];

export default function Register() {
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLocalRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName || !lastName || !username || !email || !phoneNumber || !purpose || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsBusy(true);
    try {
      await api.post('/auth/register', {
        username,
        email,
        password,
        full_name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        purpose,
        is_admin: false,
      });

      // Auto-login after registration
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      const user = await login(params);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsBusy(true);
    setError('');
    try {
      const user = await googleLogin(credentialResponse.credential);
      if (user.is_admin) {
        navigate('/admin');
      } else if (!user.profile_completed) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err.response?.data?.detail || 'Sign up failed. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative animate-fade-in-down">
        <Link to="/" className="inline-flex items-center mb-6 group hover:opacity-90 transition">
          <Logo size="lg" />
        </Link>
        <h2 className="text-3xl font-black text-slate-100 font-display">Get started free</h2>
        <p className="mt-2 text-sm text-slate-400">Create your account to start learning</p>
      </div>

      {/* Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass-panel py-10 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-800">

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-2xl text-sm font-medium animate-fade-in flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-2xl text-sm font-medium animate-fade-in flex items-start gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleLocalRegister} className="space-y-4 mb-6">
            {/* First & Last Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email <span className="text-rose-400">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number <span className="text-rose-400">*</span></label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Purpose <span className="text-rose-400">*</span></label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition appearance-none"
              >
                <option value="" className="bg-slate-900 text-slate-500">What brings you here?</option>
                {PURPOSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-slate-100">{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password <span className="text-rose-400">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password <span className="text-rose-400">*</span></label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-900 text-slate-400">or sign up with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <div className="flex flex-col items-center space-y-5">
            {isBusy ? (
              <div className="flex items-center gap-3 text-slate-300 py-2">
                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
                <span className="text-sm font-medium">Creating your account...</span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="signup_with"
                  width="320"
                />
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-sm text-slate-400">Already have an account? </span>
            <Link to="/login" className="text-sm font-bold text-teal-300 hover:text-teal-200 transition">Sign in</Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}