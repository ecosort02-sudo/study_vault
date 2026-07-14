import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tests } from '../lib/api';
import { CheckCircle2, XCircle, ArrowLeft, Trophy, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/Logo';

const TestReview = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tests.review(testId)
      .then((res) => setReview(res.data))
      .catch((err) => {
        toast.error(err.response?.data?.detail || 'Cannot load review');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [testId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!review) return null;

  const percentage = ((review.score / review.total_marks) * 100).toFixed(1);
  const correctCount = review.questions.filter((q) => q.is_correct).length;
  const wrongCount = review.questions.length - correctCount;

  const scoreColor = percentage >= 75 ? '#00ff66' : percentage >= 50 ? '#00f0ff' : '#ff003c';

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="noise-bg"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#27272a] bg-[#18181b]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="md" />
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            data-testid="back-to-dashboard-button"
            className="flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-md hover:border-[#00f0ff] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Hero score card */}
        <div
          className="relative rounded-2xl border overflow-hidden mb-8"
          style={{
            background: `linear-gradient(135deg, ${scoreColor}15 0%, transparent 100%)`,
            borderColor: `${scoreColor}30`,
          }}
        >
          <div
            className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: scoreColor }}
          ></div>

          <div className="relative p-8 md:p-10">
            <div className="flex items-start gap-3 mb-4">
              <Trophy className="w-6 h-6" style={{ color: scoreColor }} />
              <div className="text-sm uppercase tracking-wider font-mono text-[#a1a1aa]">Test Review</div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" data-testid="review-test-title">
              {review.test_title}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#09090b]/60 border border-[#27272a] rounded-xl p-4">
                <div className="text-xs text-[#a1a1aa] uppercase tracking-wider mb-1">Score</div>
                <div className="text-2xl font-bold font-mono">{review.score}<span className="text-[#a1a1aa] text-lg">/{review.total_marks}</span></div>
              </div>
              <div className="bg-[#09090b]/60 border border-[#27272a] rounded-xl p-4">
                <div className="text-xs text-[#a1a1aa] uppercase tracking-wider mb-1">Percentage</div>
                <div className="text-2xl font-bold font-mono" style={{ color: scoreColor }}>{percentage}%</div>
              </div>
              <div className="bg-[#09090b]/60 border border-[#27272a] rounded-xl p-4">
                <div className="text-xs text-[#a1a1aa] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#00ff66]" />
                  Correct
                </div>
                <div className="text-2xl font-bold font-mono text-[#00ff66]">{correctCount}</div>
              </div>
              <div className="bg-[#09090b]/60 border border-[#27272a] rounded-xl p-4">
                <div className="text-xs text-[#a1a1aa] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-[#ff003c]" />
                  Wrong
                </div>
                <div className="text-2xl font-bold font-mono text-[#ff003c]">{wrongCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#00f0ff]" />
          <h2 className="text-xl font-bold">Question-by-question breakdown</h2>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {review.questions.map((q, idx) => (
            <div
              key={idx}
              data-testid={`review-question-${idx}`}
              className={`bg-[#18181b] border rounded-xl p-6 ${
                q.is_correct ? 'border-[#00ff66]/30' : 'border-[#ff003c]/30'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono ${
                    q.is_correct
                      ? 'bg-[#00ff66]/20 text-[#00ff66]'
                      : 'bg-[#ff003c]/20 text-[#ff003c]'
                  }`}
                >
                  {q.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#a1a1aa] font-mono">Q{idx + 1}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        q.is_correct
                          ? 'bg-[#00ff66]/20 text-[#00ff66]'
                          : 'bg-[#ff003c]/20 text-[#ff003c]'
                      }`}
                    >
                      {q.is_correct ? `+${q.marks} marks` : `0/${q.marks} marks`}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium">{q.question}</h3>
                </div>
              </div>

              <div className="space-y-2 ml-14">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correct_option;
                  const isSelected = oIdx === q.selected_option;
                  let className = 'border-[#27272a] bg-[#09090b]';
                  let icon = null;

                  if (isCorrect) {
                    className = 'border-[#00ff66] bg-[#00ff66]/10';
                    icon = <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />;
                  } else if (isSelected && !isCorrect) {
                    className = 'border-[#ff003c] bg-[#ff003c]/10';
                    icon = <XCircle className="w-4 h-4 text-[#ff003c]" />;
                  }

                  return (
                    <div
                      key={oIdx}
                      data-testid={`review-q${idx}-opt${oIdx}`}
                      className={`flex items-center justify-between gap-3 p-3 border rounded-md ${className}`}
                    >
                      <div className="flex items-center gap-3">
                        {icon}
                        <span className={!icon ? 'text-[#a1a1aa]' : ''}>{opt}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-[#7c3aed]/20 text-[#7c3aed] rounded-full font-mono">
                            Your answer
                          </span>
                        )}
                        {isCorrect && (
                          <span className="px-2 py-0.5 bg-[#00ff66]/20 text-[#00ff66] rounded-full font-mono">
                            Correct
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TestReview;
