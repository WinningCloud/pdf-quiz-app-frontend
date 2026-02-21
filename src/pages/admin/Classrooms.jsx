import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Plus, Trash2, Search, Users, BookOpen, Copy, RefreshCw,
  Loader2, CheckCircle, XCircle, X, School, BarChart3, Eye
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function Classrooms() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { fetchClassrooms(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('/mentor/classrooms');
      setClassrooms(res.data);
    } catch { setToast({ type: 'error', message: 'Failed to load classrooms' }); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreateLoading(true);
    try {
      await api.post('/mentor/classrooms', { name: createName.trim(), description: createDesc.trim() });
      setToast({ type: 'success', message: 'Classroom created!' });
      setCreateName(''); setCreateDesc(''); setShowCreateModal(false);
      fetchClassrooms();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed' });
    } finally { setCreateLoading(false); }
  };

  const handleDelete = (c) => {
    setConfirm({
      title: 'Delete Classroom',
      message: `Delete "${c.name}"? All members will be removed. This cannot be undone.`,
      danger: true, confirmText: 'Delete',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.delete(`/mentor/classrooms/${c.id}`);
          setToast({ type: 'success', message: 'Classroom deleted' });
          fetchClassrooms();
        } catch { setToast({ type: 'error', message: 'Delete failed' }); }
      },
    });
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = classrooms.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.mentor_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
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
            <School className="text-teal-400" size={28}/> Classrooms
          </h1>
          <p className="text-slate-400 text-sm mt-1">{classrooms.length} classroom{classrooms.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition shadow-lg shadow-teal-900/30"
        >
          <Plus size={18}/> New Classroom
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search classrooms..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"/>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-teal-400" size={32}/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <School className="mx-auto text-slate-700 mb-4" size={48}/>
          <p className="text-slate-400 font-medium">{search ? 'No classrooms match' : 'No classrooms yet'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-teal-500/30 transition group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-100 truncate flex-1">{c.name}</h3>
                <button onClick={() => handleDelete(c)} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100">
                  <Trash2 size={15}/>
                </button>
              </div>
              {c.description && <p className="text-sm text-slate-400 mb-3 line-clamp-2">{c.description}</p>}
              
              {/* Join Code */}
              <div className="flex items-center gap-2 mb-4 bg-slate-800/60 rounded-xl px-3 py-2">
                <span className="text-xs text-slate-500 font-bold">CODE</span>
                <span className="text-lg font-mono font-bold text-teal-300 tracking-widest flex-1">{c.join_code}</span>
                <button onClick={() => copyCode(c.join_code, c.id)} className="p-1 text-slate-500 hover:text-teal-300 transition">
                  {copiedId === c.id ? <CheckCircle size={16} className="text-emerald-400"/> : <Copy size={16}/>}
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Users size={14}/> {c.member_count} students</span>
                <span className="flex items-center gap-1"><BookOpen size={14}/> {c.quiz_count} quizzes</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => navigate(`/admin/classroom/${c.id}`)}
                  className="flex-1 px-3 py-2 text-xs font-bold text-teal-300 border border-teal-500/30 rounded-xl hover:bg-teal-500/10 transition flex items-center justify-center gap-1.5">
                  <Eye size={14}/> Manage
                </button>
                <button onClick={() => navigate(`/admin/classroom/${c.id}/analytics`)}
                  className="flex-1 px-3 py-2 text-xs font-bold text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-1.5">
                  <BarChart3 size={14}/> Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2"><School size={20} className="text-teal-400"/> New Classroom</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
            <input value={createName} onChange={e => setCreateName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Classroom name" className="w-full px-3 py-2 mb-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"/>
            <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)}
              placeholder="Description (optional)" rows={3}
              className="w-full px-3 py-2 mb-4 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"/>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-400 font-bold rounded-lg hover:bg-slate-800">Cancel</button>
              <button onClick={handleCreate} disabled={createLoading || !createName.trim()}
                className="px-5 py-2 bg-teal-500 text-slate-900 font-bold rounded-lg hover:bg-teal-400 disabled:opacity-50 flex items-center gap-2">
                {createLoading ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>} Create
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmModal open={!!confirm} title={confirm?.title||''} message={confirm?.message||''} confirmText={confirm?.confirmText||'Confirm'}
        danger={confirm?.danger} onConfirm={confirm?.onConfirm||(()=>{})} onCancel={() => setConfirm(null)}/>
    </div>
  );
}
