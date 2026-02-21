import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Loader2, AlertTriangle, Phone, Target } from 'lucide-react';
import api from '../../api/axios';

const PURPOSE_OPTIONS = [
  'Creating quizzes for my students',
  'Self-study & practice tests',
  'Corporate training & assessments',
  'Exam preparation',
  'Other',
];

export default function CompleteProfile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.full_name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.full_name?.split(' ').slice(1).join(' ') || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !phoneNumber || !purpose) {
      setError('Please fill in all fields to continue.');
      return;
    }

    setIsBusy(true);
    try {
      const res = await api.post('/auth/complete-profile', {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        purpose,
      });

      // Update user in context with the returned data
      if (typeof setUser === 'function') {
        setUser(res.data);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Complete profile error:', err);
      setError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative">
        <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 animate-fade-in-up">
          {/* Header */}
          <div className="p-8 text-center border-b border-slate-800">
            <div className="inline-flex p-3 bg-teal-500/10 rounded-2xl mb-4">
              <UserCircle className="w-8 h-8 text-teal-300" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 font-display">Complete Your Profile</h1>
            <p className="text-slate-400 text-sm mt-2">
              Just a few more details to get you started
            </p>
            {user?.email && (
              <p className="text-teal-400 text-xs mt-2 font-medium">
                Signed in as {user.email}
              </p>
            )}
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-2xl text-sm font-medium animate-fade-in flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First & Last Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              {/* Email (read-only, from Google) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Phone Number <span className="text-rose-400">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-slate-400" />
                    What brings you here? <span className="text-rose-400">*</span>
                  </span>
                </label>
                <div className="space-y-2">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        purpose === opt
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-200'
                          : 'bg-slate-950/50 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="purpose"
                        value={opt}
                        checked={purpose === opt}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        purpose === opt ? 'border-teal-400' : 'border-slate-500'
                      }`}>
                        {purpose === opt && (
                          <div className="w-2 h-2 rounded-full bg-teal-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue to Dashboard'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
