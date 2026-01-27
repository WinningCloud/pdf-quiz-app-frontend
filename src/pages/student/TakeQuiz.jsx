import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Loader2, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch quiz attempt
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await api.get(`/student/quiz/${quizId}`);
        setQuizData(res.data);
      } catch (err) {
        console.error("Quiz load failed:", err);
        setError("Unable to load quiz. Please try again later.");
      }
    };

    loadQuiz();
  }, [quizId]);

  // ✅ Only keep MCQ questions
  const questions = useMemo(() => {
    if (!quizData?.questions) return [];
    return quizData.questions.filter(q => q.question_type === "mcq");
  }, [quizData]);

  // If quiz loaded but no MCQs
  if (quizData && questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
        <AlertCircle className="w-8 h-8" />
        <p>This quiz has no multiple choice questions.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  // ✅ Safe option parser
  const getOptions = (raw) => {
    try {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "string") return JSON.parse(raw);
      return Object.values(raw); // fallback if backend sends object
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

      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setSelectedOption(null);
        setSubmitting(false);
      } else {
        const result = await api.post(
          `/student/attempt/${quizData.attempt_id}/complete`
        );
        navigate(`/quiz/result/${quizData.attempt_id}`, { state: result.data });
      }
    } catch (err) {
      console.error("Answer submission failed:", err);
      alert("Failed to save answer.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex justify-between text-sm font-semibold text-indigo-600 mb-2">
          <span>
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
          {currentQuestion.question_text}
        </h1>

        <div className="space-y-4">
          {options.map((text, index) => {
            const letter = String.fromCharCode(65 + index);
            const active = selectedOption === text;

            return (
              <button
                key={index}
                onClick={() => setSelectedOption(text)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  active
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {letter}
                  </div>
                  <span
                    className={`font-medium ${
                      active ? "text-indigo-900" : "text-slate-700"
                    }`}
                  >
                    {text}
                  </span>
                </div>

                {active && <CheckCircle className="w-6 h-6 text-indigo-600" />}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!selectedOption || submitting}
          className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 disabled:bg-slate-200 transition flex justify-center items-center gap-2"
        >
          {submitting ? (
            <Loader2 className="animate-spin" />
          ) : currentIdx === questions.length - 1 ? (
            "Finish Quiz"
          ) : (
            "Next Question"
          )}
          {!submitting && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
