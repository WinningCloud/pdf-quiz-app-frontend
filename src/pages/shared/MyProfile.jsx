import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  User, Mail, Phone, Save, Loader2, CheckCircle, AlertTriangle,
  KeyRound, Shield, Calendar, AtSign, Briefcase, Pencil, X, Camera, Upload, Trash2
} from 'lucide-react';

const PURPOSE_OPTIONS = [
  'Creating quizzes for my students',
  'Self-study & practice tests',
  'Corporate training & assessments',
  'Exam preparation',
  'Other',
];

/* ─── Avatar gradient from name ─── */
const AVATAR_GRADIENTS = [
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-cyan-500 to-teal-600',
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
];
function nameGradient(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function avatarUrl(pic) {
  if (!pic) return null;
  if (pic.startsWith('http')) return pic;
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  return `${base}${pic}`;
}

export default function MyProfile() {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    purpose: '',
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);

  // Populate form from user context
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        purpose: user.purpose || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/update-profile', form);
      setUser(res.data);
      setEditing(false);
      setToast({ type: 'success', message: 'Profile updated successfully' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      purpose: user.purpose || '',
    });
    setEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Image must be under 5 MB' });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadingAvatar(true);
    try {
      const res = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(prev => ({ ...prev, profile_picture: res.data.profile_picture }));
      setToast({ type: 'success', message: 'Avatar updated!' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to upload avatar' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await api.delete('/auth/remove-avatar');
      setUser(prev => ({ ...prev, profile_picture: null }));
      setToast({ type: 'success', message: 'Avatar removed' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to remove avatar' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display flex items-center gap-3">
            <User className="w-7 h-7 text-teal-400" />
            My Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1">View and manage your account details</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition text-sm"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl transition text-sm font-medium"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Avatar Banner */}
        <div className="h-28 bg-gradient-to-r from-teal-600/30 via-sky-600/20 to-violet-600/30 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border-4 border-slate-900 flex items-center justify-center shadow-xl overflow-hidden">
                {user.profile_picture ? (
                  <img src={avatarUrl(user.profile_picture)} alt="Profile" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${nameGradient(user.first_name || user.username)} flex items-center justify-center`}>
                    <span className="text-3xl font-bold text-white">
                      {(user.first_name || user.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Avatar overlay buttons */}
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="p-2 rounded-lg bg-teal-500/90 hover:bg-teal-400 text-white transition"
                  title="Upload photo"
                >
                  {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </button>
                {user.profile_picture && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="p-2 rounded-lg bg-rose-500/90 hover:bg-rose-400 text-white transition"
                    title="Remove photo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </div>
        </div>

        <div className="pt-16 px-6 pb-6 space-y-6">
          {/* Name & Role badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-slate-100">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.full_name || user.username}
            </h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
              user.is_admin
                ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                : user.is_mentor
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
            }`}>
              <Shield className="w-3 h-3" />
              {user.is_admin ? 'Admin' : user.is_mentor ? 'Mentor' : 'Student'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
              user.auth_provider === 'google'
                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
            }`}>
              {user.auth_provider === 'google' ? '🔵 Google' : '🔑 Local'}
            </span>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileField
              icon={User}
              label="First Name"
              value={form.first_name}
              editing={editing}
              onChange={v => handleChange('first_name', v)}
              placeholder="Enter first name"
            />
            <ProfileField
              icon={User}
              label="Last Name"
              value={form.last_name}
              editing={editing}
              onChange={v => handleChange('last_name', v)}
              placeholder="Enter last name"
            />
            <ProfileField
              icon={AtSign}
              label="Username"
              value={form.username}
              editing={editing}
              onChange={v => handleChange('username', v)}
              placeholder="Enter username"
            />
            <ProfileField
              icon={Mail}
              label="Email"
              value={form.email}
              editing={editing}
              onChange={v => handleChange('email', v)}
              placeholder="Enter email"
              type="email"
            />
            <ProfileField
              icon={Phone}
              label="Phone Number"
              value={form.phone_number}
              editing={editing}
              onChange={v => handleChange('phone_number', v)}
              placeholder="Enter phone number"
            />
            {/* Purpose - dropdown when editing, text when viewing */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" /> Purpose
              </label>
              {editing ? (
                <select
                  value={form.purpose}
                  onChange={e => handleChange('purpose', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition text-sm appearance-none"
                >
                  <option value="">Select purpose</option>
                  {PURPOSE_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <p className="px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 text-sm min-h-[44px] flex items-center">
                  {form.purpose || <span className="text-slate-500">Not set</span>}
                </p>
              )}
            </div>
          </div>

          {/* Read-only Info */}
          <div className="border-t border-slate-800 pt-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Account Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-950/30 rounded-xl border border-slate-800/50">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Joined</p>
                  <p className="text-slate-300">{formatDate(user.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-950/30 rounded-xl border border-slate-800/50">
                <KeyRound className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Auth Provider</p>
                  <p className="text-slate-300 capitalize">{user.auth_provider}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-950/30 rounded-xl border border-slate-800/50">
                <CheckCircle className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status</p>
                  <p className={`font-medium ${user.is_active ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border animate-fade-in ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function ProfileField({ icon: Icon, label, value, editing, onChange, placeholder, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition text-sm"
        />
      ) : (
        <p className="px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 text-sm min-h-[44px] flex items-center">
          {value || <span className="text-slate-500">Not set</span>}
        </p>
      )}
    </div>
  );
}
