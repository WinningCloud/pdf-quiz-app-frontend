import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  ChevronLeft, Users, BookOpen, Copy, RefreshCw, Trash2,
  Plus, Search, Loader2, CheckCircle, XCircle, X, School, UserMinus
} from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function ClassroomDetail() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [publishedQuizzes, setPublishedQuizzes] = useState([]);
  const [quizSearch, setQuizSearch] = useState('');
  const [quizSource, setQuizSource] = useState('admin'); // 'admin' | 'own'
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => { fetchClassroom(); }, [classroomId]);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchClassroom = async () => {
    try {
      const res = await api.get(`/mentor/classrooms/${classroomId}`);
      setClassroom(res.data);
    } catch { setToast({ type: 'error', message: 'Failed to load classroom' }); }
    finally { setLoading(false); }
  };

  const openShareModal = async () => {
    setShowShareModal(true);
    try {
      const res = await api.get('/mentor/published-quizzes');
      setPublishedQuizzes(res.data);
    } catch { setToast({ type: 'error', message: 'Failed to load quizzes' }); }
  };

  const handleShareQuiz = async (quizId) => {
    try {
      await api.post(`/mentor/classrooms/${classroomId}/share-quiz`, { quiz_id: quizId });
      setToast({ type: 'success', message: 'Quiz shared!' });
      setShowShareModal(false);
      fetchClassroom();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed' });
    }
  };

  const handleUnshareQuiz = async (quizId) => {
    try {
      await api.delete(`/mentor/classrooms/${classroomId}/unshare-quiz/${quizId}`);
      setToast({ type: 'success', message: 'Quiz removed' });
      fetchClassroom();
    } catch { setToast({ type: 'error', message: 'Failed' }); }
  };

  const handleRemoveMember = (member) => {
    setConfirm({
      title: 'Remove Student', danger: true, confirmText: 'Remove',
      message: `Remove ${member.full_name || member.username} from this classroom?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.post(`/mentor/classrooms/${classroomId}/remove-member`, { student_id: member.id });
          setToast({ type: 'success', message: 'Student removed' });
          fetchClassroom();
        } catch { setToast({ type: 'error', message: 'Failed' }); }
      },
    });
  };

  const handleRegenCode = async () => {
    try {
      const res = await api.post(`/mentor/classrooms/${classroomId}/regenerate-code`);
      setClassroom(prev => ({ ...prev, join_code: res.data.join_code }));
      setToast({ type: 'success', message: 'Join code regenerated' });
    } catch { setToast({ type: 'error', message: 'Failed' }); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(classroom.join_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-teal-400" size={32}/></div>;
  if (!classroom) return <div className="text-center py-20 text-slate-400">Classroom not found</div>;

  // Filter quizzes not already shared, then by source tab
  const alreadySharedIds = new Set((classroom.quizzes || []).map(q => q.id));
  const availableQuizzes = publishedQuizzes.filter(q =>
    !alreadySharedIds.has(q.id) &&
    q.source === quizSource &&
    (!quizSearch || q.title?.toLowerCase().includes(quizSearch.toLowerCase()))
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

      {/* Back + Title */}
      <button onClick={() => navigate('/admin/classrooms')} className="flex items-center gap-1 text-slate-400 hover:text-white mb-4 font-medium text-sm">
        <ChevronLeft size={18}/> Back to Classrooms
      </button>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <School className="text-teal-400" size={26}/> {classroom.name}
            </h1>
            {classroom.description && <p className="text-slate-400 mt-1">{classroom.description}</p>}
          </div>
          {/* Join Code Box */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2.5">
            <span className="text-xs text-slate-500 font-bold mr-1">JOIN CODE</span>
            <span className="text-xl font-mono font-bold text-teal-300 tracking-[0.25em]">{classroom.join_code}</span>
            <button onClick={copyCode} className="p-1 text-slate-500 hover:text-teal-300">
              {copiedCode ? <CheckCircle size={16} className="text-emerald-400"/> : <Copy size={16}/>}
            </button>
            <button onClick={handleRegenCode} className="p-1 text-slate-500 hover:text-amber-400" title="Regenerate code">
              <RefreshCw size={16}/>
            </button>
          </div>
        </div>
      </div>

      {/* Two-column: Members + Quizzes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
              <Users size={16}/> Students ({(classroom.members||[]).length})
            </h2>
          </div>
          {(classroom.members||[]).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No students yet. Share the join code with your students.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {(classroom.members||[]).map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl group">
                  <div>
                    <div className="text-sm font-bold text-slate-200">{m.full_name || m.username}</div>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </div>
                  <button onClick={() => handleRemoveMember(m)}
                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition" title="Remove student">
                    <UserMinus size={15}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
              <BookOpen size={16}/> Shared Quizzes ({(classroom.quizzes||[]).length})
            </h2>
            <button onClick={openShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-300 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition">
              <Plus size={14}/> Share Quiz
            </button>
          </div>
          {(classroom.quizzes||[]).length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No quizzes shared yet.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {(classroom.quizzes||[]).map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl group">
                  <div>
                    <div className="text-sm font-bold text-slate-200">{q.title}</div>
                    <div className="text-xs text-slate-500">{q.total_questions} questions</div>
                  </div>
                  <button onClick={() => handleUnshareQuiz(q.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition" title="Remove quiz">
                    <Trash2 size={15}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Quiz Modal */}
      {showShareModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100">Share Quiz to Classroom</h2>
              <button onClick={() => setShowShareModal(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
            {/* Source Tabs */}
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1 mb-3">
              {[{ key: 'admin', label: 'Admin Quizzes' }, { key: 'own', label: 'My Quizzes' }].map(tab => (
                <button key={tab.key} onClick={() => { setQuizSource(tab.key); setQuizSearch(''); }}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-bold transition ${
                    quizSource === tab.key ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}>{tab.label}</button>
              ))}
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
              <input value={quizSearch} onChange={e => setQuizSearch(e.target.value)} placeholder="Search quizzes..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500"/>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {availableQuizzes.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">
                  {quizSource === 'own' ? 'No published quizzes from you.' : 'No admin quizzes available.'}
                </p>
              ) : availableQuizzes.map(q => (
                <button key={q.id} onClick={() => handleShareQuiz(q.id)}
                  className="w-full text-left p-3 bg-slate-800/50 hover:bg-teal-500/10 border border-slate-700 hover:border-teal-500/30 rounded-xl transition">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-200">{q.title}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      q.source === 'own' ? 'bg-teal-500/20 text-teal-300' : 'bg-violet-500/20 text-violet-300'
                    }`}>{q.source === 'own' ? 'Mine' : 'Admin'}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{q.total_questions} questions · by {q.creator_name}</div>
                </button>
              ))}
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
