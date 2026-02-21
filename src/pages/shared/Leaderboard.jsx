import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { Trophy, ChevronDown, Crown, Star, Users, Flame, TrendingUp, Zap } from 'lucide-react';

/* ─── Deterministic avatar gradient from name ─── */
const AVATAR_GRADIENTS = [
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-cyan-500 to-teal-600',
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-600',
  'from-fuchsia-500 to-pink-600',
  'from-sky-500 to-blue-600',
  'from-lime-500 to-emerald-600',
  'from-red-500 to-rose-600',
];
function nameGradient(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

/* ─── Helper: get avatar URL ─── */
function avatarUrl(pic) {
  if (!pic) return null;
  if (pic.startsWith('http')) return pic;
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  return `${base}${pic}`;
}

/* ─── Stat Pill ─── */
function StatPill({ label, value, accent = false }) {
  return (
    <div className="text-center px-2">
      <div className={`text-sm font-black tabular-nums ${accent ? 'text-white' : 'text-slate-200'}`}>
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">{label}</div>
    </div>
  );
}

/* ─── Avatar component ─── */
function Avatar({ entry, size = 'md' }) {
  const dim = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  const ringDim = size === 'lg' ? 'ring-[3px]' : 'ring-2';
  const ringColor = entry.rank === 1 ? 'ring-yellow-400/60' : entry.rank === 2 ? 'ring-slate-300/50' : entry.rank === 3 ? 'ring-amber-500/50' : 'ring-slate-600/40';
  const url = avatarUrl(entry.profile_picture);

  return url ? (
    <img src={url} alt="" className={`${dim} rounded-full object-cover ${ringDim} ${ringColor}`} />
  ) : (
    <div className={`${dim} rounded-full bg-gradient-to-br ${nameGradient(entry.name)} flex items-center justify-center font-bold text-white ${ringDim} ${ringColor} shadow-lg`}>
      {(entry.name || '?')[0].toUpperCase()}
    </div>
  );
}

/* ─── Rank badge ─── */
function RankBadge({ rank }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20"><Crown size={16} className="text-yellow-900" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/20"><Crown size={16} className="text-slate-700" /></div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/20"><Crown size={16} className="text-amber-200" /></div>;
  return <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-xs font-black text-slate-400">{rank}</div>;
}

/* ─── Top-3 Podium Card ─── */
function PodiumCard({ entry, place, isMe }) {
  const configs = {
    1: { height: 'h-36', glow: 'shadow-yellow-500/10', border: 'border-yellow-500/30', accentText: 'text-yellow-400', bg: 'from-yellow-500/8 via-amber-500/5 to-transparent', crown: 'text-yellow-400', order: 'order-2', translate: '-translate-y-4' },
    2: { height: 'h-28', glow: 'shadow-slate-400/10', border: 'border-slate-400/20', accentText: 'text-slate-300', bg: 'from-slate-400/8 via-slate-400/3 to-transparent', crown: 'text-slate-300', order: 'order-1', translate: '' },
    3: { height: 'h-24', glow: 'shadow-amber-600/10', border: 'border-amber-600/20', accentText: 'text-amber-500', bg: 'from-amber-600/8 via-amber-600/3 to-transparent', crown: 'text-amber-500', order: 'order-3', translate: '' },
  };
  const c = configs[place];
  return (
    <div className={`${c.order} ${c.translate} flex flex-col items-center group`}>
      <div className={`relative w-full rounded-2xl border ${c.border} bg-gradient-to-b ${c.bg} backdrop-blur-sm p-5 pt-10 flex flex-col items-center shadow-2xl ${c.glow} transition-all duration-300 hover:scale-[1.02]`}>
        {/* Floating rank */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className={`w-8 h-8 rounded-full bg-slate-900 border-2 ${c.border} flex items-center justify-center text-xs font-black ${c.accentText}`}>
            {place}
          </div>
        </div>
        {/* Avatar */}
        <div className="relative mb-3">
          <Avatar entry={entry} size="lg" />
          {place === 1 && <Crown size={18} className="absolute -top-2 -right-1 text-yellow-400 drop-shadow-lg" />}
        </div>
        {/* Name */}
        <span className={`text-sm font-bold truncate max-w-[120px] ${isMe ? 'text-teal-300' : 'text-slate-100'}`}>
          {entry.name}
        </span>
        {isMe && <span className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">You</span>}
        {/* Score */}
        <div className={`text-2xl font-black mt-2 ${c.accentText}`}>
          {entry.average_score}<span className="text-sm">%</span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-0.5"><Flame size={10} /> {entry.best_score}% best</span>
          <span className="flex items-center gap-0.5"><Zap size={10} /> {entry.attempts} quizzes</span>
        </div>
      </div>
      {/* Podium bar */}
      <div className={`w-full ${c.height} rounded-b-xl bg-gradient-to-b from-slate-800/60 to-slate-900/40 border-x border-b ${c.border} -mt-2 flex items-end justify-center pb-3`}>
        <span className={`text-3xl font-black ${c.accentText} opacity-20`}>{place}</span>
      </div>
    </div>
  );
}

/* ─── Leaderboard Row ─── */
function LeaderboardRow({ entry, isMe, maxScore, index }) {
  const barWidth = maxScore > 0 ? (entry.average_score / maxScore) * 100 : 0;
  const isTop3 = entry.rank <= 3;
  return (
    <div className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 ${
      isMe
        ? 'bg-teal-500/8 border-teal-500/25 ring-1 ring-teal-500/15 hover:bg-teal-500/12'
        : isTop3
          ? 'bg-slate-800/50 border-slate-700/40 hover:bg-slate-800/80'
          : 'bg-slate-900/30 border-slate-800/40 hover:bg-slate-800/40'
    }`} style={{ animationDelay: `${index * 30}ms` }}>
      {/* Rank */}
      <RankBadge rank={entry.rank} />
      {/* Avatar */}
      <Avatar entry={entry} size="md" />
      {/* Name + progress bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold truncate ${isMe ? 'text-teal-300' : 'text-slate-100'}`}>
            {entry.name}
          </span>
          {isMe && <span className="text-[8px] font-black bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}
          {entry.rank === 1 && <span className="text-[8px] font-black bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Champion</span>}
        </div>
        <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              entry.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
              : entry.rank === 2 ? 'bg-gradient-to-r from-slate-300 to-slate-400'
              : entry.rank === 3 ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : 'bg-gradient-to-r from-teal-500 to-cyan-500'
            }`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
      {/* Stats */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <StatPill label="Avg" value={`${entry.average_score}%`} accent={isMe} />
        <div className="w-px h-6 bg-slate-700/50 hidden sm:block" />
        <div className="hidden sm:block"><StatPill label="Best" value={`${entry.best_score}%`} /></div>
        <div className="w-px h-6 bg-slate-700/50 hidden sm:block" />
        <div className="hidden sm:block"><StatPill label="Quizzes" value={entry.attempts} /></div>
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <div className="w-20 h-20 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
        <Trophy size={36} className="text-slate-600" />
      </div>
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-slate-600 mt-1">Start taking quizzes to appear here!</p>
    </div>
  );
}

/* ─── Summary Stats Bar ─── */
function SummaryBar({ data }) {
  const totalAttempts = data.reduce((s, e) => s + e.attempts, 0);
  const avgAll = data.length > 0 ? (data.reduce((s, e) => s + e.average_score, 0) / data.length).toFixed(1) : 0;
  const topScore = data.length > 0 ? Math.max(...data.map(e => e.best_score)) : 0;
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Users, label: 'Participants', value: data.length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        { icon: TrendingUp, label: 'Avg Score', value: `${avgAll}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        { icon: Flame, label: 'Top Score', value: `${topScore}%`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
      ].map(stat => (
        <div key={stat.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${stat.bg}`}>
          <stat.icon size={18} className={stat.color} />
          <div>
            <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Leaderboard() {
  const { user, isAdmin, isMentor } = useContext(AuthContext);
  const [tab, setTab] = useState('general');
  const [generalData, setGeneralData] = useState([]);
  const [classroomData, setClassroomData] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [myId, setMyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classroomLoading, setClassroomLoading] = useState(false);
  const [classroomName, setClassroomName] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (isAdmin || isMentor) {
          const res = await api.get('/mentor/leaderboard');
          setGeneralData(res.data.general_leaderboard || []);
          setClassrooms(res.data.classrooms || []);
          setMyId(res.data.my_id);
        } else {
          const res = await api.get('/student/leaderboard/general');
          setGeneralData(res.data.leaderboard || []);
          setMyId(res.data.my_id);
          try {
            const cr = await api.get('/student/classrooms');
            setClassrooms((cr.data || []).map(c => ({ id: c.id, name: c.name })));
          } catch {}
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin, isMentor]);

  useEffect(() => {
    if (!selectedClassroom) { setClassroomData([]); return; }
    (async () => {
      setClassroomLoading(true);
      try {
        const res = await api.get(`/student/leaderboard/classroom/${selectedClassroom}`);
        setClassroomData(res.data.leaderboard || []);
        setClassroomName(res.data.classroom_name || '');
      } catch (err) {
        console.error('Classroom leaderboard fetch error:', err);
        setClassroomData([]);
      } finally {
        setClassroomLoading(false);
      }
    })();
  }, [selectedClassroom]);

  const activeData = tab === 'general' ? generalData : classroomData;
  const maxScore = activeData.length > 0 ? Math.max(...activeData.map(e => e.average_score)) : 100;
  const top3 = useMemo(() => activeData.filter(e => e.rank <= 3), [activeData]);

  const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-teal-500 animate-spin" />
        <Trophy size={18} className="absolute inset-0 m-auto text-slate-600" />
      </div>
      <p className="text-xs text-slate-500 mt-4">Loading rankings...</p>
    </div>
  );

  const renderList = (data) => (
    <div className="space-y-6">
      {/* Summary */}
      {data.length > 0 && <SummaryBar data={data} />}

      {/* Top-3 Podium */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 items-end pt-6">
          {[2, 1, 3].map(place => {
            const entry = top3.find(e => e.rank === place);
            if (!entry) return null;
            return <PodiumCard key={entry.student_id} entry={entry} place={place} isMe={entry.student_id === myId} />;
          })}
        </div>
      )}

      {/* Full ranked list */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Full Rankings</h3>
          <span className="text-[10px] text-slate-600">{data.length} participants</span>
        </div>
        {data.map((entry, idx) => (
          <LeaderboardRow key={entry.student_id} entry={entry} isMe={entry.student_id === myId} maxScore={maxScore} index={idx} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 p-6">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-teal-500/5" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-yellow-500/8 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-2xl border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
            <Trophy className="text-yellow-400" size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Leaderboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Compete, climb, and conquer the rankings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/60 rounded-2xl p-1.5 border border-slate-800/60">
        {[
          { key: 'general', icon: Star, label: 'General Rankings' },
          { key: 'classroom', icon: Users, label: 'Classroom Rankings' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
              tab === t.key
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === 'general' && (
        loading ? <Spinner /> : generalData.length === 0 ? <EmptyState message="No quiz attempts yet. Be the first on the board!" /> : renderList(generalData)
      )}

      {/* Classroom Tab */}
      {tab === 'classroom' && (
        <div className="space-y-4">
          {classrooms.length === 0 ? (
            <EmptyState message="You are not part of any classrooms yet." />
          ) : (
            <>
              <div className="relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Select Classroom</label>
                <div className="relative">
                  <select
                    value={selectedClassroom || ''}
                    onChange={e => setSelectedClassroom(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-slate-200 text-sm appearance-none focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 cursor-pointer transition"
                  >
                    <option value="">Choose a classroom...</option>
                    {classrooms.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                </div>
              </div>

              {!selectedClassroom ? (
                <div className="text-center py-12">
                  <Users size={32} className="mx-auto text-slate-700 mb-3" />
                  <p className="text-sm text-slate-500">Select a classroom to see its leaderboard</p>
                </div>
              ) : classroomLoading ? (
                <Spinner />
              ) : classroomData.length === 0 ? (
                <EmptyState message="No quiz attempts in this classroom yet." />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <h3 className="text-sm font-bold text-slate-300">{classroomName}</h3>
                  </div>
                  {renderList(classroomData)}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
