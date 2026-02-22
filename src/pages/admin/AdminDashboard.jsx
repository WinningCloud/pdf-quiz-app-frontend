import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  Users, FileText, ClipboardCheck, Activity, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Sparkles, BarChart3, Zap, School, BookOpen, Target
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMentor = user?.is_mentor && !user?.is_admin;

  useEffect(() => {
    const endpoint = isMentor ? '/mentor/overview' : '/admin/analytics/overview';
    api.get(endpoint)
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isMentor]);

  if (loading) return (
    <div className="space-y-8">
      <div className="h-10 w-64 skeleton rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {[1,2,3,4].map(i => <div key={i} className="h-36 skeleton rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-72 skeleton rounded-3xl" />
        <div className="h-72 skeleton rounded-3xl" />
      </div>
    </div>
  );

  const cards = isMentor ? [
    { title: "My Classrooms", value: stats?.total_classrooms || 0, icon: <School className="w-6 h-6" />, color: "text-teal-400", bg: "bg-teal-500/10", trend: "Active" },
    { title: "Total Students", value: stats?.total_students || 0, icon: <Users className="w-6 h-6" />, color: "text-sky-400", bg: "bg-sky-500/10", trend: "Enrolled" },
    { title: "Quizzes Shared", value: stats?.total_quizzes || 0, icon: <BookOpen className="w-6 h-6" />, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "Published" },
    { title: "Quiz Attempts", value: stats?.total_attempts || 0, icon: <Activity className="w-6 h-6" />, color: "text-amber-400", bg: "bg-amber-500/10", trend: "Engagement" },
  ] : [
    { title: "Total Students", value: stats?.total_users || 0, icon: <Users className="w-6 h-6" />, color: "text-teal-400", bg: "bg-teal-500/10", trend: "Active learning" },
    { title: "PDFs Processed", value: stats?.total_pdfs || 0, icon: <FileText className="w-6 h-6" />, color: "text-sky-400", bg: "bg-sky-500/10", trend: "AI pipeline" },
    { title: "Quizzes Generated", value: stats?.total_quizzes || 0, icon: <ClipboardCheck className="w-6 h-6" />, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "Auto-generated" },
    { title: "Total Attempts", value: stats?.total_attempts || 0, icon: <Activity className="w-6 h-6" />, color: "text-amber-400", bg: "bg-amber-500/10", trend: "Engagement" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="animate-fade-in-down">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <p className="text-sm font-bold text-teal-400 uppercase tracking-widest">{isMentor ? 'Mentor Dashboard' : 'Control Center'}</p>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-100 font-display">{isMentor ? 'Classroom Overview' : 'System Overview'}</h1>
        <p className="text-slate-400 mt-1">{isMentor ? 'Monitor your classrooms, students, and quiz performance.' : 'Monitor platform activity and AI generation status.'}</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-xl hover-lift card-glow group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${card.bg} rounded-2xl ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <span className="text-[9px] font-black text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {card.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">{card.title}</p>
            <p className="text-3xl font-black text-slate-100">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900/70 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> Recent Activity
            </h3>
            <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full uppercase">Live</span>
          </div>
          <div className="divide-y divide-slate-800">
            {(Array.isArray(stats?.recent_activity) && stats.recent_activity.length > 0) ? stats.recent_activity.map((activity, idx) => (
              <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-900/50 transition group">
                <div className={`p-2.5 rounded-xl ${activity.type === 'success' ? 'bg-emerald-500/10' : activity.type === 'quiz' ? 'bg-sky-500/10' : 'bg-teal-500/10'} group-hover:scale-105 transition-transform`}>
                  {activity.type === 'success' ? 
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : 
                    activity.type === 'quiz' ? <ClipboardCheck className="w-5 h-5 text-sky-300" /> :
                    <TrendingUp className="w-5 h-5 text-teal-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{activity.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.time_ago}</p>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <BarChart3 className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No recent activity yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: mentor classroom list OR admin AI status */}
        {isMentor ? (
          <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <School className="w-4 h-4 text-teal-400" /> My Classrooms
            </h3>
            {stats?.classrooms?.length > 0 ? (
              <div className="space-y-2">
                {stats.classrooms.map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/admin/classroom/${c.id}`)}
                    className="w-full text-left p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition border border-slate-700/50 group"
                  >
                    <p className="text-sm font-bold text-slate-200 group-hover:text-teal-300 transition">{c.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.member_count}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {c.quiz_count} quizzes</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <School className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No classrooms yet</p>
                <button onClick={() => navigate('/admin/classrooms')} className="mt-2 text-xs text-teal-400 hover:text-teal-300 font-bold">
                  Create one â†’
                </button>
              </div>
            )}
            {stats?.average_score > 0 && (
              <div className="pt-4 border-t border-slate-800">
                <div className="bg-gradient-to-br from-teal-500/10 to-sky-500/5 p-4 rounded-2xl border border-teal-500/15">
                  <h4 className="text-teal-300 font-bold text-sm mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Class Average
                  </h4>
                  <p className="text-2xl font-black text-slate-100">{stats.average_score}%</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stats.completed_attempts} completed attempts</p>
                </div>
              </div>
            )}
          </div>
        ) : (
        <div className="bg-slate-900/70 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-400" /> AI Pipeline Status
          </h3>
          <div className="space-y-4">
            <StatusIndicator label="PDF Embedding Engine" status="Operational" />
            <StatusIndicator label="LLM Question Generator" status="Operational" />
            <StatusIndicator label="Vector Database" status="Operational" />
            <StatusIndicator label="Background Workers" status="Idle" isIdle />
          </div>
          
          <div className="pt-5 border-t border-slate-800">
            <div className="bg-gradient-to-br from-teal-500/10 to-sky-500/5 p-4 rounded-2xl border border-teal-500/15">
              <h4 className="text-teal-300 font-bold text-sm mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quick Tip
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Review AI-generated questions before publishing. Edit or remove low-quality items in the Quiz Editor.
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ label, status, isIdle }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isIdle ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'}`}></div>
        <span className={`text-xs font-bold ${isIdle ? 'text-slate-500' : 'text-emerald-300'}`}>{status}</span>
      </div>
    </div>
  );
}