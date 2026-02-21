import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { XCircle, Loader2, ArrowLeft, BookOpen, LogIn, Play, ClipboardList, BarChart3, Tag } from 'lucide-react';

export default function SharedQuiz() {
  const { shareCode } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedQuiz = async () => {
      try {
        const res = await api.get(`/quiz/shared/${shareCode}`);
        setQuiz(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Quiz not found or link has expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedQuiz();
  }, [shareCode]);

  const handleStartQuiz = () => {
    navigate(`/quiz/${quiz.id}`);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
          <span className="text-slate-400 font-bold">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-100">Quiz Not Found</h1>
          <p className="text-slate-400 max-w-sm">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-teal-500 text-slate-900 font-black rounded-xl hover:bg-teal-400 transition">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    );
  }

  const diff = quiz.difficulty_distribution || {};
  const topics = quiz.topics || [];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Quiz Preview Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500" />

          <div className="p-8 space-y-6">
            {/* Icon + Title */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-teal-500/15 rounded-2xl flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-teal-400" />
              </div>
              <h1 className="text-2xl font-black text-slate-100">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-slate-400 text-sm leading-relaxed">{quiz.description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                <ClipboardList className="w-5 h-5 text-teal-400 mx-auto mb-1.5" />
                <p className="text-xl font-black text-slate-100">{quiz.total_questions}</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Questions</p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                <BarChart3 className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                <p className="text-xl font-black text-slate-100">MCQ</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Type</p>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            {(diff.easy > 0 || diff.medium > 0 || diff.hard > 0) && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Difficulty</p>
                <div className="flex gap-3">
                  {diff.easy > 0 && (
                    <span className="flex-1 text-center py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="block text-sm font-black text-emerald-300">{diff.easy}</span>
                      <span className="text-[10px] text-emerald-400/70 font-bold">Easy</span>
                    </span>
                  )}
                  {diff.medium > 0 && (
                    <span className="flex-1 text-center py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="block text-sm font-black text-amber-300">{diff.medium}</span>
                      <span className="text-[10px] text-amber-400/70 font-bold">Medium</span>
                    </span>
                  )}
                  {diff.hard > 0 && (
                    <span className="flex-1 text-center py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="block text-sm font-black text-red-300">{diff.hard}</span>
                      <span className="text-[10px] text-red-400/70 font-bold">Hard</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Topics */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {topics.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-300 font-medium">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Action Area */}
            <div className="pt-2">
              {user ? (
                <button
                  onClick={handleStartQuiz}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black rounded-xl transition shadow-lg shadow-teal-900/30 text-sm"
                >
                  <Play className="w-4 h-4" />
                  Start Quiz
                </button>
              ) : (
                <div className="space-y-3">
                  <Link
                    to={`/login?redirect=/quiz/${quiz.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-black rounded-xl transition shadow-lg shadow-teal-900/30 text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In to Attempt Quiz
                  </Link>
                  <p className="text-center text-xs text-slate-500">
                    Sign in to take this quiz and track your results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-400 font-medium transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
