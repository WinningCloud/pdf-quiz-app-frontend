import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  School, Plus, Users, BookOpen, LogOut, Copy, Check,
  Loader2, Search, DoorOpen, ArrowRight
} from 'lucide-react';

export default function StudentClassrooms() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [quizzes, setQuizzes] = useState({});
  const [loadingQuizzes, setLoadingQuizzes] = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClassrooms = useCallback(async () => {
    try {
      const res = await api.get('/student/classrooms');
      setClassrooms(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClassrooms(); }, [fetchClassrooms]);

  const handleJoin = async () => {
    if (joinCode.length !== 6) return;
    setJoining(true);
    try {
      await api.post('/student/classroom/join', { join_code: joinCode });
      showToast('Joined classroom successfully!');
      setShowJoin(false);
      setJoinCode('');
      fetchClassrooms();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to join', 'error');
    }
    finally { setJoining(false); }
  };

  const handleLeave = async (id, name) => {
    if (!confirm(`Leave "${name}"?`)) return;
    try {
      await api.post(`/student/classroom/${id}/leave`);
      showToast('Left classroom');
      setClassrooms(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to leave', 'error');
    }
  };

  const toggleQuizzes = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!quizzes[id]) {
      setLoadingQuizzes(prev => ({ ...prev, [id]: true }));
      try {
        const res = await api.get(`/student/classroom/${id}/quizzes`);
        setQuizzes(prev => ({ ...prev, [id]: res.data }));
      } catch (err) { console.error(err); }
      finally { setLoadingQuizzes(prev => ({ ...prev, [id]: false })); }
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-teal-400" size={32}/></div>;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-xl border ${
          toast.type === 'error' ? 'bg-red-900/90 border-red-700 text-red-200' : 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <School className="text-teal-400" size={26}/> My Classrooms
        </h1>
        <button onClick={() => setShowJoin(true)}
          className="px-5 py-2.5 bg-teal-500 text-slate-900 rounded-xl font-bold text-sm hover:bg-teal-400 transition flex items-center gap-2">
          <DoorOpen size={18}/> Join Classroom
        </button>
      </div>

      {/* Join Modal */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowJoin(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-100 mb-4">Join Classroom</h2>
            <p className="text-sm text-slate-400 mb-4">Enter the 6-digit code provided by your mentor.</p>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-center text-2xl tracking-[0.5em] font-mono placeholder:text-slate-600 placeholder:tracking-[0.5em] focus:ring-2 focus:ring-teal-500 outline-none"
              maxLength={6}
              autoFocus
            />
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowJoin(false); setJoinCode(''); }}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 transition">Cancel</button>
              <button onClick={handleJoin} disabled={joinCode.length !== 6 || joining}
                className="flex-1 px-4 py-2.5 bg-teal-500 text-slate-900 rounded-xl font-bold text-sm hover:bg-teal-400 transition disabled:opacity-40 flex items-center justify-center gap-2">
                {joining ? <Loader2 className="animate-spin" size={16}/> : <DoorOpen size={16}/>} Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classrooms List */}
      {classrooms.length === 0 ? (
        <div className="text-center py-20">
          <School className="mx-auto text-slate-600 mb-4" size={48}/>
          <p className="text-slate-400 font-medium">You haven't joined any classrooms yet.</p>
          <p className="text-sm text-slate-500 mt-1">Ask your mentor for a 6-digit code.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classrooms.map(c => (
            <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg text-slate-100">{c.name}</div>
                  {c.description && <div className="text-sm text-slate-400 mt-0.5">{c.description}</div>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Users size={12}/> {c.member_count} student{c.member_count !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1"><BookOpen size={12}/> {c.quiz_count} quiz{c.quiz_count !== 1 ? 'zes' : ''}</span>
                    <span>Mentor: {c.mentor_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-0 sm:ml-4 mt-2 sm:mt-0">
                  <button onClick={() => toggleQuizzes(c.id)}
                    className="px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-xl text-sm font-bold hover:bg-teal-500/20 transition flex items-center gap-1.5">
                    <BookOpen size={15}/> Quizzes
                  </button>
                  <button onClick={() => handleLeave(c.id, c.name)}
                    className="px-3 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition">
                    <LogOut size={15}/>
                  </button>
                </div>
              </div>

              {/* Expanded quizzes section */}
              {expandedId === c.id && (
                <div className="border-t border-slate-800 bg-slate-950/40 p-5">
                  {loadingQuizzes[c.id] ? (
                    <div className="flex items-center justify-center py-6"><Loader2 className="animate-spin text-teal-400" size={20}/></div>
                  ) : !quizzes[c.id] || quizzes[c.id].length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No quizzes shared in this classroom yet.</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {quizzes[c.id].map(q => (
                        <div key={q.id} className="flex flex-wrap items-center justify-between p-3.5 bg-slate-800/50 rounded-xl">
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="font-bold text-sm text-slate-200 truncate">{q.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{q.total_questions} questions</div>
                          </div>
                          {q.attempted ? (
                            <span className="text-xs bg-emerald-900/40 text-emerald-400 px-2.5 py-1 rounded-lg font-bold">Completed</span>
                          ) : (
                            <button onClick={() => navigate(`/quiz/take/${q.id}`)}
                              className="px-3 py-1.5 bg-teal-500 text-slate-900 rounded-lg text-xs font-bold hover:bg-teal-400 transition flex items-center gap-1">
                              Take <ArrowRight size={12}/>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
