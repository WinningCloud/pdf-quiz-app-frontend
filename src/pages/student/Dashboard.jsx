import { useEffect, useState, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Trophy, Star, Target, ArrowRight, BookOpen, TrendingUp, Clock,
  Zap, Award, BarChart3, CheckCircle, Brain, Flame, Sparkles,
  ChevronRight, Activity
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [progress, setProgress] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/progress').catch(() => ({ data: null })),
      api.get('/student/recommendations').catch(() => ({ data: [] })),
      api.get('/student/attempts/history?limit=5').catch(() => ({ data: [] })),
    ]).then(([prog, rec, hist]) => {
      setProgress(prog.data);
      setRecommendations(Array.isArray(rec.data) ? rec.data : rec.data?.recommended_quizzes || []);
      setHistory(Array.isArray(hist.data) ? hist.data : []);
      setLoading(false);
    });
  }, []);

  const avgScore = progress?.statistics?.average_score || progress?.average_score || 0;
  const quizzesDone = progress?.statistics?.total_attempts || progress?.quizzes_completed || progress?.total_attempts || 0;
  const topTopic = progress?.strengths?.[0] || progress?.top_topic || 'N/A';
  const streak = progress?.statistics?.consistency_score || progress?.consistency_score || 0;
  const topicMastery = progress?.topic_mastery || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-teal-300';
    if (score >= 40) return 'text-amber-300';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 60) return 'from-teal-500/20 to-teal-500/5';
    if (score >= 40) return 'from-amber-500/20 to-amber-500/5';
    return 'from-rose-500/20 to-rose-500/5';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-12 w-72 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Hero Header */}
      <header className="animate-fade-in-down relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Student Portal
            </p>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-100 font-display">
              {greeting}, {user?.full_name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-slate-400 mt-1">Track your progress and keep learning.</p>
          </div>
          <Link
            to="/quizzes"
            className="hidden md:flex items-center gap-2 bg-teal-500 text-slate-900 px-6 py-3 rounded-2xl font-bold hover:bg-teal-400 transition-all hover-lift shadow-lg shadow-teal-900/30"
          >
            <Zap className="w-5 h-5" /> Start a Quiz
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <StatCard title="Average Score" value={`${Math.round(avgScore)}%`} icon={<Trophy className="w-6 h-6" />} iconColor="text-amber-300" iconBg="bg-amber-500/10" subtitle={avgScore >= 70 ? 'Great performance!' : 'Keep practicing!'} trend={avgScore >= 70} />
        <StatCard title="Quizzes Completed" value={quizzesDone} icon={<CheckCircle className="w-6 h-6" />} iconColor="text-teal-300" iconBg="bg-teal-500/10" subtitle={quizzesDone > 0 ? 'Active learner' : 'Get started!'} trend={quizzesDone > 0} />
        <StatCard title="Best Topic" value={typeof topTopic === 'string' ? (topTopic.length > 15 ? topTopic.slice(0, 15) + 'â€¦' : topTopic) : 'N/A'} icon={<Target className="w-6 h-6" />} iconColor="text-emerald-300" iconBg="bg-emerald-500/10" subtitle="Your strongest area" isText />
        <StatCard title="Consistency" value={`${Math.round(streak)}%`} icon={<Flame className="w-6 h-6" />} iconColor="text-orange-300" iconBg="bg-orange-500/10" subtitle="Study consistency" trend={streak >= 50} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Score Ring + Topic Mastery */}
          <div className="bg-slate-900/70 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in-up card-glow" style={{ animationDelay: '0.15s' }}>
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center justify-center md:min-w-[180px]">
                <div className="relative w-36 h-36">
                  <svg className="w-36 h-36 circular-progress" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(avgScore / 100) * 327} 327`} className="animate-progress" />
                    <defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#38bdf8" /></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-100 number-animate">{Math.round(avgScore)}</span>
                    <span className="text-xs text-slate-400 font-bold">AVG SCORE</span>
                  </div>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-300">{avgScore >= 80 ? 'Excellent!' : avgScore >= 60 ? 'Good job!' : avgScore >= 40 ? 'Keep going!' : 'Practice more'}</p>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-teal-400" /> Topic Mastery</h3>
                {topicMastery.length > 0 ? (
                  <div className="space-y-3">
                    {topicMastery.slice(0, 5).map((topic, idx) => {
                      const pct = topic.accuracy ?? topic.mastery_percentage ?? topic.percentage ?? topic.score ?? 0;
                      return (
                        <div key={idx} className="animate-fade-in-left" style={{ animationDelay: `${idx * 0.1}s` }}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-slate-300 font-medium truncate max-w-[200px]">{topic.topic_name || topic.topic || `Topic ${idx + 1}`}</span>
                            <span className={`text-sm font-bold ${getScoreColor(pct)}`}>{Math.round(pct)}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full animate-progress" style={{ width: `${pct}%`, background: pct >= 70 ? 'linear-gradient(90deg, #14b8a6, #2dd4bf)' : pct >= 40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Complete quizzes to see topic breakdown</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Quiz Attempts */}
          <div className="bg-slate-900/70 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in-up card-glow" style={{ animationDelay: '0.25s' }}>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-100 flex items-center gap-2"><Activity className="w-5 h-5 text-teal-400" /> Recent Attempts</h3>
              <Link to="/quizzes" className="text-teal-300 text-sm font-bold hover:underline flex items-center gap-1">All Quizzes <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="divide-y divide-slate-800">
              {history.length > 0 ? history.slice(0, 4).map((attempt, idx) => {
                const attemptScore = parseFloat(attempt.percentage) || attempt.score || 0;
                return (
                <div key={idx} className="p-5 flex items-center gap-4 hover:bg-slate-900/60 transition group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg bg-gradient-to-br ${getScoreBg(attemptScore)}`}>
                    <span className={getScoreColor(attemptScore)}>{Math.round(attemptScore)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{attempt.quiz_title || 'Quiz'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{attempt.correct_answers}/{attempt.total_questions} correct</span>
                      {attempt.time_taken_minutes && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{attempt.time_taken_minutes.toFixed(1)}m</span>}
                    </div>
                  </div>
                  <Link to={`/quiz/result/${attempt.attempt_id}`} state={attempt} className="text-teal-400 sm:opacity-0 sm:group-hover:opacity-100 transition"><ArrowRight className="w-5 h-5" /></Link>
                </div>
              );
              }) : (
                <div className="py-12 text-center text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No quiz attempts yet</p>
                  <Link to="/quizzes" className="text-teal-400 text-sm font-bold mt-2 inline-block hover:underline">Take your first quiz â†’</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-slate-900/70 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in-right card-glow" style={{ animationDelay: '0.2s' }}>
            <div className="p-6 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-teal-400" /> Recommended for You</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {recommendations.length > 0 ? recommendations.slice(0, 4).map((quiz, idx) => (
                <Link key={quiz.id || idx} to={`/quiz/${quiz.id || quiz.quiz_id}`} className="flex items-center gap-3 p-4 hover:bg-slate-900/60 transition group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-sky-500/20 flex items-center justify-center text-teal-300 group-hover:scale-110 transition"><BookOpen className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">{quiz.title || quiz.quiz_title}</p>
                    <p className="text-xs text-slate-500">{quiz.total_questions || '?'} questions</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition" />
                </Link>
              )) : (
                <div className="py-10 text-center text-slate-500"><Target className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Complete more quizzes for AI recommendations</p></div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500/10 to-sky-500/10 rounded-3xl border border-teal-500/20 p-6 animate-fade-in-right shadow-xl" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-bold text-teal-200 mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/quizzes" className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/40 transition group">
                <BookOpen className="w-5 h-5 text-teal-400" /><span className="text-sm font-bold text-slate-200 group-hover:text-teal-200 transition">Browse Quizzes</span><ChevronRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-teal-400 transition" />
              </Link>
              <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/40 transition group">
                <BarChart3 className="w-5 h-5 text-sky-400" /><span className="text-sm font-bold text-slate-200 group-hover:text-sky-200 transition">View Statistics</span><ChevronRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-sky-400 transition" />
              </Link>
            </div>
          </div>

          {quizzesDone > 0 && (
            <div className="bg-slate-900/70 rounded-3xl border border-slate-800 p-6 text-center animate-scale-in shadow-xl" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center mx-auto mb-3 animate-pulse-glow"><Award className="w-8 h-8 text-amber-300" /></div>
              <h4 className="font-bold text-slate-100 text-sm">{quizzesDone >= 10 ? 'Quiz Master!' : quizzesDone >= 5 ? 'Rising Star!' : 'Getting Started!'}</h4>
              <p className="text-xs text-slate-400 mt-1">{quizzesDone} quizzes completed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, iconColor, iconBg, subtitle, trend, isText }) {
  return (
    <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-xl hover-lift card-glow group">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform`}>{icon}</div>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${trend ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>{trend ? 'â†‘ Good' : 'â†’ Improve'}</span>
        )}
      </div>
      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</h4>
      <p className={`${isText ? 'text-lg' : 'text-2xl'} font-black text-slate-100 mt-0.5 number-animate`}>{value}</p>
      {subtitle && <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}