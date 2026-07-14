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
  Trash2,
  Calendar,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/Logo';
import { Reveal } from '../hooks/useReveal';

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
    <div className="min-h-screen bg-[#09090b] relative">
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#00f0ff] flex items-center justify-center font-mono text-xs font-bold">
                {user?.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm">Admin · {user?.full_name}</p>
                <p className="text-xs text-[#a1a1aa]">Instructor console</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-button"
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
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'tests', label: 'Tests', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: FileText },
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'violations', label: 'Violations', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`admin-tab-${tab.id}`}
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
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-8">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl border border-[#27272a] bg-gradient-to-br from-[#18181b] via-[#0f0f11] to-[#18181b] p-8 md:p-10 animate-in">
                  <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#7c3aed]/25 to-transparent blur-3xl"></div>
                  <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-gradient-to-tr from-[#00f0ff]/20 to-transparent blur-3xl"></div>
                  <div className="grid-pattern absolute inset-0 opacity-40"></div>
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/5 text-xs font-mono uppercase tracking-wider text-[#7c3aed] mb-4">
                      <LayoutDashboard className="w-3 h-3" />
                      Instructor Console
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">
                      Welcome back, <span className="text-gradient">{user?.full_name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-[#a1a1aa] max-w-xl">
                      Manage your entire course from here — schedule tests, publish results, review violations, and keep the learning fair.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-6">
                      <button
                        onClick={() => setShowCreateTest(true)}
                        data-testid="hero-create-test"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white text-sm font-semibold hover:shadow-[0_10px_30px_rgba(0,240,255,0.3)] transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        New Test
                      </button>
                      <button
                        onClick={() => setShowCreateAnnouncement(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#27272a] hover:border-[#00f0ff] text-sm text-white transition-colors"
                      >
                        <Bell className="w-4 h-4" />
                        Announce
                      </button>
                      <button
                        onClick={() => setShowCreateUser(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#27272a] hover:border-[#00f0ff] text-sm text-white transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add User
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Students', value: stats.total_students, icon: Users, color: '#00f0ff', bg: 'from-[#00f0ff]/10 to-transparent' },
                    { label: 'Total Tests', value: stats.total_tests, icon: BookOpen, color: '#7c3aed', bg: 'from-[#7c3aed]/10 to-transparent' },
                    { label: 'Assignments', value: stats.total_assignments, icon: FileText, color: '#00ff66', bg: 'from-[#00ff66]/10 to-transparent' },
                    { label: 'Violations', value: stats.total_violations, icon: AlertTriangle, color: '#ff003c', bg: 'from-[#ff003c]/10 to-transparent' },
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={idx}
                        data-testid={`admin-stat-${idx}`}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-6 animate-in stagger-5">
                    <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#00f0ff]" />
                      Recent Tests
                    </h3>
                    <div className="space-y-3">
                      {tests.slice(0, 5).map((test) => (
                        <div
                          key={test.id}
                          data-testid={`recent-test-${test.id}`}
                          className="flex items-center justify-between p-3 border border-[#27272a] rounded-lg hover:border-[#00f0ff]/30 transition-colors"
                        >
                          <div>
                            <div className="font-medium">{test.title}</div>
                            <div className="text-xs text-[#a1a1aa]">{test.total_marks} marks · {test.questions.length} Q</div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-mono ${
                              test.results_published
                                ? 'bg-[#00ff66]/20 text-[#00ff66]'
                                : 'bg-[#a1a1aa]/20 text-[#a1a1aa]'
                            }`}
                          >
                            {test.results_published ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-6 animate-in stagger-6">
                    <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#ff003c]" />
                      Recent Violations
                    </h3>
                    <div className="space-y-3">
                      {violations.length === 0 ? (
                        <div className="text-sm text-[#a1a1aa] py-6 text-center">No cheating attempts. Class is honest!</div>
                      ) : (
                        violations.slice(0, 5).map((violation, idx) => (
                          <div
                            key={idx}
                            data-testid={`recent-violation-${idx}`}
                            className="p-3 border border-[#ff003c]/30 bg-[#ff003c]/5 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{violation.user_name}</span>
                              <span className="text-xs text-[#ff003c] font-mono">
                                {violation.tab_switch_count} switches
                              </span>
                            </div>
                            <div className="text-xs text-[#a1a1aa]">{violation.test_title}</div>
                          </div>
                        ))
                      )}
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
                  {tests.map((test, idx) => (
                    <Reveal key={test.id} delay={idx * 60}>
                      <div
                        data-testid={`admin-test-${test.id}`}
                        className="relative overflow-hidden bg-[#18181b] border border-[#27272a] rounded-2xl p-6 hover:border-[#00f0ff]/30 transition-all"
                      >
                        <div
                          className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 blur-2xl"
                          style={{ background: test.results_published ? '#00ff66' : '#7c3aed' }}
                        ></div>

                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: test.results_published ? '#00ff6615' : '#7c3aed15' }}
                              >
                                <BookOpen className="w-4 h-4" style={{ color: test.results_published ? '#00ff66' : '#7c3aed' }} />
                              </div>
                              <h3 className="text-lg font-semibold">{test.title}</h3>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-mono ${
                                test.results_published
                                  ? 'bg-[#00ff66]/20 text-[#00ff66]'
                                  : 'bg-[#a1a1aa]/20 text-[#a1a1aa]'
                              }`}
                            >
                              {test.results_published ? 'Published' : 'Hidden'}
                            </span>
                          </div>
                          <p className="text-sm text-[#a1a1aa] mb-4 line-clamp-2">{test.description}</p>
                          <div className="flex items-center gap-4 text-xs text-[#a1a1aa] mb-4 font-mono">
                            <span>{test.questions.length} Q</span>
                            <span>{test.total_marks} marks</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {test.duration_minutes}m
                            </span>
                          </div>
                          {(test.starts_at || test.ends_at || test.publish_at || test.unpublish_at) && (
                            <div className="text-xs text-[#a1a1aa] mb-4 space-y-1 border-t border-[#27272a] pt-3">
                              {test.starts_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#00f0ff]" />
                                  Opens: {new Date(test.starts_at).toLocaleString()}
                                </div>
                              )}
                              {test.ends_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-[#ff003c]" />
                                  Closes: {new Date(test.ends_at).toLocaleString()}
                                </div>
                              )}
                              {test.publish_at && (
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-[#00ff66]" />
                                  Auto-publish: {new Date(test.publish_at).toLocaleString()}
                                </div>
                              )}
                              {test.unpublish_at && (
                                <div className="flex items-center gap-1">
                                  <EyeOff className="w-3 h-3 text-[#a1a1aa]" />
                                  Auto-hide: {new Date(test.unpublish_at).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  if (test.results_published) {
                                    await admin.unpublishTest(test.id);
                                    toast.success('Results hidden');
                                  } else {
                                    await admin.publishTest(test.id);
                                    toast.success('Results published');
                                  }
                                  loadData();
                                } catch (error) { toast.error('Failed'); }
                              }}
                              data-testid={`toggle-publish-${test.id}`}
                              className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                                test.results_published
                                  ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white'
                                  : 'bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] text-white'
                              }`}
                            >
                              {test.results_published ? (
                                <><EyeOff className="w-4 h-4" />Unpublish</>
                              ) : (
                                <><Eye className="w-4 h-4" />Publish</>
                              )}
                            </button>
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Delete "${test.title}"? All submissions & grades will be removed. This cannot be undone.`)) return;
                                try {
                                  await admin.deleteTest(test.id);
                                  toast.success('Test deleted');
                                  loadData();
                                } catch (e) { toast.error('Failed to delete'); }
                              }}
                              data-testid={`delete-test-${test.id}`}
                              className="p-2 border border-[#ff003c]/30 text-[#ff003c] hover:bg-[#ff003c]/10 rounded-lg transition-colors"
                              title="Delete test"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Reveal>
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
  const [publishAt, setPublishAt] = useState('');
  const [unpublishAt, setUnpublishAt] = useState('');
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
        publish_at: publishAt ? new Date(publishAt).toISOString() : null,
        unpublish_at: unpublishAt ? new Date(unpublishAt).toISOString() : null,
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

          <div className="pt-4 border-t border-[#27272a]">
            <p className="text-sm font-semibold text-[#00ff66] mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Auto-publish schedule (optional)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Auto-Publish Results On
                </label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  data-testid="test-publish-at-input"
                  className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00ff66]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Auto-Unpublish Results On
                </label>
                <input
                  type="datetime-local"
                  value={unpublishAt}
                  onChange={(e) => setUnpublishAt(e.target.value)}
                  data-testid="test-unpublish-at-input"
                  className="w-full px-4 py-2 bg-[#09090b] border border-[#27272a] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#00ff66]"
                />
              </div>
            </div>
            <p className="text-xs text-[#a1a1aa] mt-2">Results will automatically publish/unpublish at these times. Leave blank to control manually.</p>
          </div>

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
