import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import {
  Search, BookOpen, Clock, BarChart3, ChevronRight, Zap,
  FileText, Filter, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';

export default function AvailableQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, attempted, new

  useEffect(() => {
    api.get('/student/quizzes/available')
      .then(res => setQuizzes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = quizzes.filter(q => {
    const matchSearch = !search || q.title?.toLowerCase().includes(search.toLowerCase()) || q.description?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'attempted') return matchSearch && q.attempt_count > 0;
    if (filter === 'new') return matchSearch && (!q.attempt_count || q.attempt_count === 0);
    return matchSearch;
  });

  const getDifficultyColor = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d === 'hard') return 'bg-rose-500/15 text-rose-300';
    if (d === 'easy') return 'bg-emerald-500/15 text-emerald-300';
    return 'bg-teal-500/15 text-teal-300';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-52 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <header className="animate-fade-in-down">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Quiz Library
            </p>
            <h1 className="text-4xl font-black text-slate-100 font-display">Ready to learn?</h1>
            <p className="text-slate-400 mt-1">{quizzes.length} quizzes available for you</p>
          </div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/70 text-slate-100 border border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500/50 transition placeholder-slate-500"
            placeholder="Search quizzes by name or topic..."
          />
        </div>
        <div className="flex gap-2">
          {['all', 'new', 'attempted'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-teal-500 text-slate-900 shadow-lg shadow-teal-900/30' : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'}`}
            >
              {f === 'all' ? 'All' : f === 'new' ? 'New' : 'Attempted'}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
          {filtered.map((quiz, idx) => (
            <div
              key={quiz.id}
              className="bg-slate-900/70 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden hover-lift card-glow group flex flex-col"
            >
              {/* Card top accent */}
              <div className="h-1.5 bg-gradient-to-r from-teal-500 via-sky-400 to-indigo-400" />

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty || 'Normal'}
                  </span>
                  {quiz.attempt_count > 0 && (
                    <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Attempted
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400 group-hover:scale-110 transition-transform shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 leading-snug line-clamp-2">{quiz.title}</h3>
                </div>

                <p className="text-slate-400 text-sm mb-5 flex-1 line-clamp-2">{quiz.description || 'Test your knowledge with this AI-generated quiz.'}</p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{quiz.total_questions} Q</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />~{(quiz.total_questions || 5) * 2}m</span>
                  {quiz.best_score !== undefined && quiz.best_score !== null && (
                    <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" />Best: {Math.round(quiz.best_score)}%</span>
                  )}
                </div>

                <Link
                  to={`/quiz/${quiz.id}`}
                  className="w-full bg-teal-500 text-slate-900 py-3 rounded-xl font-bold text-center hover:bg-teal-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20 active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4" /> {quiz.attempt_count > 0 ? 'Retake Quiz' : 'Start Quiz'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 animate-scale-in">
          <div className="w-20 h-20 bg-slate-900/80 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            {search ? 'No quizzes match your search' : 'No quizzes available yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            {search ? 'Try a different search term.' : 'New quizzes will appear here once your instructor publishes them.'}
          </p>
        </div>
      )}
    </div>
  );
}