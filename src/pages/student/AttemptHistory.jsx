import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import {
  History, Clock, Trophy, ChevronRight, Search, Filter,
  BarChart3, CheckCircle2, XCircle, Loader2, Sparkles, Calendar
} from 'lucide-react';

export default function AttemptHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const fetchAttempts = (skip = 0, append = false) => {
    setLoading(true);
    api.get(`/student/attempts/history?skip=${skip}&limit=${LIMIT}`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        if (append) {
          setAttempts(prev => [...prev, ...data]);
        } else {
          setAttempts(data);
        }
        setHasMore(data.length >= LIMIT);
      })
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAttempts(0); }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAttempts(nextPage * LIMIT, true);
  };

  const filtered = attempts.filter(a =>
    !search ||
    a.quiz_title?.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreColor = (pct) => {
    const n = parseFloat(pct) || 0;
    if (n >= 80) return 'text-emerald-400';
    if (n >= 60) return 'text-teal-300';
    if (n >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (pct) => {
    const n = parseFloat(pct) || 0;
    if (n >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (n >= 60) return 'bg-teal-500/10 border-teal-500/20';
    if (n >= 40) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getPerformanceLabel = (pct) => {
    const n = parseFloat(pct) || 0;
    if (n >= 80) return 'Excellent';
    if (n >= 60) return 'Good';
    if (n >= 40) return 'Average';
    return 'Needs Work';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (minutes) => {
    if (!minutes && minutes !== 0) return '—';
    const m = Math.floor(minutes);
    const s = Math.round((minutes - m) * 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (loading && attempts.length === 0) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 skeleton rounded-xl" />
        <div className="space-y-4 stagger-children">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <header className="animate-fade-in-down">
        <p className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Performance History
        </p>
        <h1 className="text-4xl font-black text-slate-100 font-display">Quiz History</h1>
        <p className="text-slate-400 mt-1">Review your past quiz attempts and track improvement.</p>
      </header>

      {/* Search Bar */}
      <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/70 text-slate-100 border border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500/50 transition placeholder-slate-500"
            placeholder="Search by quiz name..."
          />
        </div>
      </div>

      {/* Stats Summary */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-2xl font-black text-slate-100">{attempts.length}</p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Total Attempts</p>
          </div>
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-2xl font-black text-emerald-400">
              {attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + (parseFloat(b.percentage) || 0), 0) / attempts.length) : 0}%
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Average Score</p>
          </div>
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-2xl font-black text-teal-300">
              {attempts.length > 0 ? Math.round(Math.max(...attempts.map(a => parseFloat(a.percentage) || 0))) : 0}%
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">Best Score</p>
          </div>
        </div>
      )}

      {/* Attempts List */}
      {filtered.length > 0 ? (
        <div className="space-y-3 stagger-children">
          {filtered.map((attempt, idx) => {
            const pct = parseFloat(attempt.percentage) || 0;
            return (
              <Link
                key={attempt.attempt_id || idx}
                to={`/quiz/result/${attempt.attempt_id}`}
                className="block bg-slate-900/70 rounded-2xl border border-slate-800 hover:border-teal-500/30 shadow-lg hover-lift transition-all group"
              >
                <div className="p-5 flex items-center gap-5">
                  {/* Score Badge */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shrink-0 ${getScoreBg(pct)}`}>
                    <span className={`text-xl font-black ${getScoreColor(pct)}`}>{Math.round(pct)}%</span>
                  </div>

                  {/* Quiz Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-100 text-lg truncate group-hover:text-teal-300 transition-colors">
                      {attempt.quiz_title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {attempt.correct_answers}/{attempt.total_questions} correct
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(attempt.time_taken_minutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(attempt.completed_at)}
                      </span>
                    </div>
                  </div>

                  {/* Performance Label */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${getScoreBg(pct)} ${getScoreColor(pct)}`}>
                      {getPerformanceLabel(pct)}
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </Link>
            );
          })}

          {/* Load More */}
          {hasMore && !search && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-slate-900/70 text-slate-300 border border-slate-800 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                Load More
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24 animate-scale-in">
          <div className="w-20 h-20 bg-slate-900/80 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
            <History className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            {search ? 'No attempts match your search' : 'No quiz history yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
            {search ? 'Try a different search term.' : 'Complete your first quiz to see your history here.'}
          </p>
          {!search && (
            <Link
              to="/quizzes"
              className="inline-flex items-center gap-2 bg-teal-500 text-slate-900 px-6 py-3 rounded-2xl font-bold hover:bg-teal-400 transition-all shadow-lg"
            >
              <Trophy className="w-4 h-4" /> Browse Quizzes
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
