import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tests } from '../lib/api';
import { AlertTriangle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

const TestPage = () => {
  const { testId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTest();
  }, [testId]);

  useEffect(() => {
    if (!test) return;

    setTimeRemaining(test.duration_minutes * 60);

    // Timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Anti-cheat: Track tab switches
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount > 5) {
            toast.error('Warning: Multiple tab switches detected! This will be reported.');
          } else if (newCount > 3) {
            toast.warning(`Tab switch detected (${newCount}/5). Stay on this page!`);
          }
          return newCount;
        });
      }
    };

    const handleBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
    };

    // Prevent inspect element
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        toast.error('This action is disabled during test');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [test]);

  const loadTest = async () => {
    try {
      const response = await tests.getById(testId);
      setTest(response.data);
    } catch (error) {
      toast.error('Failed to load test');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    const answersArray = test.questions.map((q, idx) => ({
      question_id: idx,
      selected_option: answers[idx] || null,
    }));

    try {
      const response = await tests.submit({
        test_id: testId,
        answers: answersArray,
        tab_switch_count: tabSwitchCount,
      });

      toast.success(`Test submitted! Score: ${response.data.score}/${test.total_marks}`);
      
      if (tabSwitchCount > 5) {
        toast.error('Your test has been flagged for excessive tab switches');
      }
      
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit test');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] prevent-inspect">
      <div className="noise-bg"></div>

      {/* Warning Banner */}
      {tabSwitchCount > 0 && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 py-3 px-6 ${
            tabSwitchCount > 5 ? 'bg-[#ff003c]/20 border-b-2 border-[#ff003c]' : 'bg-[#00f0ff]/20 border-b-2 border-[#00f0ff]'
          }`}
          data-testid="tab-switch-warning"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className={tabSwitchCount > 5 ? 'text-[#ff003c]' : 'text-[#00f0ff]'} />
              <span className="font-medium">
                {tabSwitchCount > 5
                  ? 'TEST FLAGGED: Excessive tab switches detected!'
                  : `Warning: ${tabSwitchCount} tab switch(es) detected`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="font-mono">{tabSwitchCount}/5</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`relative z-10 border-b border-[#27272a] bg-[#18181b]/80 backdrop-blur-xl ${tabSwitchCount > 0 ? 'mt-14' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="test-title">{test.title}</h1>
              <p className="text-sm text-[#a1a1aa]">Total Marks: {test.total_marks}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md">
                <Clock className="w-5 h-5 text-[#00f0ff]" />
                <span className="font-mono text-lg" data-testid="timer">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {test.questions.map((question, idx) => (
            <div
              key={idx}
              data-testid={`question-${idx}`}
              className="bg-[#18181b] border border-[#27272a] rounded-lg p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#00f0ff]/20 text-[#00f0ff] font-mono text-sm">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">{question.question}</h3>
                  <span className="text-xs text-[#a1a1aa]">({question.marks} marks)</span>
                </div>
              </div>

              <div className="space-y-3 ml-12">
                {question.options.map((option, optIdx) => (
                  <label
                    key={optIdx}
                    data-testid={`question-${idx}-option-${optIdx}`}
                    className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                      answers[idx] === optIdx
                        ? 'border-[#00f0ff] bg-[#00f0ff]/10'
                        : 'border-[#27272a] hover:border-[#00f0ff]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      checked={answers[idx] === optIdx}
                      onChange={() => setAnswers({ ...answers, [idx]: optIdx })}
                      className="w-4 h-4 text-[#00f0ff] bg-transparent border-[#27272a] focus:ring-[#00f0ff]"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-[#a1a1aa]">
            Questions answered: {Object.keys(answers).length}/{test.questions.length}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="submit-test-button"
            className="px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TestPage;
