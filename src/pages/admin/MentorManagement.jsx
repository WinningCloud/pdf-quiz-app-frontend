import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import {
  UserPlus, Trash2, Search, Mail, Shield, Loader2,
  CheckCircle, XCircle, X, GraduationCap
} from 'lucide-react';

export default function MentorManagement() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchMentors(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchMentors = async () => {
    try {
      const res = await api.get('/admin/mentors');
      setMentors(res.data);
    } catch { setToast({ type: 'error', message: 'Failed to load mentors' }); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setAddLoading(true);
    try {
      const res = await api.post('/admin/mentors/add', { email: newEmail.trim() });
      setToast({ type: 'success', message: res.data.message });
      setNewEmail('');
      setShowAddModal(false);
      fetchMentors();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to add mentor' });
    } finally { setAddLoading(false); }
  };

  const handleRemove = async (mentor) => {
    try {
      await api.post('/admin/mentors/remove', { user_id: mentor.id });
      setToast({ type: 'success', message: `${mentor.username} removed as mentor` });
      fetchMentors();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed' });
    }
  };

  const filtered = mentors.filter(m =>
    !search ||
    m.username?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.full_name?.toLowerCase().includes(search.toLowerCase())
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
            <GraduationCap className="text-teal-400" size={28}/> Mentor Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">{mentors.length} mentor{mentors.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition shadow-lg shadow-teal-900/30"
        >
          <UserPlus size={18}/> Add Mentor
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search mentors..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-teal-400" size={32}/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="mx-auto text-slate-700 mb-4" size={48}/>
          <p className="text-slate-400 font-medium">{search ? 'No mentors match your search' : 'No mentors yet. Add one to get started.'}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(m => (
            <div key={m.id} className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                  <GraduationCap className="text-teal-300" size={20}/>
                </div>
                <div>
                  <div className="font-bold text-slate-100">{m.full_name || m.username}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Mail size={12}/> {m.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${m.is_active ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                  {m.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleRemove(m)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Remove mentor role"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <UserPlus size={20} className="text-teal-400"/> Add Mentor
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Enter the email address. If the user already has an account, they'll be promoted to mentor. Otherwise, they'll become a mentor upon signup.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Mail size={16} className="text-slate-500"/>
              <input
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="mentor@example.com"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-400 font-bold rounded-lg hover:bg-slate-800">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={addLoading || !newEmail.trim()}
                className="px-5 py-2 bg-teal-500 text-slate-900 font-bold rounded-lg hover:bg-teal-400 disabled:opacity-50 flex items-center gap-2"
              >
                {addLoading ? <Loader2 size={16} className="animate-spin"/> : <UserPlus size={16}/>}
                Add Mentor
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
