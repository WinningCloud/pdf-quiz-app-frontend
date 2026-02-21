import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Users, Search, Shield, User, Eye, EyeOff, KeyRound, Loader2,
  AlertTriangle, CheckCircle, XCircle, ToggleLeft, ToggleRight,
  Phone, Mail, Calendar, Clock, ChevronDown, ChevronUp, X, GraduationCap
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, students, admins, active, inactive
  const [expandedUser, setExpandedUser] = useState(null);
  const [resetModal, setResetModal] = useState(null); // user object or null
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setToast({ type: 'error', message: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setToast({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${resetModal.id}/reset-password`, {
        user_id: resetModal.id,
        new_password: newPassword,
      });
      setToast({ type: 'success', message: `Password reset for ${resetModal.username}` });
      setResetModal(null);
      setNewPassword('');
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Password reset failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/users/${user.id}/toggle-active`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: res.data.is_active } : u));
      setToast({ type: 'success', message: res.data.message });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Action failed' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and search
  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' ? true :
      filter === 'students' ? (!u.is_admin && !u.is_mentor) :
      filter === 'admins' ? u.is_admin :
      filter === 'mentors' ? u.is_mentor :
      filter === 'active' ? u.is_active :
      filter === 'inactive' ? !u.is_active : true;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: users.length,
    students: users.filter(u => !u.is_admin && !u.is_mentor).length,
    admins: users.filter(u => u.is_admin).length,
    mentors: users.filter(u => u.is_mentor).length,
    active: users.filter(u => u.is_active).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-display flex items-center gap-3">
          <Users className="w-7 h-7 text-teal-400" />
          User Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">View and manage all registered users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'teal' },
          { label: 'Students', value: stats.students, icon: User, color: 'sky' },
          { label: 'Mentors', value: stats.mentors, icon: GraduationCap, color: 'amber' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'violet' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'emerald' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{value}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'students', 'mentors', 'admins', 'active', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition ${
                filter === f
                  ? 'bg-teal-500 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium hidden lg:table-cell">Provider</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map(u => (
                  <UserRow
                    key={u.id}
                    user={u}
                    isExpanded={expandedUser === u.id}
                    onToggleExpand={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                    onResetPassword={() => { setResetModal(u); setNewPassword(''); }}
                    onToggleActive={() => handleToggleActive(u)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setResetModal(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Reset Password</h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  for <span className="text-teal-300 font-medium">{resetModal.username}</span>
                  {resetModal.email && <span className="text-slate-500"> ({resetModal.email})</span>}
                </p>
              </div>
              <button onClick={() => setResetModal(null)} className="text-slate-400 hover:text-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
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
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setResetModal(null)}
                  className="flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={actionLoading || newPassword.length < 8}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
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


function UserRow({ user, isExpanded, onToggleExpand, onResetPassword, onToggleActive }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <>
      <tr className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition ${!user.is_active ? 'opacity-50' : ''}`}>
        {/* User info */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${
              user.is_admin
                ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                : user.is_mentor
                ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                : 'bg-teal-500/20 border-teal-500/30 text-teal-300'
            }`}>
              {user.is_admin ? <Shield className="w-4 h-4" /> : user.is_mentor ? <GraduationCap className="w-4 h-4" /> : (user.first_name || user.username || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-slate-100 font-medium truncate">
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.full_name || user.username}
              </p>
              <p className="text-xs text-slate-500 truncate">@{user.username}</p>
            </div>
          </div>
        </td>
        {/* Contact */}
        <td className="py-3 px-4 hidden md:table-cell">
          <p className="text-slate-300 text-sm truncate">{user.email}</p>
          {user.phone_number && <p className="text-xs text-slate-500">{user.phone_number}</p>}
        </td>
        {/* Provider */}
        <td className="py-3 px-4 hidden lg:table-cell">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
            user.auth_provider === 'google'
              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
              : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
          }`}>
            {user.auth_provider === 'google' ? '🔵 Google' : '🔑 Local'}
          </span>
        </td>
        {/* Status */}
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
            user.is_active
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
          }`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        {/* Actions */}
        <td className="py-3 px-4">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={onResetPassword}
              title="Reset Password"
              className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleActive}
              title={user.is_active ? 'Deactivate' : 'Activate'}
              className={`p-2 rounded-lg transition ${
                user.is_active
                  ? 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              {user.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleExpand}
              title="Details"
              className="p-2 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>
      {/* Expanded details row */}
      {isExpanded && (
        <tr className="bg-slate-800/20">
          <td colSpan={5} className="px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
              <DetailItem icon={Mail} label="Email" value={user.email} />
              <DetailItem icon={Phone} label="Phone" value={user.phone_number || '—'} />
              <DetailItem icon={User} label="Role" value={user.is_admin ? 'Admin' : user.is_mentor ? 'Mentor' : 'Student'} />
              <DetailItem icon={Calendar} label="Joined" value={formatDate(user.created_at)} />
              <DetailItem icon={Clock} label="Last Login" value={formatDate(user.last_login)} />
              <DetailItem icon={Shield} label="Provider" value={user.auth_provider} />
              {user.purpose && <DetailItem icon={Users} label="Purpose" value={user.purpose} />}
              <DetailItem icon={CheckCircle} label="Profile Done" value={user.profile_completed ? 'Yes' : 'No'} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
        <p className="text-slate-300 break-all">{value}</p>
      </div>
    </div>
  );
}
