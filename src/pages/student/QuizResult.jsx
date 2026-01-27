import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Trophy, Clock, Target, BookOpen, ArrowLeft } from "lucide-react";

export default function QuizResult() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  // If user refreshed, fetch result again
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
      <div className="h-screen flex items-center justify-center text-indigo-600 font-bold">
        Loading results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const percentageNum = parseFloat(result.percentage);

  return (
    <div className="max-w-5xl mx-auto py-14 px-6 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="bg-indigo-100 p-4 rounded-full">
            <Trophy className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-slate-900">Quiz Completed</h1>
        <p className="text-slate-500 font-medium">{result.quiz_title}</p>
      </div>

      {/* Score Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-10 grid md:grid-cols-3 gap-8 text-center">
        
        <div>
          <h2 className="text-sm uppercase text-slate-400 font-bold tracking-widest">Score</h2>
          <p className="text-4xl font-black text-indigo-600 mt-2">{result.score}</p>
        </div>

        <div>
          <h2 className="text-sm uppercase text-slate-400 font-bold tracking-widest">Accuracy</h2>
          <p className="text-4xl font-black mt-2">{result.percentage}</p>
        </div>

        <div>
          <h2 className="text-sm uppercase text-slate-400 font-bold tracking-widest">Correct Answers</h2>
          <p className="text-4xl font-black mt-2">{result.correct_answers} / {result.total_questions}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid md:grid-cols-2 gap-6">
        
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <Clock className="text-indigo-600" />
          <div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Time Taken</p>
            <p className="text-xl font-bold text-slate-900">{result.time_taken_minutes.toFixed(1)} minutes</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <Target className="text-indigo-600" />
          <div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Performance Level</p>
            <p className="text-xl font-bold text-slate-900">
              {percentageNum >= 80 ? "Excellent" :
               percentageNum >= 60 ? "Good" :
               percentageNum >= 40 ? "Average" : "Needs Improvement"}
            </p>
          </div>
        </div>

      </div>

      {/* Topic Performance */}
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-indigo-600" />
          <h2 className="text-xl font-black text-slate-900">Topic Performance</h2>
        </div>

        <div className="space-y-4">
          {result.topic_performance.map((topic, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-50 px-6 py-4 rounded-xl">
              <span className="font-bold text-slate-700">{topic.topic}</span>
              <span className="text-indigo-600 font-black">{topic.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-indigo-600 text-white p-10 rounded-3xl shadow-xl">
        <h2 className="text-xl font-black mb-4">Recommended Next Steps</h2>
        <ul className="space-y-2 list-disc list-inside text-indigo-100">
          {result.recommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* Back Button */}
      <div className="text-center pt-6">
        <button
          onClick={() => navigate("/student")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
