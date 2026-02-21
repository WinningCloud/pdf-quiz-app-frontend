import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  ChevronLeft, BarChart3, Users, BookOpen, Trophy, TrendingUp,
  Loader2, Medal, Target
} from 'lucide-react';

export default function ClassroomAnalytics() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [aRes, cRes] = await Promise.all([
          api.get(`/mentor/classrooms/${classroomId}/analytics`),
          api.get(`/mentor/classrooms/${classroomId}`),
        ]);
        setAnalytics(aRes.data);
        setClassroom(cRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [classroomId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-teal-400" size={32}/></div>;
  if (!analytics) return <div className="text-center py-20 text-slate-400">Failed to load analytics</div>;

  const { students, class_average, total_attempts, quiz_stats } = analytics;

  return (
    <div>
      <button onClick={() => navigate(`/admin/classroom/${classroomId}`)} className="flex items-center gap-1 text-slate-400 hover:text-white mb-4 font-medium text-sm">
        <ChevronLeft size={18}/> Back to Classroom
      </button>

      <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3 mb-6">
        <BarChart3 className="text-teal-400" size={26}/> {classroom?.name} — Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Students" value={students.length} color="teal"/>
        <StatCard icon={Target} label="Class Average" value={`${class_average}%`} color="emerald"/>
        <StatCard icon={BookOpen} label="Total Attempts" value={total_attempts} color="sky"/>
        <StatCard icon={Trophy} label="Quizzes Shared" value={quiz_stats.length} color="amber"/>
      </div>

      {/* Student Leaderboard */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Medal size={16}/> Student Performance
        </h2>
        {students.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No student data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-slate-800">
                  <th className="text-left py-3 px-3">#</th>
                  <th className="text-left py-3 px-3">Student</th>
                  <th className="text-left py-3 px-3">Email</th>
                  <th className="text-center py-3 px-3">Attempts</th>
                  <th className="text-center py-3 px-3">Quizzes</th>
                  <th className="text-center py-3 px-3">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3">
                      {i < 3 ? (
                        <span className={`text-sm font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-amber-600'}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                        </span>
                      ) : <span className="text-xs text-slate-500">{i + 1}</span>}
                    </td>
                    <td className="py-3 px-3 font-bold text-sm text-slate-200">{s.full_name || s.username}</td>
                    <td className="py-3 px-3 text-xs text-slate-400">{s.email}</td>
                    <td className="py-3 px-3 text-center text-sm text-slate-300">{s.attempts}</td>
                    <td className="py-3 px-3 text-center text-sm text-slate-300">{s.quizzes_attempted}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                        s.average_score >= 80 ? 'bg-emerald-900/40 text-emerald-400' :
                        s.average_score >= 50 ? 'bg-amber-900/40 text-amber-400' :
                        'bg-red-900/40 text-red-400'
                      }`}>{s.average_score}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Per-Quiz Stats */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={16}/> Quiz-wise Performance
        </h2>
        {quiz_stats.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No quiz data yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {quiz_stats.map(q => (
              <div key={q.quiz_id} className="p-4 bg-slate-800/50 rounded-xl">
                <div className="font-bold text-sm text-slate-200 mb-2 truncate">{q.title}</div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{q.students_attempted} students</span>
                  <span>{q.attempts} attempts</span>
                  <span className={`font-bold ${q.average_score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{q.average_score}% avg</span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${q.average_score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${q.average_score}%` }}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <Icon size={20} className="mb-2"/>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-70 font-medium">{label}</div>
    </div>
  );
}
