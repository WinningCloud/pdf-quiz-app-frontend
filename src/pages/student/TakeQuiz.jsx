import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';
import {
  Loader2, ChevronRight, CheckCircle, AlertCircle,
  Clock, Brain, Flag, Zap
} from "lucide-react";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [animating, setAnimating] = useState(false);
  const startTimeRef = useRef(Date.now());
  const [toast, showToast] = useToast();

  // Fetch quiz attempt
  useEffect(() => {
    api.get(`/student/quiz/${quizId}`)
      .then(res => setQuizData(res.data))
      .catch(() => setError("Unable to load quiz. Please try again later."));
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (!quizData) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [quizData]);

  // Only keep MCQ questions
  const questions = useMemo(() => {
    if (!quizData?.questions) return [];
    return quizData.questions.filter(q => q.question_type === "mcq");
  }, [quizData]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (quizData && questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 animate-scale-in">
        <div className="p-4 bg-slate-900/80 rounded-full"><AlertCircle className="w-10 h-10" /></div>
        <p className="text-lg font-bold text-slate-300">No MCQ questions found</p>
        <p className="text-sm text-slate-500">This quiz doesn't have any multiple choice questions.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="font-bold text-slate-200">{error}</p>
        <button onClick={() => navigate("/quizzes")} className="text-teal-400 underline text-sm">Browse quizzes</button>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Loading quiz...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isLast = currentIdx === questions.length - 1;

  // Safe option parser
  const getOptions = (raw) => {
    try {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "string") return JSON.parse(raw);
      return Object.values(raw);
    } catch {
      return [];
    }
  };

  const options = getOptions(currentQuestion.options);

  const handleNext = async () => {
    if (!selectedOption) return;
    setSubmitting(true);

    try {
      await api.post(`/student/attempt/${quizData.attempt_id}/answer`, {
        question_id: currentQuestion.id,
        selected_option: selectedOption,
      });

      if (!isLast) {
        setAnimating(true);
        setTimeout(() => {
          setCurrentIdx(prev => prev + 1);
          setSelectedOption(null);
          setSubmitting(false);
          setAnimating(false);
        }, 250);
      } else {
        const result = await api.post(`/student/attempt/${quizData.attempt_id}/complete`);
        navigate(`/quiz/result/${quizData.attempt_id}`, { state: result.data });
      }
    } catch {
      showToast('error', "Failed to save answer. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">

      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900/70 px-5 py-3 rounded-2xl border border-slate-800 animate-fade-in-down">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
          <Brain className="w-4 h-4 text-teal-400" />
          <span className="hidden sm:inline">{quizData.quiz_title || 'Quiz'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-400" /> {formatTime(elapsed)}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {currentIdx + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="animate-fade-in">
        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 px-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-sky-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Dot indicators */}
        <div className="flex gap-1 mt-3 justify-center flex-wrap">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < currentIdx ? 'bg-teal-500' :
                i === currentIdx ? 'bg-teal-400 scale-125 ring-2 ring-teal-400/30' :
                'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className={`bg-slate-900/80 p-4 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-800 transition-all duration-300 ${animating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0 animate-fade-in-up'}`}>

        <div className="flex items-center gap-2 text-xs text-teal-400 font-bold uppercase tracking-widest mb-4">
          <Zap className="w-3.5 h-3.5" /> Question {currentIdx + 1}
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-100 mb-8 leading-relaxed font-display">
          {currentQuestion.question_text}
        </h1>

        <div className="space-y-3">
          {options.map((text, index) => {
            const letter = String.fromCharCode(65 + index);
            const active = selectedOption === text;

            return (
              <button
                key={index}
                onClick={() => !submitting && setSelectedOption(text)}
                className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  active
                    ? "border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-900/10"
                    : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                    active ? "bg-teal-500 text-slate-900 scale-110" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                  }`}>
                    {letter}
                  </div>
                  <span className={`font-medium text-sm md:text-base ${active ? "text-teal-100" : "text-slate-300"}`}>
                    {text}
                  </span>
                </div>
                {active && <CheckCircle className="w-5 h-5 text-teal-300 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Next / Finish Button */}
        <button
          onClick={handleNext}
          disabled={!selectedOption || submitting}
          className="mt-8 w-full bg-teal-500 text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex justify-center items-center gap-2 shadow-lg shadow-teal-900/20 active:scale-[0.98]"
        >
          {submitting ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : isLast ? (
            <><Flag className="w-5 h-5" /> Finish Quiz</>
          ) : (
            <>Next Question <ChevronRight className="w-5 h-5" /></>
          )}
        </button>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
