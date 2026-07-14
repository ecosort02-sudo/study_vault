import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { admin } from '../lib/api';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bell,
  AlertTriangle,
  LogOut,
  Plus,
  Users,
  ClipboardList,
  TrendingUp,
  Eye,
  EyeOff,
  UserPlus,
  Pencil,
  UserX,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/Logo';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [tests, setTests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [violations, setViolations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [statsRes, testsRes, assignmentsRes, violationsRes, usersRes] = await Promise.all([
        admin.getStats(),
        admin.getAllTests(),
        admin.getAllAssignments(),
        admin.getViolations(),
        admin.listUsers(),
      ]);

      setStats(statsRes.data);
      setTests(testsRes.data);
      setAssignments(assignmentsRes.data);
      setViolations(violationsRes.data);
      setUsers(usersRes.data);
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

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="noise-bg"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#27272a] bg-[#18181b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="md" />
            <div className="hidden md:block h-8 w-px bg-[#27272a]"></div>
            <div className="hidden md:block">
              <p className="text-sm text-[#a1a1aa]">Admin • {user?.full_name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-button"
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
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'tests', label: 'Tests', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'violations', label: 'Violations', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`admin-tab-${tab.id}`}
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
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Students', value: stats.total_students, icon: Users, color: '#00f0ff' },
                    { label: 'Total Tests', value: stats.total_tests, icon: BookOpen, color: '#7c3aed' },
                    { label: 'Assignments', value: stats.total_assignments, icon: FileText, color: '#00ff66' },
                    { label: 'Violations', value: stats.total_violations, icon: AlertTriangle, color: '#ff003c' },
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={idx}
                        data-testid={`admin-stat-${idx}`}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Tests</h3>
                    <div className="space-y-3">
                      {tests.slice(0, 5).map((test) => (
                        <div
                          key={test.id}
                          data-testid={`recent-test-${test.id}`}
                          className="flex items-center justify-between p-3 border border-[#27272a] rounded-md"
                        >
                          <div>
                            <div className="font-medium">{test.title}</div>
                            <div className="text-xs text-[#a1a1aa]">{test.total_marks} marks</div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              test.is_active
                                ? 'bg-[#00ff66]/20 text-[#00ff66]'
                                : 'bg-[#a1a1aa]/20 text-[#a1a1aa]'
                            }`}
                          >
                            {test.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#ff003c]" />
                      Recent Violations
                    </h3>
                    <div className="space-y-3">
                      {violations.slice(0, 5).map((violation, idx) => (
                        <div
                          key={idx}
                          data-testid={`recent-violation-${idx}`}
                          className="p-3 border border-[#ff003c]/30 bg-[#ff003c]/5 rounded-md"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{violation.user_name}</span>
                            <span className="text-xs text-[#ff003c] font-mono">
                              {violation.tab_switch_count} switches
                            </span>
                          </div>
                          <div className="text-xs text-[#a1a1aa]">{violation.test_title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl font-bold">Manage Tests</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={async () => {
                        try {
                          const res = await admin.publishAllTests();
                          toast.success(res.data.message);
                          loadData();
                        } catch (e) { toast.error('Failed'); }
                      }}
                      data-testid="publish-all-tests-button"
                      className="flex items-center gap-2 px-4 py-2 border border-[#00ff66]/40 text-[#00ff66] hover:bg-[#00ff66]/10 rounded-md text-sm font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Publish All Results
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await admin.unpublishAllTests();
                          toast.success(res.data.message);
                          loadData();
                        } catch (e) { toast.error('Failed'); }
                      }}
                      data-testid="unpublish-all-tests-button"
                      className="flex items-center gap-2 px-4 py-2 border border-[#27272a] text-[#a1a1aa] hover:border-[#a1a1aa] rounded-md text-sm font-semibold transition-colors"
                    >
                      <EyeOff className="w-4 h-4" />
                      Unpublish All
                    </button>
                    <button
                      onClick={() => setShowCreateTest(true)}
                      data-testid="create-test-button"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md hover:shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Create Test
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tests.map((test) => (
                    <div
                      key={test.id}
                      data-testid={`admin-test-${test.id}`}
                      className="bg-[#18181b] border border-[#27272a] rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold">{test.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            test.results_published
                              ? 'bg-[#00ff66]/20 text-[#00ff66]'
                              : 'bg-[#a1a1aa]/20 text-[#a1a1aa]'
                          }`}
                        >
                          {test.results_published ? 'Results Published' : 'Results Hidden'}
                        </span>
                      </div>
                      <p className="text-sm text-[#a1a1aa] mb-4">{test.description}</p>
                      <div className="flex items-center justify-between text-sm mb-4">
                        <span className="text-[#a1a1aa]">{test.questions.length} questions</span>
                        <span className="text-[#a1a1aa]">{test.total_marks} marks</span>
                        <span className="text-[#a1a1aa]">{test.duration_minutes} mins</span>
                      </div>
                      {(test.starts_at || test.ends_at) && (
                        <div className="text-xs text-[#a1a1aa] mb-4 space-y-1">
                          {test.starts_at && <div>Starts: {new Date(test.starts_at).toLocaleString()}</div>}
                          {test.ends_at && <div>Ends: {new Date(test.ends_at).toLocaleString()}</div>}
                        </div>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            if (test.results_published) {
                              await admin.unpublishTest(test.id);
                              toast.success('Results hidden from students');
                            } else {
                              await admin.publishTest(test.id);
                              toast.success('Results published to students');
                            }
                            loadData();
                          } catch (error) {
                            toast.error('Failed to update publish status');
                          }
                        }}
                        data-testid={`toggle-publish-${test.id}`}
                        className={`w-full py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                          test.results_published
                            ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white'
                            : 'bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white'
                        }`}
                      >
                        {test.results_published ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Unpublish Results
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Publish Results
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Manage Assignments</h2>
                  <button
                    onClick={() => setShowCreateAssignment(true)}
                    data-testid="create-assignment-button"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Assignment
                  </button>
                </div>

                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      data-testid={`admin-assignment-${assignment.id}`}
                      className="bg-[#18181b] border border-[#27272a] rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                        <span className="px-3 py-1 bg-[#7c3aed]/20 text-[#7c3aed] text-xs rounded-full font-mono">
                          {assignment.total_marks} marks
                        </span>
                      </div>
                      <p className="text-[#a1a1aa] mb-4">{assignment.description}</p>
                      {assignment.due_date && (
                        <div className="text-sm text-[#a1a1aa]">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Manage Announcements</h2>
                  <button
                    onClick={() => setShowCreateAnnouncement(true)}
                    data-testid="create-announcement-button"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Announcement
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-7 h-7 text-[#00f0ff]" />
                    Manage Users
                  </h2>
                  <button
                    onClick={() => setShowCreateUser(true)}
                    data-testid="create-user-button"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md hover:shadow-lg transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create User
                  </button>
                </div>

                {users.length === 0 ? (
                  <div className="text-center py-12 text-[#a1a1aa]">No users yet</div>
                ) : (
                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden">
                    <table className="w-full" data-testid="users-table">
                      <thead className="bg-[#09090b] border-b border-[#27272a]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">Joined</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-[#a1a1aa] uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#27272a]">
                        {users.map((u) => (
                          <tr key={u.id} data-testid={`user-row-${u.id}`} className="hover:bg-[#09090b]/50">
                            <td className="px-6 py-4 font-medium">{u.full_name}</td>
                            <td className="px-6 py-4 text-sm text-[#a1a1aa]">{u.email}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  u.role === 'admin'
                                    ? 'bg-[#7c3aed]/20 text-[#7c3aed]'
                                    : 'bg-[#00f0ff]/20 text-[#00f0ff]'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  u.is_active
                                    ? 'bg-[#00ff66]/20 text-[#00ff66]'
                                    : 'bg-[#ff003c]/20 text-[#ff003c]'
                                }`}
                              >
                                {u.is_active ? 'Active' : 'Deactivated'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#a1a1aa]">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setEditingUser(u)}
                                  data-testid={`edit-user-${u.id}`}
                                  className="p-2 hover:bg-[#00f0ff]/10 text-[#00f0ff] rounded-md transition-colors"
                                  title="Edit user"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                {u.id !== user.id && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await admin.updateUser(u.id, { is_active: !u.is_active });
                                        toast.success(u.is_active ? 'User deactivated' : 'User activated');
                                        loadData();
                                      } catch (e) {
                                        toast.error(e.response?.data?.detail || 'Failed to update user');
                                      }
                                    }}
                                    data-testid={`toggle-user-${u.id}`}
                                    className={`p-2 rounded-md transition-colors ${
                                      u.is_active
                                        ? 'hover:bg-[#ff003c]/10 text-[#ff003c]'
                                        : 'hover:bg-[#00ff66]/10 text-[#00ff66]'
                                    }`}
                                    title={u.is_active ? 'Deactivate' : 'Activate'}
                                  >
                                    {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'violations' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-7 h-7 text-[#ff003c]" />
                  Cheating Violations
                </h2>

                {violations.length === 0 ? (
                  <div className="text-center py-12 text-[#a1a1aa]">No violations reported</div>
                ) : (
                  <div className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden">
                    <table className="w-full" data-testid="violations-table">
                      <thead className="bg-[#09090b] border-b border-[#27272a]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                            Test
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                            Tab Switches
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a1a1aa] uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#27272a]">
                        {violations.map((violation, idx) => (
                          <tr key={idx} data-testid={`violation-row-${idx}`} className="hover:bg-[#09090b]/50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium">{violation.user_name}</div>
                                <div className="text-xs text-[#a1a1aa]">{violation.user_email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">{violation.test_title}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-[#ff003c]/20 text-[#ff003c] rounded-full text-sm font-mono">
                                {violation.tab_switch_count}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm">{violation.score}</td>
                            <td className="px-6 py-4 text-sm text-[#a1a1aa]">
                              {new Date(violation.submitted_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showCreateTest && (
        <CreateTestModal onClose={() => setShowCreateTest(false)} onSuccess={loadData} />
      )}
      {showCreateAssignment && (
        <CreateAssignmentModal onClose={() => setShowCreateAssignment(false)} onSuccess={loadData} />
      )}
      {showCreateAnnouncement && (
        <CreateAnnouncementModal onClose={() => setShowCreateAnnouncement(false)} onSuccess={loadData} />
      )}
      {showCreateUser && (
        <CreateUserModal onClose={() => setShowCreateUser(false)} onSuccess={loadData} />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => { loadData(); setEditingUser(null); }}
        />
      )}
    </div>
  );
};

// Edit User Modal
const EditUserModal = ({ user, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { full_name: fullName, email, role };
      if (password) payload.password = password;
      await admin.updateUser(user.id, payload);
      toast.success('User updated successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-lg w-full">
        <div className="border-b border-[#27272a] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Pencil className="w-6 h-6 text-[#00f0ff]" />
            Edit User
          </h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              data-testid="edit-user-fullname"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="edit-user-email"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              data-testid="edit-user-role"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              New Password <span className="text-xs text-[#a1a1aa]">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="edit-user-password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-[#27272a] rounded-md hover:border-[#00f0ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              data-testid="save-edit-user"
              className="flex-1 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create User Modal
const CreateUserModal = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await admin.createUser({ email, password, full_name: fullName, role });
      toast.success(`${role === 'admin' ? 'Admin' : 'Student'} account created!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-lg w-full">
        <div className="border-b border-[#27272a] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#00f0ff]" />
            Create User Account
          </h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              data-testid="user-fullname-input"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="user-email-input"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              data-testid="user-password-input"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              data-testid="user-role-select"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-[#27272a] rounded-md hover:border-[#00f0ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              data-testid="submit-user-button"
              className="flex-1 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Test Modal Component
const CreateTestModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correct_option: 0, marks: 1 },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_option: 0, marks: 1 }]);
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    try {
      await admin.createTest({
        title,
        description,
        duration_minutes: duration,
        questions,
        total_marks: totalMarks,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });
      toast.success('Test created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create test');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#18181b] border-b border-[#27272a] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Test</h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Test Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-testid="test-title-input"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="test-description-input"
              rows={3}
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              required
              data-testid="test-duration-input"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Available From <span className="text-xs text-[#a1a1aa]">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                data-testid="test-starts-at-input"
                className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Until <span className="text-xs text-[#a1a1aa]">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                data-testid="test-ends-at-input"
                className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
              />
            </div>
          </div>
          <p className="text-xs text-[#a1a1aa] -mt-2">Leave blank for always available. Students only see the test within this window.</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                data-testid="add-question-button"
                className="px-3 py-1 bg-[#00f0ff]/20 text-[#00f0ff] rounded-md text-sm"
              >
                + Add Question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="border border-[#27272a] rounded-lg p-4 space-y-3">
                <input
                  type="text"
                  placeholder={`Question ${qIdx + 1}`}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                  data-testid={`question-${qIdx}-text`}
                  required
                  className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      placeholder={`Option ${oIdx + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                      data-testid={`question-${qIdx}-option-${oIdx}`}
                      required
                      className="px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white text-sm"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm">Correct Option:</label>
                  <select
                    value={q.correct_option}
                    onChange={(e) => updateQuestion(qIdx, 'correct_option', parseInt(e.target.value))}
                    data-testid={`question-${qIdx}-correct`}
                    className="px-3 py-1 bg-[#09090b] border border-[#27272a] rounded-md text-white text-sm"
                  >
                    {q.options.map((_, oIdx) => (
                      <option key={oIdx} value={oIdx}>
                        Option {oIdx + 1}
                      </option>
                    ))}
                  </select>

                  <label className="text-sm ml-auto">Marks:</label>
                  <input
                    type="number"
                    value={q.marks}
                    onChange={(e) => updateQuestion(qIdx, 'marks', parseInt(e.target.value))}
                    data-testid={`question-${qIdx}-marks`}
                    min="1"
                    className="w-20 px-3 py-1 bg-[#09090b] border border-[#27272a] rounded-md text-white text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-[#27272a] rounded-md hover:border-[#00f0ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-test-button"
              className="flex-1 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md"
            >
              Create Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Assignment Modal
const CreateAssignmentModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await admin.createAssignment({
        title,
        description,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        total_marks: totalMarks,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });
      toast.success('Assignment created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-2xl w-full">
        <div className="border-b border-[#27272a] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Assignment</h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Assignment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-testid="assignment-title-input"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              data-testid="assignment-description-input"
              rows={4}
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                data-testid="assignment-due-date-input"
                className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value))}
                required
                data-testid="assignment-marks-input"
                className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Available From <span className="text-xs text-[#a1a1aa]">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                data-testid="assignment-starts-at-input"
                className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Until <span className="text-xs text-[#a1a1aa]">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                data-testid="assignment-ends-at-input"
                className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
              />
            </div>
          </div>
          <p className="text-xs text-[#a1a1aa] -mt-2">Leave blank for always available. Controls when students see this assignment.</p>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-[#27272a] rounded-md hover:border-[#00f0ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-assignment-button"
              className="flex-1 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Announcement Modal
const CreateAnnouncementModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await admin.createAnnouncement({ title, content });
      toast.success('Announcement created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-2xl w-full">
        <div className="border-b border-[#27272a] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Announcement</h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Announcement Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-testid="announcement-title-input"
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              data-testid="announcement-content-input"
              rows={5}
              className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-[#27272a] rounded-md hover:border-[#00f0ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-announcement-button"
              className="flex-1 py-2 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white font-semibold rounded-md"
            >
              Create Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
