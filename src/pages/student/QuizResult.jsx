import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Trophy, Clock, Target, BookOpen, ArrowLeft, Sparkles,
  TrendingUp, Award, CheckCircle2, XCircle, RotateCcw, Home
} from "lucide-react";

export default function QuizResult() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!result) {
      api.get(`/student/attempt/${attemptId}/result`)
        .then(res => setResult(res.data))
        .catch(() => setError("Failed to load result"))
        .finally(() => setLoading(false));
    }
  }, [attemptId, result]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium">Calculating your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <XCircle className="w-14 h-14 text-rose-400" />
        <p className="text-lg font-bold text-slate-200">{error}</p>
        <button onClick={() => navigate("/dashboard")} className="mt-2 text-teal-400 underline text-sm">Go to Dashboard</button>
      </div>
    );
  }

  const percentageNum = parseFloat(result.percentage) || result.score || 0;
  const isExcellent = percentageNum >= 80;
  const isGood = percentageNum >= 60;
  const performanceLabel = isExcellent ? "Excellent" : isGood ? "Good" : percentageNum >= 40 ? "Average" : "Needs Improvement";
  const performanceEmoji = isExcellent ? "🏆" : isGood ? "👏" : percentageNum >= 40 ? "💪" : "📚";
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (percentageNum / 100) * ringCircumference;

  const getTopicColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-teal-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-5xl mx-auto py-14 px-6 space-y-10 pb-20">

      {/* Hero Header */}
      <div className="text-center space-y-4 animate-fade-in-down">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-300 px-4 py-1.5 rounded-full text-sm font-bold mb-2">
          <Sparkles className="w-4 h-4" /> Quiz Complete
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-100 font-display leading-tight">
          {isExcellent ? "Outstanding!" : isGood ? "Great job!" : percentageNum >= 40 ? "Good effort!" : "Keep practicing!"}
        </h1>
        <p className="text-slate-400 font-medium text-lg">{result.quiz_title}</p>
      </div>

      {/* Score Ring + Stats */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10 animate-scale-in">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Circular Score Ring */}
          <div className="relative shrink-0">
            <svg width="160" height="160" className="drop-shadow-xl">
              <circle cx="80" cy="80" r={ringRadius} stroke="#1e293b" strokeWidth="10" fill="none" />
              <circle
                cx="80" cy="80" r={ringRadius}
                stroke={isExcellent ? '#10b981' : isGood ? '#14b8a6' : percentageNum >= 40 ? '#f59e0b' : '#f43f5e'}
                strokeWidth="10" fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-all duration-[1.5s] ease-out"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-100">{Math.round(percentageNum)}%</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">accuracy</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-6 w-full">
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-center">
              <Trophy className="w-5 h-5 text-teal-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-slate-100">{result.score}</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">Score</p>
            </div>
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-slate-100">{result.correct_answers}<span className="text-base text-slate-500">/{result.total_questions}</span></p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">Correct</p>
            </div>
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-center">
              <Clock className="w-5 h-5 text-sky-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-slate-100">{(result.time_taken_minutes || 0).toFixed(1)}<span className="text-sm text-slate-500">m</span></p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">Time</p>
            </div>
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-center">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-lg font-black text-slate-100">{performanceEmoji}</p>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">{performanceLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Performance */}
      {result.topic_performance && result.topic_performance.length > 0 && (
        <div className="bg-slate-900/80 p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-500/10 rounded-xl"><TrendingUp className="w-5 h-5 text-teal-400" /></div>
            <h2 className="text-xl font-black text-slate-100 font-display">Topic Breakdown</h2>
          </div>
          <div className="space-y-4">
            {result.topic_performance.map((topic, idx) => {
              const pct = parseFloat(topic.percentage) || topic.accuracy || 0;
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-sm text-slate-200">{topic.topic}</span>
                    <span className={`text-sm font-black ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-teal-300' : pct >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getTopicColor(pct)} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-teal-500/10 to-sky-500/5 p-8 md:p-10 rounded-3xl shadow-xl border border-teal-500/20 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-teal-400/10 rounded-xl"><Sparkles className="w-5 h-5 text-teal-300" /></div>
            <h2 className="text-xl font-black text-slate-100 font-display">AI Recommendations</h2>
          </div>
          <div className="space-y-3">
            {result.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-slate-900/40 p-4 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-black text-teal-300">{idx + 1}</span>
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-500 text-slate-900 rounded-2xl font-bold hover:bg-teal-400 transition-all shadow-lg shadow-teal-900/20 active:scale-[0.97]"
        >
          <Home className="w-4 h-4" /> Back to Dashboard
        </button>
        <Link
          to="/quizzes"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-slate-800 text-slate-200 rounded-2xl font-bold hover:bg-slate-700 transition-all border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" /> Take Another Quiz
        </Link>
      </div>
    </div>
  );
}
