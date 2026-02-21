import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, TextField,
  IconButton, Stack, Chip, Avatar, Divider, LinearProgress,
  Alert, AlertTitle, Skeleton, Slider
} from "@mui/material";
import {
  Trash2, Send, ChevronLeft, CheckCircle,
  AlertCircle, Save, FileText, RefreshCw, Hash,
  CheckSquare, Square, ArchiveRestore
} from "lucide-react";
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  // API prefix & back link based on context
  const quizApi = isAdmin ? '/admin/quiz' : '/student/my-quiz';
  const questionApi = isAdmin ? '/admin/question' : '/student/question';
  const backPath = isAdmin ? '/admin/quizzes' : '/my-quizzes';

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [publishCount, setPublishCount] = useState(0);
  const [toast, showToast] = useToast();
  const [confirm, setConfirm] = useState(null); // { title, message, onConfirm, danger? }

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`${quizApi}/${id}`);
        setQuiz(res.data);
        const qs = res.data.questions || [];
        setQuestions(qs);
        // Select all by default
        setSelectedIds(new Set(qs.map(q => q.id)));
        setPublishCount(qs.length);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleUpdate = async (qId, updatedFields) => {
    setIsSaving(true);
    try {
      await api.put(`${questionApi}/${qId}`, updatedFields);
      setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...updatedFields } : q));
      setTimeout(() => setIsSaving(false), 800);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleDelete = async (qId) => {
    setConfirm({
      title: 'Delete Question',
      message: 'Permanently delete this question? This cannot be undone.',
      danger: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.delete(`${questionApi}/${qId}`);
          setQuestions(prev => prev.filter(q => q.id !== qId));
          setSelectedIds(prev => { const n = new Set(prev); n.delete(qId); return n; });
          showToast('success', 'Question deleted');
        } catch (err) {
          showToast('error', 'Delete failed');
        }
      },
    });
  };

  const toggleSelectQuestion = (qId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(questions.map(q => q.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handlePublish = async () => {
    setConfirm({
      title: 'Publish Quiz',
      message: `Publish this quiz with ${selectedIds.size} selected questions? Students will be able to take it.`,
      confirmText: 'Publish',
      onConfirm: async () => {
        setConfirm(null);
        setIsPublishing(true);
        try {
          await api.post(`${quizApi}/${id}/publish-selected`, {
            question_ids: Array.from(selectedIds)
          });
          showToast('success', `Quiz published with ${selectedIds.size} questions!`);
          setTimeout(() => navigate(backPath), 1200);
        } catch (err) {
          showToast('error', err.response?.data?.detail || "Publish failed.");
          setIsPublishing(false);
        }
      },
    });
  };

  const handleUnpublish = async () => {
    setConfirm({
      title: 'Unpublish Quiz',
      message: "Unpublish this quiz? Students won't be able to access it anymore.",
      danger: true,
      confirmText: 'Unpublish',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.post(`${quizApi}/${id}/unpublish`);
          setQuiz(prev => ({ ...prev, status: 'generated' }));
          showToast('success', 'Quiz unpublished');
        } catch (err) {
          showToast('error', err.response?.data?.detail || 'Unpublish failed.');
        }
      },
    });
  };

  const handleQuickPublish = async () => {
    if (publishCount <= 0 || publishCount > questions.length) return;
    setConfirm({
      title: 'Quick Publish',
      message: `Publish this quiz with the top ${publishCount} questions?`,
      confirmText: 'Publish',
      onConfirm: async () => {
        setConfirm(null);
        setIsPublishing(true);
        try {
          await api.post(`${quizApi}/${id}/publish-selected`, {
            question_count: publishCount
          });
          showToast('success', `Quiz published with ${publishCount} questions!`);
          setTimeout(() => navigate(backPath), 1200);
        } catch (err) {
          showToast('error', err.response?.data?.detail || "Publish failed.");
          setIsPublishing(false);
        }
      },
    });
  };

  if (loading) return (
    <Box sx={{ p: 4 }}>
      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4, mb: 4 }} />
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4, mb: 2 }} />
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#0b1320", minHeight: "100vh", pb: 6 }}>
      {/* HEADER ACTION BAR */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Button 
          startIcon={<ChevronLeft size={20} />} 
          onClick={() => navigate(backPath)}
          sx={{ color: "#64748b", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "white" } }}
        >
          Back to Quiz List
        </Button>

        <Stack direction="row" spacing={3} alignItems="center">
          {isSaving && (
            <Typography sx={{ fontSize: '12px', color: '#5eead4', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RefreshCw size={14} className="animate-spin" /> Saving Changes...
            </Typography>
          )}

          {quiz?.status === 'published' && (
            <Button
              onClick={handleUnpublish}
              sx={{ 
                bgcolor: "#78350f", borderRadius: "12px", px: 3, py: 1.2, fontWeight: 800, textTransform: "none",
                color: "#fbbf24", "&:hover": { bgcolor: "#92400e" }
              }}
            >
              <ArchiveRestore size={16} style={{ marginRight: 8 }} /> Unpublish
            </Button>
          )}

          {quiz?.status !== 'published' && (
            <Button
              onClick={() => setShowPublishPanel(!showPublishPanel)}
              sx={{ 
                bgcolor: showPublishPanel ? "#0f766e" : "#14b8a6", borderRadius: "12px", px: 4, py: 1.2, fontWeight: 800, textTransform: "none",
                color: "#0b1320", "&:hover": { bgcolor: "#2dd4bf" }, boxShadow: "0 10px 20px -6px rgba(20, 184, 166, 0.4)"
              }}
            >
              <Send size={16} style={{ marginRight: 8 }} /> {showPublishPanel ? 'Hide Publish Options' : 'Publish Quiz'}
            </Button>
          )}
        </Stack>
      </Stack>

      {/* PUBLISH PANEL */}
      {showPublishPanel && quiz?.status !== 'published' && (
        <Card sx={{ borderRadius: "20px", mb: 3, border: "2px solid #14b8a6", boxShadow: "0 24px 45px rgba(20, 184, 166, 0.15)", bgcolor: "#0f2f2b" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 900, color: '#5eead4', letterSpacing: '0.15em', mb: 2 }}>
              PUBLISH OPTIONS
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
              {/* Option 1: Quick Count */}
              <Box sx={{ flex: 1, p: 2, bgcolor: "#0b1320", borderRadius: "14px", border: "1px solid #1f2a3a" }}>
                <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', mb: 1 }}>
                  QUICK PUBLISH
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Slider
                    value={publishCount}
                    onChange={(e, val) => setPublishCount(val)}
                    min={1}
                    max={questions.length}
                    step={1}
                    size="small"
                    sx={{ 
                      color: '#14b8a6',
                      '& .MuiSlider-thumb': { bgcolor: '#5eead4', width: 16, height: 16 },
                      '& .MuiSlider-track': { bgcolor: '#14b8a6' },
                      '& .MuiSlider-rail': { bgcolor: '#1f2a3a' }
                    }}
                  />
                  <Typography sx={{ fontSize: '18px', fontWeight: 900, color: '#5eead4', minWidth: 36, textAlign: 'center' }}>
                    {publishCount}
                  </Typography>
                  <Button
                    onClick={handleQuickPublish}
                    disabled={isPublishing}
                    size="small"
                    sx={{ 
                      bgcolor: "#14b8a6", borderRadius: "10px", px: 2.5, py: 0.8, fontWeight: 800, textTransform: "none",
                      color: "#0b1320", fontSize: '11px', whiteSpace: 'nowrap', "&:hover": { bgcolor: "#2dd4bf" }
                    }}
                  >
                    {isPublishing ? '...' : `Publish ${publishCount}`}
                  </Button>
                </Stack>
              </Box>

              {/* Divider */}
              <Typography sx={{ color: '#334155', fontWeight: 900, fontSize: '12px' }}>OR</Typography>

              {/* Option 2: Manual Selection */}
              <Box sx={{ flex: 1, p: 2, bgcolor: "#0b1320", borderRadius: "14px", border: "1px solid #1f2a3a" }}>
                <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', mb: 1 }}>
                  HAND-PICK
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Button size="small" onClick={selectAll}
                    sx={{ fontSize: '10px', fontWeight: 800, color: '#5eead4', textTransform: 'none', minWidth: 'auto', px: 1 }}>
                    All
                  </Button>
                  <Button size="small" onClick={deselectAll}
                    sx={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'none', minWidth: 'auto', px: 1 }}>
                    None
                  </Button>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', flex: 1 }}>
                    {selectedIds.size}/{questions.length}
                  </Typography>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing || selectedIds.size === 0}
                    size="small"
                    sx={{ 
                      bgcolor: "#14b8a6", borderRadius: "10px", px: 2.5, py: 0.8, fontWeight: 800, textTransform: "none",
                      color: "#0b1320", fontSize: '11px', whiteSpace: 'nowrap', "&:hover": { bgcolor: "#2dd4bf" },
                      "&:disabled": { bgcolor: "#1f2a3a", color: "#475569" }
                    }}
                  >
                    {isPublishing ? '...' : `Publish ${selectedIds.size}`}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* QUIZ INFO CARD */}
      <Card sx={{ borderRadius: "20px", mb: 3, border: "1px solid #1f2a3a", boxShadow: "0 24px 45px rgba(2, 6, 23, 0.55)", bgcolor: "#0f172a" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip label={`${questions.length} Questions`} size="small" sx={{ bgcolor: "#0f2f2b", color: "#5eead4", fontWeight: 800 }} />
            <Chip label={quiz?.status?.toUpperCase()} size="small" variant="outlined" sx={{ fontWeight: 800, borderColor: "#1f2a3a", color: "#cbd5f5" }} />
            {showPublishPanel && (
              <Chip label={`${selectedIds.size} Selected`} size="small" sx={{ bgcolor: "#14b8a6", color: "#0b1320", fontWeight: 800 }} />
            )}
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#e2e8f0" }}>{quiz?.title}</Typography>
          <Typography sx={{ color: "#94a3b8", mt: 1, fontSize: "1rem", fontWeight: 500 }}>{quiz?.description}</Typography>
        </CardContent>
      </Card>

      {/* QUESTIONS LIST */}
      <Stack spacing={4}>
        {questions.map((q, index) => (
          <QuestionItem 
            key={q.id} 
            q={q} 
            index={index} 
            onUpdate={handleUpdate} 
            onDelete={handleDelete}
            isSelected={selectedIds.has(q.id)}
            onToggleSelect={() => toggleSelectQuestion(q.id)}
            showSelection={showPublishPanel}
          />
        ))}
      </Stack>

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
    </Box>
  );
}

function QuestionItem({ q, index, onUpdate, onDelete, isSelected, onToggleSelect, showSelection }) {
  // --- SMART DATA NORMALIZER ---
  const getCleanOptions = () => {
    let raw = q.options;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch { raw = []; }
    }
    
    // If AI sent an array: ["opt1", "opt2"...] -> Convert to {"A": "opt1", "B": "opt2"...}
    if (Array.isArray(raw)) {
      const keys = ["A", "B", "C", "D"];
      const obj = {};
      raw.forEach((val, i) => { if(i < 4) obj[keys[i]] = val; });
      return obj;
    }
    // If it's already an object, use it
    return raw || {};
  };

  const options = getCleanOptions();
  const isMCQ = Object.keys(options).length > 0;

  // Checks if the correct answer matches the Letter (A) OR the actual text value
  const isCorrect = (key, value) => {
    const correct = String(q.correct_answer || "");
    return correct === key || correct === value;
  };

  return (
    <Card sx={{ 
      borderRadius: "32px", 
      border: showSelection 
        ? (isSelected ? "2px solid #14b8a6" : "2px solid #1f2a3a") 
        : "1px solid #1f2a3a", 
      boxShadow: isSelected && showSelection 
        ? "0 26px 45px rgba(20, 184, 166, 0.12)" 
        : "0 26px 45px rgba(2, 6, 23, 0.55)", 
      overflow: "visible", position: "relative", bgcolor: "#0f172a",
      opacity: showSelection && !isSelected ? 0.6 : 1,
      transition: "all 0.2s ease"
    }}>
      {/* Selection Checkbox */}
      {showSelection && (
        <Box 
          onClick={onToggleSelect}
          sx={{ 
            position: "absolute", right: 20, top: 20, cursor: "pointer", zIndex: 10,
            width: 36, height: 36, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: isSelected ? "#14b8a6" : "#1f2a3a", 
            border: isSelected ? "none" : "2px solid #334155",
            transition: "all 0.2s ease",
            "&:hover": { bgcolor: isSelected ? "#2dd4bf" : "#334155" }
          }}
        >
          {isSelected ? <CheckSquare size={18} color="#0b1320" /> : <Square size={18} color="#64748b" />}
        </Box>
      )}

      {/* Question Number Badge */}
      <Avatar sx={{ 
        position: "absolute", left: -20, top: 20, bgcolor: "#14b8a6", 
        width: 45, height: 45, fontWeight: 900, color: "#0b1320", boxShadow: "0 10px 15px rgba(0,0,0,0.35)" 
      }}>
        {index + 1}
      </Avatar>

      <CardContent sx={{ p: 5, pl: 6 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.15em' }}>
            {isMCQ ? "MULTIPLE CHOICE ASSESSMENT" : "OPEN RESPONSE QUESTION"} • {q.difficulty?.toUpperCase()}
          </Typography>
          <IconButton onClick={() => onDelete(q.id)} sx={{ color: "#cbd5e1", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
            <Trash2 size={20} />
          </IconButton>
        </Stack>

        {/* QUESTION TEXT */}
        <TextField
          fullWidth
          multiline
          variant="standard"
          defaultValue={q.question_text}
          placeholder="Enter question..."
          onBlur={(e) => onUpdate(q.id, { question_text: e.target.value })}
          InputProps={{ disableUnderline: true, sx: { fontSize: "22px", fontWeight: 800, color: "#e2e8f0", lineHeight: 1.3 } }}
          sx={{ mb: 4 }}
        />

        {/* OPTIONS GRID */}
        {isMCQ ? (
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3}>
            {Object.entries(options).map(([key, value]) => {
              const active = isCorrect(key, value);
              return (
                <Box 
                  key={key} 
                  onClick={() => onUpdate(q.id, { correct_answer: key })} // Updates DB with the Letter (A, B, C...)
                  sx={{ 
                    p: 3, borderRadius: "20px", cursor: "pointer", border: "2px solid",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    borderColor: active ? "#2dd4bf" : "#1f2a3a",
                    bgcolor: active ? "#0f2f2b" : "#0b1320",
                    display: 'flex', alignItems: 'center', gap: 2,
                    "&:hover": { borderColor: active ? "#2dd4bf" : "#334155" }
                  }}
                >
                  <Avatar sx={{ 
                    width: 32, height: 32, fontSize: '14px', fontWeight: 900,
                    bgcolor: active ? "#2dd4bf" : "#0f172a", color: active ? "#0b1320" : "#94a3b8",
                    border: active ? "none" : "1px solid #1f2a3a"
                  }}>{key}</Avatar>
                  
                  <TextField
                    fullWidth
                    variant="standard"
                    defaultValue={value}
                    onBlur={(e) => {
                      const newOptions = { ...options, [key]: e.target.value };
                      onUpdate(q.id, { options: JSON.stringify(newOptions) });
                    }}
                    InputProps={{ disableUnderline: true, sx: { fontWeight: 700, fontSize: "14px", color: active ? "#5eead4" : "#cbd5f5" } }}
                    onClick={(e) => e.stopPropagation()} // Prevent clicking input from triggering answer toggle
                  />
                  
                  {active && <CheckCircle size={20} color="#2dd4bf" style={{ marginLeft: 'auto' }} />}
                </Box>
              );
            })}
          </Box>
        ) : (
          /* SHORT ANSWER FALLBACK */
          <Box sx={{ p: 4, bgcolor: "#0f2f2b", border: "1px dashed #2dd4bf", borderRadius: "20px" }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 900, color: '#5eead4', mb: 1, letterSpacing: '0.1em' }}>EXPECTED SYSTEM RESPONSE</Typography>
            <TextField
              fullWidth
              multiline
              variant="standard"
              defaultValue={q.correct_answer}
              onBlur={(e) => onUpdate(q.id, { correct_answer: e.target.value })}
              InputProps={{ disableUnderline: true, sx: { fontWeight: 700, color: "#e2e8f0" } }}
            />
          </Box>
        )}

        {/* AI EXPLANATION BOX */}
        {q.explanation && (
          <Box sx={{ mt: 5, p: 3, bgcolor: "#0b1320", borderRadius: "20px", display: 'flex', gap: 2, border: "1px solid #1f2a3a" }}>
            <AlertCircle size={20} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', mb: 0.5 }}>AI CONTEXT & EXPLANATION</Typography>
              <TextField
                fullWidth
                multiline
                variant="standard"
                defaultValue={q.explanation}
                onBlur={(e) => onUpdate(q.id, { explanation: e.target.value })}
                InputProps={{ disableUnderline: true, sx: { fontSize: '13px', color: '#cbd5f5', fontStyle: 'italic' } }}
              />
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}