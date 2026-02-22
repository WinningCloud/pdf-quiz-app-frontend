import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import {
  UserPlus, Trash2, Search, Mail, Loader2,
  CheckCircle, XCircle, X, Lock, Eye, EyeOff, ShieldCheck, KeyRound
} from 'lucide-react';

function avatarUrl(pic) {
  if (!pic) return null;
  if (pic.startsWith('http')) return pic;
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  return `${base}${pic}`;
}

function AdminAvatar({ admin, isSelf, size = 40 }) {
  const url = avatarUrl(admin.profile_picture);
  const initials = (admin.full_name || admin.username || admin.email || '?')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (url) {
    return (
      <img
        src={url}
        alt={admin.full_name || admin.username}
        className={`rounded-full object-cover border-2 ${isSelf ? 'border-teal-400/60' : 'border-amber-400/40'}`}
        style={{ width: size, height: size }}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-sm border-2 ${
        isSelf ? 'bg-teal-500/30 border-teal-400/50 text-teal-300' : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
      }`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export default function AdminManagement() {
  const { user: currentUser } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // Reset password state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => { fetchAdmins(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch { setToast({ type: 'error', message: 'Failed to load admins' }); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    if (!newPassword || newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }
    setAddLoading(true);
    try {
      const res = await api.post('/admin/admins/add', { email: newEmail.trim(), password: newPassword });
      setToast({ type: 'success', message: res.data.message });
      setNewEmail(''); setNewPassword(''); setShowPassword(false); setShowAddModal(false);
      fetchAdmins();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to add admin' });
    } finally { setAddLoading(false); }
  };

  const handleRemove = async (admin) => {
    if (admin.id === currentUser?.id) {
      setToast({ type: 'error', message: 'You cannot remove your own admin role' });
      return;
    }
    setRemoveLoading(admin.id);
    try {
      await api.post('/admin/admins/remove', { user_id: admin.id });
      setToast({ type: 'success', message: `${admin.username || admin.email} removed as admin` });
      fetchAdmins();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to remove admin' });
    } finally { setRemoveLoading(null); }
  };

  const openResetModal = (admin) => {
    setResetTarget(admin);
    setResetPassword('');
    setShowResetPassword(false);
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (!resetPassword || resetPassword.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }
    setResetLoading(true);
    try {
      const res = await api.post('/admin/admins/reset-password', {
        user_id: resetTarget.id,
        new_password: resetPassword,
      });
      setToast({ type: 'success', message: res.data.message });
      setShowResetModal(false);
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to reset password' });
    } finally { setResetLoading(false); }
  };

  const filtered = admins.filter(a =>
    !search ||
    a.username?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <ShieldCheck className="text-teal-400" size={28}/> Admin Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">{admins.length} admin{admins.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition shadow-lg shadow-teal-900/30"
        >
          <UserPlus size={18}/> Add Admin
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search admins..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-teal-400" size={32}/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ShieldCheck className="mx-auto text-slate-700 mb-4" size={48}/>
          <p className="text-slate-400 font-medium">{search ? 'No admins match your search' : 'No admins yet. Add one to get started.'}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(a => {
            const isSelf = a.id === currentUser?.id;
            return (
              <div key={a.id} className={`flex items-center justify-between p-4 bg-slate-900/60 border rounded-xl hover:border-slate-700 transition ${isSelf ? 'border-teal-500/30' : 'border-slate-800'}`}>
                <div className="flex items-center gap-4">
                  <AdminAvatar admin={a} isSelf={isSelf} />
                  <div>
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      {a.full_name || a.username}
                      {isSelf && <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">YOU</span>}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Mail size={12}/> {a.email}
                    </div>
                    {a.auth_provider && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Auth: {a.auth_provider} {a.last_login ? `\u2022 Last login: ${new Date(a.last_login).toLocaleDateString()}` : ''}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${a.is_active ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {!isSelf && (
                    <>
                      <button
                        onClick={() => openResetModal(a)}
                        className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                        title="Reset password"
                      >
                        <KeyRound size={16}/>
                      </button>
                      <button
                        onClick={() => handleRemove(a)}
                        disabled={removeLoading === a.id}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                        title="Remove admin role"
                      >
                        {removeLoading === a.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <UserPlus size={20} className="text-teal-400"/> Add Admin
              </h2>
              <button onClick={() => { setShowAddModal(false); setNewEmail(''); setNewPassword(''); setShowPassword(false); }} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Create a new admin account. If the email already exists, they will be promoted to admin and their password will be updated.
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Email Address</label>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-slate-500 shrink-0"/>
                  <input
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="admin@example.com"
                    type="email"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Password</label>
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-slate-500 shrink-0"/>
                  <div className="flex-1 relative">
                    <input
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdd()}
                      placeholder="Min. 6 characters"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowAddModal(false); setNewEmail(''); setNewPassword(''); setShowPassword(false); }} className="px-4 py-2 text-slate-400 font-bold rounded-lg hover:bg-slate-800">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={addLoading || !newEmail.trim() || !newPassword || newPassword.length < 6}
                className="px-5 py-2 bg-teal-500 text-slate-900 font-bold rounded-lg hover:bg-teal-400 disabled:opacity-50 flex items-center gap-2"
              >
                {addLoading ? <Loader2 size={16} className="animate-spin"/> : <UserPlus size={16}/>}
                Add Admin
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reset Password Modal */}
      {showResetModal && resetTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <KeyRound size={20} className="text-amber-400"/> Reset Password
              </h2>
              <button onClick={() => { setShowResetModal(false); setResetTarget(null); setResetPassword(''); setShowResetPassword(false); }} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl mb-4">
              <AdminAvatar admin={resetTarget} isSelf={false} size={36} />
              <div>
                <div className="font-bold text-slate-200 text-sm">{resetTarget.full_name || resetTarget.username}</div>
                <div className="text-xs text-slate-400">{resetTarget.email}</div>
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Set a new password for this admin. They will need to use this password on their next login.
            </p>

            <div className="mb-5">
              <label className="text-xs text-slate-400 font-semibold mb-1 block">New Password</label>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-slate-500 shrink-0"/>
                <div className="flex-1 relative">
                  <input
                    value={resetPassword}
                    onChange={e => setResetPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                    placeholder="Min. 6 characters"
                    type={showResetPassword ? 'text' : 'password'}
                    className="w-full px-3 py-2 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showResetPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowResetModal(false); setResetTarget(null); setResetPassword(''); setShowResetPassword(false); }} className="px-4 py-2 text-slate-400 font-bold rounded-lg hover:bg-slate-800">Cancel</button>
              <button
                onClick={handleResetPassword}
                disabled={resetLoading || !resetPassword || resetPassword.length < 6}
                className="px-5 py-2 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2"
              >
                {resetLoading ? <Loader2 size={16} className="animate-spin"/> : <KeyRound size={16}/>}
                Reset Password
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
