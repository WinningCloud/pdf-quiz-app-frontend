import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Trash2, Send, ChevronLeft, 
  CheckCircle, AlertCircle, Loader2,
  FileText, Check, Save
} from 'lucide-react';

export default function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const res = await api.get(`/admin/quiz/${id}`);
        setQuiz(res.data);
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [id]);

  const handleUpdateQuestion = async (qId, updatedFields) => {
    setIsSaving(true);
    try {
      await api.put(`/admin/question/${qId}`, updatedFields);
      setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updatedFields } : q));
      setTimeout(() => setIsSaving(false), 500); // Visual feedback delay
    } catch (err) {
      alert("Failed to save changes.");
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Permanently delete this question?")) return;
    try {
      await api.delete(`/admin/question/${qId}`);
      setQuestions(prev => prev.filter(q => q.id !== qId));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Publishing will make this quiz visible to all students. Continue?")) return;
    setIsPublishing(true);
    try {
      await api.post(`/admin/quiz/${id}/publish`);
      alert("Quiz is now Live!");
      navigate('/admin/quizzes');
    } catch (err) {
      alert("Publishing failed.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <h2 className="text-slate-900 font-bold text-lg">Loading Assessment...</h2>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-8 animate-fade-in pb-32">
      {/* Top Floating Header */}
      <div className="sticky top-4 z-30 flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50">
        <button 
          onClick={() => navigate('/admin/quizzes')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all px-4 py-2 rounded-xl hover:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        
        <div className="flex items-center gap-6">
          {isSaving && (
            <span className="flex items-center gap-2 text-indigo-600 text-xs font-bold animate-pulse">
              <Save className="w-4 h-4" /> Syncing...
            </span>
          )}
          <button 
            onClick={handlePublish}
            disabled={isPublishing || questions.length === 0 || quiz?.status === 'published'}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black flex items-center gap-3 hover:bg-indigo-600 shadow-xl transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {quiz?.status === 'published' ? <CheckCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            {quiz?.status === 'published' ? 'Already Published' : 'Publish to Students'}
          </button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
             <FileText className="w-3.5 h-3.5" /> AI Generated Resource
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{quiz?.title}</h1>
          <p className="text-slate-400 mt-4 text-xl font-medium max-w-2xl leading-relaxed">{quiz?.description}</p>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-10 mt-12">
        <div className="flex items-center gap-4 px-4">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Total {questions.length} Items</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        {questions.map((q, idx) => (
          <QuestionCard 
            key={q.id} 
            q={q} 
            index={idx} 
            onUpdate={handleUpdateQuestion} 
            onDelete={handleDeleteQuestion}
          />
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200">
          <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-slate-900 font-bold text-xl">Assessment is Empty</h3>
          <p className="text-slate-400 mt-1">Wait for AI generation or try uploading a different PDF.</p>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ q, index, onUpdate, onDelete }) {
  // Parse options safely
  const parseOptions = (data) => {
    if (!data) return {};
    if (typeof data === 'object') return data;
    try { return JSON.parse(data); } catch { return {}; }
  };

  const options = parseOptions(q.options);
  const isMCQ = Object.keys(options).length > 0;

  return (
    <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 hover:border-indigo-300 transition-all group relative">
      {/* Question Badge */}
      <div className="absolute -left-4 top-10 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-slate-900/20 group-hover:bg-indigo-600 transition-colors">
        {index + 1}
      </div>

      <div className="flex justify-between items-start mb-8 pl-8">
        <div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Level: {q.difficulty}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type: {isMCQ ? "Multiple Choice" : "Open Response"}</span>
        </div>
        <button 
          onClick={() => onDelete(q.id)} 
          className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <textarea
        className="w-full text-2xl font-black text-slate-800 border-none p-0 focus:ring-0 resize-none bg-transparent mb-10 leading-[1.3] placeholder:text-slate-200 pl-8"
        defaultValue={q.question_text}
        onBlur={(e) => onUpdate(q.id, { question_text: e.target.value })}
        rows={2}
      />

      {isMCQ ? (
        <div className="grid md:grid-cols-2 gap-6 pl-8">
          {Object.entries(options).map(([key, value]) => {
            const isCorrect = q.correct_answer === key || q.correct_answer === value;

            return (
              <div 
                key={key} 
                className={`flex items-center gap-4 p-6 rounded-[1.5rem] border-2 transition-all ${
                  isCorrect ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-100' : 'border-slate-50 bg-slate-50'
                }`}
              >
                {/* Clicking the letter circle changes the correct answer */}
                <button 
                  onClick={() => onUpdate(q.id, { correct_answer: key })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${
                    isCorrect ? 'bg-emerald-500 text-white rotate-[360deg]' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {isCorrect ? <Check className="w-5 h-5" /> : key}
                </button>
                <input 
                  className="bg-transparent border-none p-0 flex-1 text-sm font-bold text-slate-700 outline-none"
                  defaultValue={value}
                  onBlur={(e) => {
                    const newOptions = { ...options, [key]: e.target.value };
                    onUpdate(q.id, { options: JSON.stringify(newOptions) });
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4 pl-8">
          <div className="flex items-center gap-2 text-emerald-600">
             <CheckCircle className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Target Answer</span>
          </div>
          <div className="p-8 bg-emerald-50/30 border-2 border-emerald-500/10 rounded-[2rem]">
             <textarea 
                className="w-full bg-transparent border-none p-0 text-emerald-900 font-bold outline-none resize-none leading-relaxed text-lg"
                defaultValue={q.correct_answer}
                rows={3}
                onBlur={(e) => onUpdate(q.id, { correct_answer: e.target.value })}
             />
          </div>
        </div>
      )}

      {q.explanation && (
        <div className="mt-10 mx-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
          <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">AI Explanation</span>
            <p className="text-sm text-slate-600 font-medium leading-relaxed italic">{q.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}