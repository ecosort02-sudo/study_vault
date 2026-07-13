import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tests, assignments, grades, announcements } from '../lib/api';
import { BookOpen, FileText, Award, Bell, LogOut, ClipboardList, Lock, CheckCircle2 } from 'lucide-react';
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
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
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

  useEffect(() => {
    loadData();
  }, []);

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

  const stats = [
    { label: 'Available Tests', value: testsList.length, icon: BookOpen, color: '#00f0ff' },
    { label: 'Assignments', value: assignmentsList.length, icon: FileText, color: '#7c3aed' },
    { label: 'Total Grades', value: gradesList.length, icon: Award, color: '#00ff66' },
    { label: 'Announcements', value: announcementsList.length, icon: Bell, color: '#ff003c' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] prevent-inspect">
      <div className="noise-bg"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-[#27272a] bg-[#18181b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="md" />
            <div className="hidden md:block h-8 w-px bg-[#27272a]"></div>
            <div className="hidden md:block">
              <p className="text-sm text-[#a1a1aa]">Welcome, {user?.full_name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-md hover:border-[#00f0ff] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="relative z-10 border-b border-[#27272a] bg-[#18181b]/60 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ClipboardList },
              { id: 'tests', label: 'Tests', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'grades', label: 'Grades', icon: Award },
              { id: 'announcements', label: 'Announcements', icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`tab-${tab.id}`}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#00f0ff] text-[#00f0ff]'
                      : 'border-transparent text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={idx}
                        data-testid={`stat-card-${idx}`}
                        className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 hover:border-[#00f0ff] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${stat.color}15` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: stat.color }} />
                          </div>
                          <div className="text-3xl font-bold font-mono">{stat.value}</div>
                        </div>
                        <div className="text-sm text-[#a1a1aa]">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
                  {announcementsList.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      data-testid={`announcement-${announcement.id}`}
                      className="border-l-2 border-[#00f0ff] pl-4 py-2 mb-3"
                    >
                      <div className="font-medium">{announcement.title}</div>
                      <div className="text-sm text-[#a1a1aa] mt-1">{announcement.content}</div>
                      <div className="text-xs text-[#a1a1aa] mt-2">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Available Tests</h2>
                {testsList.length === 0 ? (
                  <div className="text-center py-12 text-[#a1a1aa]">No tests available</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testsList.map((test) => (
                      <div
                        key={test.id}
                        data-testid={`test-card-${test.id}`}
                        className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 card-hover"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold">{test.title}</h3>
                          {test.already_attempted && (
                            <span className="px-2 py-1 bg-[#00ff66]/20 text-[#00ff66] text-xs rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Attempted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#a1a1aa] mb-4">{test.description}</p>
                        <div className="flex items-center justify-between text-sm text-[#a1a1aa] mb-4">
                          <span>Duration: {test.duration_minutes} mins</span>
                          <span>Total Marks: {test.total_marks}</span>
                        </div>
                        {test.ends_at && (
                          <div className="text-xs text-[#a1a1aa] mb-3">
                            Closes: {new Date(test.ends_at).toLocaleString()}
                          </div>
                        )}
                        {test.already_attempted ? (
                          <button
                            disabled
                            data-testid={`test-attempted-${test.id}`}
                            className="w-full py-2 bg-[#27272a] text-[#a1a1aa] font-semibold rounded-md flex items-center justify-center gap-2 cursor-not-allowed"
                          >
                            <Lock className="w-4 h-4" />
                            Already Attempted
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/test/${test.id}`)}
                            data-testid={`start-test-${test.id}`}
                            className="w-full py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md hover:shadow-lg transition-all"
                          >
                            Start Test
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Assignments</h2>
                {assignmentsList.length === 0 ? (
                  <div className="text-center py-12 text-[#a1a1aa]">No assignments available</div>
                ) : (
                  <div className="space-y-4">
                    {assignmentsList.map((assignment) => (
                      <AssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        onSubmitted={loadData}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Your Grades</h2>
                {gradesList.length === 0 ? (
                  <div className="text-center py-12 text-[#a1a1aa]">No grades available</div>
                ) : (
                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden">
                    <table className="w-full" data-testid="grades-table">
                      <thead className="bg-[#09090b] border-b border-[#27272a]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                            Percentile
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#27272a]">
                        {gradesList.map((grade) => {
                          const percentage = ((grade.score / grade.total_marks) * 100).toFixed(1);
                          return (
                            <tr key={grade.id} data-testid={`grade-row-${grade.id}`}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">{grade.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap font-mono">
                                {grade.score}/{grade.total_marks}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-mono ${
                                    percentage >= 75
                                      ? 'bg-[#00ff66]/20 text-[#00ff66]'
                                      : percentage >= 50
                                      ? 'bg-[#00f0ff]/20 text-[#00f0ff]'
                                      : 'bg-[#ff003c]/20 text-[#ff003c]'
                                  }`}
                                >
                                  {percentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {grade.percentile !== null && grade.percentile !== undefined ? (
                                  <span className="px-2 py-1 bg-[#7c3aed]/20 text-[#7c3aed] rounded-full text-xs font-mono">
                                    {grade.percentile}%ile
                                  </span>
                                ) : (
                                  <span className="text-[#a1a1aa] text-xs">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a1a1aa]">
                                {new Date(grade.graded_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Announcements</h2>
                {announcementsList.length === 0 ? (
                  <div className="text-center py-12 text-[#a1a1aa]">No announcements</div>
                ) : (
                  <div className="space-y-4">
                    {announcementsList.map((announcement) => (
                      <div
                        key={announcement.id}
                        data-testid={`announcement-card-${announcement.id}`}
                        className="bg-[#18181b] border border-[#27272a] rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold">{announcement.title}</h3>
                          <span className="text-xs text-[#a1a1aa]">
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#a1a1aa]">{announcement.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;

// AssignmentCard component with submission capability
const AssignmentCard = ({ assignment, onSubmitted }) => {
  const [showSubmit, setShowSubmit] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await assignments.submit({ assignment_id: assignment.id, content });
      toast.success('Assignment submitted successfully!');
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
      className="bg-[#18181b] border border-[#27272a] rounded-lg p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{assignment.title}</h3>
          {assignment.already_submitted && (
            <span className="px-2 py-1 bg-[#00ff66]/20 text-[#00ff66] text-xs rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Submitted
            </span>
          )}
        </div>
        <span className="px-3 py-1 bg-[#7c3aed]/20 text-[#7c3aed] text-xs rounded-full font-mono">
          {assignment.total_marks} marks
        </span>
      </div>
      <p className="text-[#a1a1aa] mb-4">{assignment.description}</p>
      <div className="flex items-center justify-between">
        <div className="text-sm text-[#a1a1aa] space-y-1">
          {assignment.due_date && (
            <div>Due: {new Date(assignment.due_date).toLocaleString()}</div>
          )}
          {assignment.ends_at && (
            <div>Closes: {new Date(assignment.ends_at).toLocaleString()}</div>
          )}
        </div>
        {assignment.already_submitted ? (
          <button
            disabled
            data-testid={`assignment-submitted-${assignment.id}`}
            className="px-4 py-2 bg-[#27272a] text-[#a1a1aa] rounded-md flex items-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            Already Submitted
          </button>
        ) : (
          <button
            onClick={() => setShowSubmit(!showSubmit)}
            data-testid={`assignment-submit-toggle-${assignment.id}`}
            className="px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white rounded-md text-sm font-semibold"
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
            placeholder="Enter your submission (paste text, links, or notes)..."
            className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
          />
          <button
            type="submit"
            disabled={submitting}
            data-testid={`assignment-submit-${assignment.id}`}
            className="px-6 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </form>
      )}
    </div>
  );
};
