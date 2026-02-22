import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import { 
  ClipboardList, Plus, Search, Eye, Send, Trash2, 
  Loader2, XCircle, ArchiveRestore, BarChart3,
  Share2, Link2, Copy, CheckCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [publishingId, setPublishingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [unpublishingId, setUnpublishingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, showToast] = useToast();
  const [confirm, setConfirm] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/admin/quiz/list');
      setQuizzes(res.data);
    } catch {
      console.error("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  // Poll for generating quizzes progress
  useEffect(() => {
    const hasGenerating = quizzes.some(q => q.status === 'generating');
    if (hasGenerating) {
      const interval = setInterval(fetchQuizzes, 3000);
      return () => clearInterval(interval);
    }
  }, [quizzes]);

  const handlePublish = async (quizId) => {
    setConfirm({
      title: 'Publish Quiz',
      message: 'Make this quiz live for all students?',
      confirmText: 'Publish',
      onConfirm: async () => {
        setConfirm(null);
        setPublishingId(quizId);
        try {
          await api.post(`/admin/quiz/${quizId}/publish`);
          showToast('success', 'Quiz published successfully');
          fetchQuizzes();
        } catch {
          showToast('error', 'Publish failed. Ensure all questions have answers.');
        } finally {
          setPublishingId(null);
        }
      },
    });
  };

  const handleUnpublish = async (quizId) => {
    setConfirm({
      title: 'Unpublish Quiz',
      message: 'Unpublish this quiz? Students will no longer be able to access it.',
      confirmText: 'Unpublish',
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        setUnpublishingId(quizId);
        try {
          await api.post(`/admin/quiz/${quizId}/unpublish`);
          showToast('success', 'Quiz unpublished');
          fetchQuizzes();
        } catch (err) {
          showToast('error', err.response?.data?.detail || 'Unpublish failed.');
        } finally {
          setUnpublishingId(null);
        }
      },
    });
  };

  const handleDelete = async (quizId) => {
    setConfirm({
      title: 'Delete Quiz',
      message: 'Permanently delete this quiz and all its questions? This cannot be undone.',
      confirmText: 'Delete',
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        setDeletingId(quizId);
        try {
          await api.delete(`/admin/quiz/${quizId}`);
          showToast('success', 'Quiz deleted');
          fetchQuizzes();
        } catch (err) {
          showToast('error', err.response?.data?.detail || 'Delete failed.');
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleCancel = async (quizId) => {
    setConfirm({
      title: 'Cancel Generation',
      message: 'Cancel this quiz generation? Progress will be lost.',
      confirmText: 'Cancel Generation',
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        setCancellingId(quizId);
        try {
          await api.post(`/admin/quiz/${quizId}/cancel`);
          showToast('success', 'Generation cancelled');
          fetchQuizzes();
        } catch (err) {
          showToast('error', err.response?.data?.detail || 'Cancel failed.');
        } finally {
          setCancellingId(null);
        }
      },
    });
  };

  const filtered = quizzes.filter(q => {
    const matchSearch = !search || 
      q.title?.toLowerCase().includes(search.toLowerCase()) || 
      q.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter ||
      (statusFilter === 'failed' && (q.status === 'failed' || q.status === 'cancelled'));
    return matchSearch && matchStatus;
  });

  const handleShare = async (quiz) => {
    try {
      const res = await api.post(`/admin/quiz/${quiz.id}/share`);
      if (res.data.shared) {
        setShareModal({ quizId: quiz.id, shareCode: res.data.share_code, shared: true });
      } else {
        showToast('success', 'Share link removed');
        fetchQuizzes();
      }
    } catch {
      showToast('error', 'Failed to toggle sharing');
    }
  };

  const getShareUrl = (shareCode) => `${window.location.origin}/shared/${shareCode}`;

  const copyShareLink = (shareCode) => {
    navigator.clipboard.writeText(getShareUrl(shareCode));
    setCopiedId(shareCode);
    showToast('success', 'Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusCounts = {
    all: quizzes.length,
    generating: quizzes.filter(q => q.status === 'generating').length,
    generated: quizzes.filter(q => q.status === 'generated').length,
    published: quizzes.filter(q => q.status === 'published').length,
    failed: quizzes.filter(q => q.status === 'failed' || q.status === 'cancelled').length,
  };

  const statusBadge = (status) => {
    const map = {
      published: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
      generated: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
      generating: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
      failed: 'bg-red-500/15 text-red-300 border-red-500/20',
      cancelled: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
    };
    return map[status] || 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-100 font-display">Quiz Management</h1>
          <p className="text-slate-400 font-medium">Review, publish, unpublish, or remove AI-generated quizzes.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/pdfs')}
          className="bg-teal-500 text-slate-900 px-6 py-3 rounded-2xl font-black hover:bg-teal-400 transition shadow-xl shadow-teal-900/30 flex items-center gap-2 active:scale-[0.97]"
        >
          <Plus className="w-5 h-5" /> Create New Quiz
        </button>
      </header>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'generating', label: 'Generating' },
          { key: 'generated', label: 'Ready' },
          { key: 'published', label: 'Published' },
          { key: 'failed', label: 'Failed' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              statusFilter === tab.key
                ? 'bg-teal-500 text-slate-900 shadow-lg shadow-teal-900/30'
                : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:border-teal-500/30 hover:text-teal-300'
            }`}
          >
            {tab.label}
            {statusCounts[tab.key] > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                statusFilter === tab.key ? 'bg-slate-900/30 text-teal-100' : 'bg-slate-800 text-slate-500'
              }`}>
                {statusCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-950/70 text-slate-100 border border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500/50 transition placeholder-slate-500"
            placeholder="Search quizzes by title or description..."
          />
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
        {filtered.map(quiz => (
          <div 
            key={quiz.id} 
            className="bg-slate-900/70 p-6 rounded-[2rem] border border-slate-800 shadow-2xl shadow-slate-900/30 flex flex-col group hover:border-teal-500/40 transition-all hover-lift"
          >
            {/* Status Badge + Delete */}
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBadge(quiz.status)}`}>
                {quiz.status === 'generating' && <Loader2 className="w-3 h-3 animate-spin inline mr-1.5 -mt-0.5" />}
                {quiz.status}
              </span>
              <div className="flex gap-1">
                {/* Share button */}
                {(quiz.status === 'generated' || quiz.status === 'published') && (
                  <button
                    onClick={() => quiz.share_code ? copyShareLink(quiz.share_code) : handleShare(quiz)}
                    className={`p-1.5 rounded-lg transition sm:opacity-0 sm:group-hover:opacity-100 ${
                      quiz.share_code 
                        ? 'text-teal-400 hover:bg-teal-500/10' 
                        : 'text-slate-600 hover:text-teal-400 hover:bg-teal-500/10'
                    }`}
                    title={quiz.share_code ? 'Copy share link' : 'Share quiz'}
                  >
                    {quiz.share_code ? <Link2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(quiz.id)}
                  disabled={deletingId === quiz.id}
                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition sm:opacity-0 sm:group-hover:opacity-100"
                  title="Delete quiz"
                >
                  {deletingId === quiz.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-bold text-slate-100 mb-2 line-clamp-1">{quiz.title}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{quiz.description || 'No description provided.'}</p>

            {/* Share indicator */}
            {quiz.share_code && (
              <div className="mb-3 flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                <Link2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">Shared</span>
                <button 
                  onClick={() => copyShareLink(quiz.share_code)}
                  className="ml-auto p-1 hover:bg-teal-500/20 rounded transition"
                  title="Copy link"
                >
                  {copiedId === quiz.share_code ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
                </button>
              </div>
            )}

            {/* Progress Bar for Generating */}
            {quiz.status === 'generating' && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">Generating...</span>
                  <span className="text-xs font-black text-amber-200">{quiz.progress || 0}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${quiz.progress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {(quiz.status === 'failed' || quiz.status === 'cancelled') && quiz.error_message && (
              <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-300 line-clamp-2">{quiz.error_message}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-5 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                {quiz.total_questions} Questions
              </div>
              <div className="flex gap-2">
                {/* Cancel button for generating */}
                {quiz.status === 'generating' && (
                  <button
                    onClick={() => handleCancel(quiz.id)}
                    disabled={cancellingId === quiz.id}
                    className="bg-red-500/15 text-red-300 px-3 py-2 rounded-xl text-xs font-black hover:bg-red-500/25 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {cancellingId === quiz.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Cancel
                  </button>
                )}

                {/* View/Edit button */}
                {(quiz.status === 'generated' || quiz.status === 'published') && (
                  <button 
                    onClick={() => navigate(`/admin/quiz-editor/${quiz.id}`)}
                    className="p-2 bg-slate-800 text-slate-200 rounded-xl hover:bg-teal-500 hover:text-slate-900 transition"
                    title="View & Edit"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                )}

                {/* Publish / Review button */}
                {quiz.status === 'generated' && (
                  <button
                    onClick={() => navigate(`/admin/quiz-editor/${quiz.id}`)}
                    className="bg-emerald-400 text-slate-900 px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-300 transition flex items-center gap-2"
                  >
                    <Send className="w-3 h-3" /> Review & Publish
                  </button>
                )}

                {/* Unpublish button */}
                {quiz.status === 'published' && (
                  <button
                    onClick={() => handleUnpublish(quiz.id)}
                    disabled={unpublishingId === quiz.id}
                    className="bg-amber-500/15 text-amber-300 px-4 py-2 rounded-xl text-xs font-black hover:bg-amber-500/25 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {unpublishingId === quiz.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArchiveRestore className="w-3 h-3" />}
                    Unpublish
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center animate-scale-in">
            <div className="inline-flex p-6 bg-slate-900 rounded-full mb-4 border border-slate-800">
               <ClipboardList className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">{search ? 'No quizzes match your search' : 'No quizzes yet'}</h3>
            <p className="text-slate-400">{search ? 'Try a different search or filter.' : 'Generate a quiz from your PDF library to see it here.'}</p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModal && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-6 animate-fade-in" onClick={() => { setShareModal(null); fetchQuizzes(); }}>
          <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-teal-400" />
                Share Quiz
              </h3>
              <p className="text-sm text-slate-400 mt-1">Anyone with this link can view the quiz.</p>
            </div>
            <div className="px-8 py-6 space-y-4">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-3">
                <Link2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <input 
                  readOnly 
                  value={getShareUrl(shareModal.shareCode)} 
                  className="flex-1 bg-transparent text-slate-200 text-sm outline-none font-mono"
                />
                <button
                  onClick={() => copyShareLink(shareModal.shareCode)}
                  className="p-2 bg-teal-500 text-slate-900 rounded-lg hover:bg-teal-400 transition"
                >
                  {copiedId === shareModal.shareCode ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="px-8 py-4 bg-slate-950/50 border-t border-slate-800 flex justify-between">
              <button
                onClick={async () => { await handleShare({ id: shareModal.quizId, share_code: shareModal.shareCode }); setShareModal(null); fetchQuizzes(); }}
                className="px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition"
              >
                Remove Link
              </button>
              <button
                onClick={() => { setShareModal(null); fetchQuizzes(); }}
                className="px-5 py-2 bg-slate-800 text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Toast toast={toast} />
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title || ''}
        message={confirm?.message || ''}
        confirmText={confirm?.confirmText || 'Confirm'}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm || (() => {})}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}