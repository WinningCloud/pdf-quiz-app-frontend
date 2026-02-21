import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';
import { 
  Upload, FileText, CheckCircle2, 
  Loader2, Play, RefreshCw, AlertCircle,
  Clock, Check, X, Eye, BookOpen, Hash
} from 'lucide-react';

export default function StudentCreateQuiz() {
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [viewingPdfId, setViewingPdfId] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  
  const navigate = useNavigate();
  const [toast, showToast] = useToast();

  const fetchPdfs = async () => {
    try {
      const res = await api.get('/student/pdf/list');
      setPdfs(res.data);
    } catch (err) {
      console.error("Failed to fetch PDFs");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchPdfs(); }, []);

  useEffect(() => {
    const isProcessing = pdfs.some(p => p.status === 'uploaded' || p.status === 'processing');
    if (isProcessing) {
      const interval = setInterval(fetchPdfs, 3000);
      return () => clearInterval(interval);
    }
  }, [pdfs]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    try {
      await api.post('/student/pdf/upload', formData);
      setTitle(''); 
      setFile(null);
      fetchPdfs();
    } catch (err) {
      showToast('error', "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const openGenerateModal = (pdf) => {
    setShowGenerateModal(pdf);
    setQuizTitle(`Quiz: ${pdf.title}`);
    setQuestionCount(10);
  };

  const handleGenerateQuiz = async () => {
    const pdf = showGenerateModal;
    if (!pdf || !quizTitle.trim()) return;
    
    setGeneratingId(pdf.id);
    setShowGenerateModal(null);
    try {
      await api.post(`/student/quiz/generate/${pdf.id}`, {
        pdf_id: pdf.id,
        title: quizTitle,
        description: `Attempt Quiz: ${quizTitle}`,
        total_questions: questionCount
      });
      navigate('/my-quizzes');
    } catch (err) {
      showToast('error', err.response?.data?.detail || "Could not start quiz generation.");
      setGeneratingId(null);
    }
  };

  const handleViewPdf = async (pdfId) => {
    setViewingPdfId(pdfId);
    setLoadingPdf(true);
    try {
      const res = await api.get(`/student/pdf/${pdfId}/file`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setPdfBlobUrl(url);
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'Failed to load PDF.');
      setViewingPdfId(null);
    } finally {
      setLoadingPdf(false);
    }
  };

  const closePdfViewer = () => {
    setViewingPdfId(null);
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-100 tracking-tight font-display">Create Quiz</h1>
          <p className="text-slate-400 font-medium mt-1">Upload a PDF and generate your own AI-powered quiz.</p>
        </div>
        <button 
          onClick={fetchPdfs} 
          className="p-3 hover:bg-slate-900 hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-slate-800 group"
        >
          <RefreshCw className={`w-5 h-5 text-slate-400 group-hover:text-teal-300 ${loadingList ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Upload Section */}
      <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
        <h3 className="text-xs font-black text-teal-300 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload PDF
        </h3>

        <form onSubmit={handleUpload} className="grid md:grid-cols-3 gap-4 items-end relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Document Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-slate-950 outline-none transition-all font-medium text-sm" 
              placeholder="e.g. Cyber Security Basics" required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">PDF Data Source</label>
            <div className="relative">
              <input 
                type="file" 
                onChange={e => setFile(e.target.files[0])} 
                accept=".pdf" 
                className="w-full text-sm text-slate-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-teal-500 file:text-slate-900 hover:file:bg-teal-400 transition cursor-pointer bg-slate-950/60 rounded-2xl border border-slate-800 pr-4" 
                required 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isUploading} 
            className="bg-teal-500 text-slate-900 px-6 py-3 rounded-xl font-black hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 text-sm"
          >
            {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Start AI Analysis'}
          </button>
        </form>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-slate-900/70 rounded-[2.5rem] border border-slate-800 shadow-2xl shadow-slate-900/40 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800">
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Resource</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">AI Pipeline Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Metadata</th>
              <th className="px-8 py-6 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {pdfs.map(pdf => (
              <tr key={pdf.id} className="hover:bg-slate-900 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-500/15 rounded-2xl flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6"/>
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 text-lg leading-tight">{pdf.title}</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">{pdf.original_filename}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={pdf.status} error={pdf.error_message} />
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{new Date(pdf.created_at).toLocaleDateString()}</span>
                    </div>
                    {pdf.metadata?.page_count && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{pdf.metadata.page_count} pages</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewPdf(pdf.id)}
                      className="p-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-sky-500/20 hover:text-sky-300 transition"
                      title="View PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {pdf.status === 'processed' ? (
                      <button 
                        onClick={() => openGenerateModal(pdf)}
                        disabled={generatingId === pdf.id}
                        className="bg-teal-500 text-slate-900 px-6 py-2.5 rounded-xl text-xs font-black hover:bg-teal-400 transition shadow-lg shadow-teal-900/30 flex items-center gap-2 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500"
                      >
                        {generatingId === pdf.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 fill-current" />
                        )}
                        Generate Quiz
                      </button>
                    ) : pdf.status === 'failed' ? (
                      <div className="text-red-300 p-2 hover:bg-red-500/10 rounded-lg inline-block transition cursor-help" title={pdf.error_message}>
                         <AlertCircle className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 text-slate-300 font-bold text-[10px] uppercase italic">
                         <Loader2 className="w-3 h-3 animate-spin" />
                         Step {pdf.status === 'uploaded' ? '1/3' : '2/3'}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pdfs.length === 0 && !loadingList && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">No PDFs uploaded yet</h3>
            <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm">Upload a textbook or notes to begin generating AI quizzes.</p>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdfId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={closePdfViewer}>
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                PDF Viewer
              </h3>
              <button onClick={closePdfViewer} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-950 flex items-center justify-center">
              {loadingPdf ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                  <span className="text-sm text-slate-400 font-bold">Loading PDF...</span>
                </div>
              ) : pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              ) : (
                <span className="text-slate-500">Failed to load PDF</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Quiz Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={() => setShowGenerateModal(null)}>
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-slate-100">Generate Quiz</h3>
              <p className="text-sm text-slate-400 mt-1">Configure quiz settings for: <span className="text-teal-300 font-bold">{showGenerateModal.title}</span></p>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quiz Title</label>
                <input
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition font-medium"
                  placeholder="Enter quiz title..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" /> Number of Questions
                  </label>
                  <span className="text-2xl font-black text-teal-300">{questionCount}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={e => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-teal-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-teal-900/50"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-600 px-1">
                  <span>5</span>
                  <span>15</span>
                  <span>25</span>
                  <span>35</span>
                  <span>50</span>
                </div>
              </div>

              <div className="flex gap-2">
                {[5, 10, 15, 20, 30].map(n => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                      questionCount === n 
                        ? 'bg-teal-500 text-slate-900' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowGenerateModal(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateQuiz}
                disabled={!quizTitle.trim()}
                className="bg-teal-500 text-slate-900 px-6 py-2.5 rounded-xl text-sm font-black hover:bg-teal-400 transition shadow-lg shadow-teal-900/30 flex items-center gap-2 disabled:bg-slate-800 disabled:text-slate-500"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Generation
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

function StatusBadge({ status, error }) {
  const configs = {
    processed: { color: 'bg-emerald-500/15 text-emerald-200', icon: <Check className="w-3 h-3"/>, label: 'Processed' },
    processing: { color: 'bg-amber-500/15 text-amber-200 animate-pulse', icon: <Loader2 className="w-3 h-3 animate-spin"/>, label: 'AI Thinking' },
    uploaded: { color: 'bg-sky-500/15 text-sky-200', icon: <Clock className="w-3 h-3"/>, label: 'In Queue' },
    failed: { color: 'bg-red-500/15 text-red-200', icon: <AlertCircle className="w-3 h-3"/>, label: 'Error' }
  };

  const config = configs[status] || configs.uploaded;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.color}`}>
      {config.icon}
      {config.label}
    </div>
  );
}
