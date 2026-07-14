import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tests, assignments, grades, announcements } from '../lib/api';
import {
  BookOpen, FileText, Award, Bell, LogOut, ClipboardList,
  Lock, CheckCircle2, TrendingUp, Sparkles, Trophy, Target,
  Flame, Zap, ChevronRight, Clock, Calendar, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/Logo';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testsList, setTestsList] = useState([]);
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [gradesList, setGradesList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/');
      return;
    }

    // Prevent inspect element
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        toast.error('This action is disabled for security reasons');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [user, navigate]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [testsRes, assignmentsRes, gradesRes, announcementsRes] = await Promise.all([
        tests.getAll(),
        assignments.getAll(),
        grades.getAll(),
        announcements.getAll(),
      ]);
      setTestsList(testsRes.data);
      setAssignmentsList(assignmentsRes.data);
      setGradesList(gradesRes.data);
      setAnnouncementsList(announcementsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  // Analytics
  const attemptedCount = testsList.filter((t) => t.already_attempted).length;
  const pendingTests = testsList.filter((t) => !t.already_attempted).length;
  const submittedAssignments = assignmentsList.filter((a) => a.already_submitted).length;
  const avgScore = gradesList.length
    ? (gradesList.reduce((s, g) => s + (g.score / g.total_marks) * 100, 0) / gradesList.length).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen bg-[#09090b] prevent-inspect relative">
      <div className="noise-bg"></div>
      <div className="orb orb-cyan"></div>
      <div className="orb orb-purple"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#27272a] bg-[#09090b]/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="md" />
            <div className="hidden md:block h-8 w-px bg-[#27272a]"></div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#7c3aed] flex items-center justify-center font-mono text-xs font-bold">
                {user?.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <p className="text-sm text-[#a1a1aa]">{user?.full_name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-md hover:border-[#ff003c] hover:text-[#ff003c] transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="relative z-10 border-b border-[#27272a] bg-[#09090b]/40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <nav className="flex gap-1 min-w-max">
            {[
              { id: 'dashboard', label: 'Home', icon: Sparkles },
              { id: 'tests', label: 'Tests', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'grades', label: 'Grades', icon: Trophy },
              { id: 'announcements', label: 'Announcements', icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`tab-${tab.id}`}
                  className={`relative flex items-center gap-2 px-5 py-3 text-sm transition-colors ${
                    active ? 'text-white' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#00f0ff]' : ''}`} />
                  {tab.label}
                  {active && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block w-10 h-10 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardHome
                user={user}
                stats={{ attemptedCount, pendingTests, submittedAssignments, avgScore, totalGrades: gradesList.length, announcementCount: announcementsList.length }}
                announcements={announcementsList}
                gradesList={gradesList}
                testsList={testsList}
                onNav={setActiveTab}
              />
            )}

            {activeTab === 'tests' && (
              <TestsTab testsList={testsList} navigate={navigate} />
            )}

            {activeTab === 'assignments' && (
              <AssignmentsTab assignmentsList={assignmentsList} onSubmitted={loadData} />
            )}

            {activeTab === 'grades' && (
              <GradesTab gradesList={gradesList} />
            )}

            {activeTab === 'announcements' && (
              <AnnouncementsTab announcementsList={announcementsList} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

// ============ Dashboard Home ============
const DashboardHome = ({ user, stats, announcements, gradesList, testsList, onNav }) => {
  const firstName = user?.full_name?.split(' ')[0] || 'Student';
  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl border border-[#27272a] bg-gradient-to-br from-[#18181b] via-[#0f0f11] to-[#18181b] p-8 md:p-10 animate-in">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#00f0ff]/20 to-transparent blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#7c3aed]/20 to-transparent blur-3xl"></div>
        <div className="grid-pattern absolute inset-0 opacity-40"></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#00f0ff] mb-3 font-mono uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              {greeting}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">
              Hey <span className="text-gradient">{firstName}</span>,
              <br />
              ready to learn?
            </h1>
            <p className="text-[#a1a1aa] max-w-lg mt-3">
              You have <span className="text-white font-semibold">{stats.pendingTests} pending {stats.pendingTests === 1 ? 'test' : 'tests'}</span> and{' '}
              <span className="text-white font-semibold">
                {stats.submittedAssignments}/{stats.submittedAssignments + (testsList.length ? 0 : 0)} 
              </span>{' '}
              assignments submitted. Keep the streak going.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => onNav('tests')}
                data-testid="dashboard-cta-tests"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white text-sm font-semibold hover:shadow-[0_10px_30px_rgba(0,240,255,0.3)] transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Continue learning
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNav('grades')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#27272a] hover:border-[#00f0ff] text-sm text-white transition-colors"
              >
                <Trophy className="w-4 h-4" />
                View grades
              </button>
            </div>
          </div>

          {/* Avg score badge */}
          <div className="flex-shrink-0">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="#27272a" strokeWidth="10" fill="none" />
                <circle
                  cx="80" cy="80" r="70"
                  stroke="url(#grad)" strokeWidth="10" fill="none"
                  strokeDasharray={`${(stats.avgScore / 100) * 439.6} 439.6`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center">
                <div className="text-4xl font-bold font-mono text-gradient">{stats.avgScore}%</div>
                <div className="text-xs uppercase tracking-wider text-[#a1a1aa] mt-1">Avg score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tests Attempted', value: stats.attemptedCount, icon: CheckCircle2, color: '#00ff66', bg: 'from-[#00ff66]/10 to-transparent' },
          { label: 'Pending Tests', value: stats.pendingTests, icon: Clock, color: '#00f0ff', bg: 'from-[#00f0ff]/10 to-transparent' },
          { label: 'Assignments Done', value: stats.submittedAssignments, icon: FileText, color: '#7c3aed', bg: 'from-[#7c3aed]/10 to-transparent' },
          { label: 'Grades Earned', value: stats.totalGrades, icon: Award, color: '#ffbb00', bg: 'from-[#ffbb00]/10 to-transparent' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              data-testid={`stat-card-${idx}`}
              className={`animate-in stagger-${idx + 1} relative rounded-2xl border border-[#27272a] bg-gradient-to-br ${stat.bg} p-5 hover:border-[#3f3f46] transition-colors overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold font-mono tracking-tight">{stat.value}</div>
              <div className="text-xs text-[#a1a1aa] mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Two column: Recent Announcements + Recent Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-in stagger-5">
          <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#00f0ff]" />
                Latest Announcements
              </h2>
              <button
                onClick={() => onNav('announcements')}
                className="text-xs text-[#00f0ff] hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {announcements.length === 0 ? (
              <EmptyState message="No announcements yet" />
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    data-testid={`announcement-${a.id}`}
                    className="border-l-2 border-[#00f0ff] pl-4 py-2 hover:bg-[#09090b]/40 transition-colors rounded-r-md"
                  >
                    <div className="font-medium">{a.title}</div>
                    <p className="text-sm text-[#a1a1aa] mt-1 line-clamp-2">{a.content}</p>
                    <div className="text-xs text-[#a1a1aa] mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="animate-in stagger-6">
          <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00ff66]" />
                Recent Scores
              </h2>
            </div>
            {gradesList.length === 0 ? (
              <EmptyState message="Take a test to see scores" />
            ) : (
              <div className="space-y-3">
                {gradesList.slice(0, 4).map((g) => {
                  const pct = ((g.score / g.total_marks) * 100).toFixed(0);
                  const color = pct >= 75 ? '#00ff66' : pct >= 50 ? '#00f0ff' : '#ff003c';
                  return (
                    <div key={g.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{g.title}</div>
                        <div className="w-full bg-[#27272a] rounded-full h-1.5 mt-2">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: color }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-lg font-bold font-mono flex-shrink-0" style={{ color }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ Tests Tab ============
const TestsTab = ({ testsList, navigate }) => {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Your Tests</h2>
          <p className="text-[#a1a1aa] text-sm mt-1">
            {testsList.filter((t) => !t.already_attempted).length} pending • {testsList.filter((t) => t.already_attempted).length} completed
          </p>
        </div>
      </div>

      {testsList.length === 0 ? (
        <EmptyState message="No tests available right now. Check back later!" tall />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testsList.map((test, idx) => (
            <TestCard key={test.id} test={test} navigate={navigate} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
};

const TestCard = ({ test, navigate, idx }) => {
  const attempted = test.already_attempted;
  const hasScore = attempted && test.my_score !== null && test.my_score !== undefined;
  const scorePct = hasScore ? ((test.my_score / test.total_marks) * 100).toFixed(0) : null;
  const scoreColor = scorePct >= 75 ? '#00ff66' : scorePct >= 50 ? '#00f0ff' : '#ff003c';

  return (
    <div
      data-testid={`test-card-${test.id}`}
      className={`animate-in stagger-${(idx % 6) + 1} relative overflow-hidden rounded-2xl border bg-[#18181b] p-6 transition-all hover:-translate-y-1 ${
        attempted ? 'border-[#00ff66]/20' : 'border-[#27272a] hover:border-[#00f0ff]/50'
      }`}
    >
      {/* Corner accent */}
      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-30 blur-2xl"
        style={{ background: attempted ? '#00ff66' : '#00f0ff' }}
      ></div>

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: attempted ? '#00ff6615' : '#00f0ff15' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: attempted ? '#00ff66' : '#00f0ff' }} />
            </div>
            <h3 className="text-lg font-semibold">{test.title}</h3>
          </div>
          {attempted && (
            <span className="px-2 py-1 bg-[#00ff66]/20 text-[#00ff66] text-xs rounded-full flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              Done
            </span>
          )}
        </div>

        <p className="text-sm text-[#a1a1aa] mb-4 line-clamp-2">{test.description}</p>

        <div className="flex items-center gap-4 text-xs text-[#a1a1aa] mb-4 font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {test.duration_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" /> {test.total_marks} marks
          </span>
        </div>

        {/* Score reveal after publish */}
        {hasScore && (
          <div className="mb-4 p-3 rounded-lg border border-[#27272a] bg-[#09090b]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#a1a1aa] uppercase tracking-wider">Your Score</span>
              <span className="text-lg font-bold font-mono" style={{ color: scoreColor }}>
                {test.my_score}/{test.total_marks} ({scorePct}%)
              </span>
            </div>
            <div className="w-full bg-[#27272a] rounded-full h-1.5">
              <div className="h-full rounded-full transition-all" style={{ width: `${scorePct}%`, background: scoreColor }}></div>
            </div>
          </div>
        )}
        {attempted && !hasScore && (
          <div className="mb-4 p-3 rounded-lg border border-[#27272a] bg-[#09090b] flex items-center gap-2 text-xs text-[#a1a1aa]">
            <Clock className="w-4 h-4" />
            Results not yet published by your instructor
          </div>
        )}

        {test.ends_at && !attempted && (
          <div className="text-xs text-[#a1a1aa] mb-3 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Closes {new Date(test.ends_at).toLocaleString()}
          </div>
        )}

        {attempted ? (
          hasScore ? (
            <button
              onClick={() => navigate(`/test/${test.id}/review`)}
              data-testid={`review-test-${test.id}`}
              className="w-full py-2.5 bg-[#18181b] border border-[#00ff66]/30 hover:bg-[#00ff66]/10 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#00ff66]" />
              Review Answers
            </button>
          ) : (
            <button
              disabled
              data-testid={`test-attempted-${test.id}`}
              className="w-full py-2.5 bg-[#27272a]/50 text-[#a1a1aa] font-semibold rounded-lg text-sm flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              Awaiting results
            </button>
          )
        ) : (
          <button
            onClick={() => navigate(`/test/${test.id}`)}
            data-testid={`start-test-${test.id}`}
            className="group w-full py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-[#00f0ff]/30 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Start Test
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

// ============ Assignments Tab ============
const AssignmentsTab = ({ assignmentsList, onSubmitted }) => {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Assignments</h2>
        <p className="text-[#a1a1aa] text-sm mt-1">Submit your work — one attempt per assignment</p>
      </div>

      {assignmentsList.length === 0 ? (
        <EmptyState message="No assignments right now" tall />
      ) : (
        <div className="space-y-4">
          {assignmentsList.map((a) => (
            <AssignmentCard key={a.id} assignment={a} onSubmitted={onSubmitted} />
          ))}
        </div>
      )}
    </div>
  );
};

const AssignmentCard = ({ assignment, onSubmitted }) => {
  const [showSubmit, setShowSubmit] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await assignments.submit({ assignment_id: assignment.id, content });
      toast.success('Assignment submitted!');
      setShowSubmit(false);
      setContent('');
      onSubmitted();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid={`assignment-${assignment.id}`}
      className={`rounded-2xl border bg-[#18181b] p-6 transition-all ${
        assignment.already_submitted ? 'border-[#00ff66]/30' : 'border-[#27272a] hover:border-[#7c3aed]/50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#7c3aed]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold">{assignment.title}</h3>
              {assignment.already_submitted && (
                <span className="px-2 py-1 bg-[#00ff66]/20 text-[#00ff66] text-xs rounded-full flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  Submitted
                </span>
              )}
            </div>
            <p className="text-sm text-[#a1a1aa] mt-1">{assignment.description}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-[#7c3aed]/20 text-[#7c3aed] text-xs rounded-full font-mono flex-shrink-0">
          {assignment.total_marks} pts
        </span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-[#27272a]">
        <div className="text-xs text-[#a1a1aa] space-y-1">
          {assignment.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due {new Date(assignment.due_date).toLocaleString()}
            </div>
          )}
        </div>
        {assignment.already_submitted ? (
          <button
            disabled
            data-testid={`assignment-submitted-${assignment.id}`}
            className="px-4 py-2 bg-[#27272a]/50 text-[#a1a1aa] rounded-lg flex items-center gap-2 cursor-not-allowed text-sm"
          >
            <Lock className="w-4 h-4" />
            Already Submitted
          </button>
        ) : (
          <button
            onClick={() => setShowSubmit(!showSubmit)}
            data-testid={`assignment-submit-toggle-${assignment.id}`}
            className="px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
          >
            {showSubmit ? 'Cancel' : 'Submit Work'}
          </button>
        )}
      </div>

      {showSubmit && !assignment.already_submitted && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 pt-4 border-t border-[#27272a]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={5}
            data-testid={`assignment-content-${assignment.id}`}
            placeholder="Paste your work, links, or notes..."
            className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
          />
          <button
            type="submit"
            disabled={submitting}
            data-testid={`assignment-submit-${assignment.id}`}
            className="px-6 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-lg text-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </form>
      )}
    </div>
  );
};

// ============ Grades Tab ============
const GradesTab = ({ gradesList }) => {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Your Grades</h2>
        <p className="text-[#a1a1aa] text-sm mt-1">Only published grades appear here</p>
      </div>

      {gradesList.length === 0 ? (
        <EmptyState message="No grades yet. Your teacher will publish results here soon." tall />
      ) : (
        <div className="rounded-2xl border border-[#27272a] bg-[#18181b] overflow-hidden">
          <table className="w-full" data-testid="grades-table">
            <thead className="bg-[#09090b] border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Percentile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {gradesList.map((g) => {
                const pct = ((g.score / g.total_marks) * 100).toFixed(1);
                const color = pct >= 75 ? '#00ff66' : pct >= 50 ? '#00f0ff' : '#ff003c';
                return (
                  <tr key={g.id} data-testid={`grade-row-${g.id}`} className="hover:bg-[#09090b]/40 transition-colors">
                    <td className="px-6 py-4 font-medium">{g.title}</td>
                    <td className="px-6 py-4 font-mono">
                      {g.score}<span className="text-[#a1a1aa]">/{g.total_marks}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px] bg-[#27272a] rounded-full h-1.5">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}></div>
                        </div>
                        <span className="font-mono text-sm" style={{ color }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {g.percentile !== null && g.percentile !== undefined ? (
                        <span className="px-2.5 py-1 bg-[#7c3aed]/20 text-[#7c3aed] rounded-full text-xs font-mono">
                          {g.percentile}%ile
                        </span>
                      ) : (
                        <span className="text-[#a1a1aa] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#a1a1aa]">
                      {new Date(g.graded_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============ Announcements Tab ============
const AnnouncementsTab = ({ announcementsList }) => {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight">Announcements</h2>
        <p className="text-[#a1a1aa] text-sm mt-1">Latest updates from your instructors</p>
      </div>

      {announcementsList.length === 0 ? (
        <EmptyState message="No announcements yet" tall />
      ) : (
        <div className="space-y-4">
          {announcementsList.map((a, idx) => (
            <div
              key={a.id}
              data-testid={`announcement-card-${a.id}`}
              className={`animate-in stagger-${(idx % 6) + 1} rounded-2xl border border-[#27272a] bg-[#18181b] p-6 hover:border-[#00f0ff]/40 transition-colors`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/30 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-[#00f0ff]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    <span className="text-xs text-[#a1a1aa] flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#a1a1aa] leading-relaxed">{a.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ Reusable Empty State ============
const EmptyState = ({ message, tall = false }) => (
  <div className={`${tall ? 'py-24' : 'py-8'} text-center stripes rounded-xl`}>
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#27272a] mb-3">
      <ClipboardList className="w-6 h-6 text-[#a1a1aa]" />
    </div>
    <p className="text-[#a1a1aa] text-sm">{message}</p>
  </div>
);

export default StudentDashboard;
