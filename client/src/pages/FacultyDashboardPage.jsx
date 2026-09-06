import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import ApplicantList from '../components/dashboard/ApplicantList.jsx';
import MentorshipBoard from '../components/dashboard/MentorshipBoard.jsx';
import ScheduleView from '../components/dashboard/ScheduleView.jsx';
import TaskItem from '../components/dashboard/TaskItem.jsx';
import {
  getFacultyList,
  getFaculty,
  getFacultySchedule,
  getApplications,
  decideApplication,
  getMentorships,
  getTasks,
  updateTask,
  deleteTask,
  createTask,
} from '../services/api.js';
import {
  Users,
  Calendar,
  BookOpen,
  Plus,
  Sparkles,
  Award,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';

export default function FacultyDashboardPage() {
  const { user } = useAuth();
  const { selectedFacultyId, setSelectedFacultyId, currentDate } = useApp();

  // If user is a teacher linked to a faculty, use their facultyId
  const effectiveFacultyId = user?.facultyId || selectedFacultyId || 'fac-001';

  const [facultyList, setFacultyList] = useState([]);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'mentorship' | 'schedule'

  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStart, setNewTaskStart] = useState('14:00');
  const [newTaskEnd, setNewTaskEnd] = useState('15:00');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const reloadData = async (fId) => {
    if (!fId) return;
    try {
      const [prof, apps, ments, sched, tlist] = await Promise.allSettled([
        getFaculty(fId),
        getApplications(fId),
        getMentorships(fId),
        getFacultySchedule(fId),
        getTasks(fId),
      ]);

      if (prof.status === 'fulfilled') setFacultyProfile(prof.value);
      if (apps.status === 'fulfilled') setApplications(apps.value || []);
      if (ments.status === 'fulfilled') setMentorships(ments.value || []);
      if (sched.status === 'fulfilled') setScheduleSlots(sched.value?.slots || []);
      if (tlist.status === 'fulfilled') setTasks(tlist.value || []);
    } catch (err) {
      console.warn('Error fetching faculty data:', err);
    }
  };

  useEffect(() => {
    getFacultyList()
      .then((list) => {
        setFacultyList(list);
        if (effectiveFacultyId) {
          setSelectedFacultyId(effectiveFacultyId);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    reloadData(effectiveFacultyId);
  }, [effectiveFacultyId]);

  const handleDecide = async (applicationId, status) => {
    try {
      await decideApplication(applicationId, status);
      // Reload applications and mentorship board
      reloadData(effectiveFacultyId);
    } catch (err) {
      console.error('Failed to decide application:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      reloadData(effectiveFacultyId);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      reloadData(effectiveFacultyId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsCreatingTask(true);
      const isoStart = `${currentDate}T${newTaskStart}:00.000Z`;
      const isoEnd = `${currentDate}T${newTaskEnd}:00.000Z`;

      await createTask({
        facultyId: effectiveFacultyId,
        title: newTaskTitle.trim(),
        startTime: isoStart,
        endTime: isoEnd,
      });

      setNewTaskTitle('');
      reloadData(effectiveFacultyId);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner / Header */}
      <div className="bg-surface border border-white/[0.06] rounded-card p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-bold text-accent-400 uppercase tracking-widest block mb-1">
              Faculty Research & Supervision Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {facultyProfile ? facultyProfile.name : 'Faculty Dashboard'}
            </h1>
            <p className="text-xs text-secondary mt-1 max-w-xl">
              {facultyProfile?.designation} &bull; Manage student research proposals, supervise accepted mentees, and coordinate schedule availability.
            </p>

            {/* Research interests tags */}
            {facultyProfile?.researchInterests && facultyProfile.researchInterests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {facultyProfile.researchInterests.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-alt border border-white/[0.06] text-accent-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stat Chips (per design system Section 5) */}
          <div className="flex sm:flex-col gap-2.5 shrink-0">
            <div className="bg-surface-alt border border-white/[0.06] px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <div className="text-lg font-extrabold text-white">{applications.length}</div>
              <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
                Proposals
              </div>
            </div>
            <div className="bg-surface-alt border border-white/[0.06] px-4 py-2.5 rounded-xl text-center min-w-[120px]">
              <div className="text-lg font-extrabold text-accent-400">
                {applications.filter((a) => a.status === 'ACCEPTED').length}
              </div>
              <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
                Mentees
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-surface border border-white/[0.06] rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'applicants'
              ? 'bg-accent-600 text-white shadow-md shadow-accent-600/20'
              : 'text-secondary hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Applicants ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mentorship')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'mentorship'
              ? 'bg-accent-600 text-white shadow-md shadow-accent-600/20'
              : 'text-secondary hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Mentorship Board</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-accent-600 text-white shadow-md shadow-accent-600/20'
              : 'text-secondary hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule & Tasks</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">
        {activeTab === 'applicants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-accent-400 uppercase tracking-widest block">
                  Proposal Evaluation
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Student Research Applicants
                </h2>
              </div>
              <span className="text-xs text-muted">
                Sorted by AI Semantic Match Score
              </span>
            </div>

            <ApplicantList applications={applications} onDecide={handleDecide} />
          </div>
        )}

        {activeTab === 'mentorship' && (
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-accent-400 uppercase tracking-widest block">
                Accepted Research Groups
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Mentorship Supervision Board
              </h2>
            </div>

            <MentorshipBoard mentorshipGroups={mentorships} />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <ScheduleView slots={scheduleSlots} tasks={tasks} />

            {/* Task Management Panel */}
            <div className="bg-surface border border-white/[0.06] rounded-card p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-surface-alt text-accent-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-accent-400 uppercase tracking-widest block">
                      Daily To-Dos
                    </span>
                    <h3 className="font-bold text-white text-base">Tasks & Scheduled Blocks</h3>
                  </div>
                </div>
                <span className="text-xs text-muted font-medium">
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New task title (e.g. Review thesis papers)..."
                  className="flex-1 bg-surface-alt border border-white/[0.06] focus:border-accent-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-muted focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={newTaskStart}
                    onChange={(e) => setNewTaskStart(e.target.value)}
                    className="bg-surface-alt border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <span className="text-muted text-xs">-</span>
                  <input
                    type="time"
                    value={newTaskEnd}
                    onChange={(e) => setNewTaskEnd(e.target.value)}
                    className="bg-surface-alt border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingTask || !newTaskTitle.trim()}
                  className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </form>

              {/* Task List */}
              <div className="space-y-2.5">
                {tasks.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6">No tasks scheduled for today.</p>
                ) : (
                  tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
