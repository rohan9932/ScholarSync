import React, { useState, useEffect } from 'react';
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
  createTask
} from '../services/api.js';
import { Users, Calendar, Award, Plus, Sparkles } from 'lucide-react';

export default function FacultyDashboardPage() {
  const { selectedFacultyId, setSelectedFacultyId } = useApp();
  const [facultyList, setFacultyList] = useState([]);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'mentorship' | 'schedule'
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    // Load faculty list
    getFacultyList()
      .then((data) => {
        if (data && data.length > 0) {
          setFacultyList(data);
          if (!selectedFacultyId) setSelectedFacultyId(data[0].id);
        } else {
          // Fallback initial mocked list for Phase 0 UI preview
          const mock = [
            { id: 'fac-001', name: 'Dr. Mohammad Shafiul Alam', designation: 'Professor' },
            { id: 'fac-002', name: 'Dr. Kazi A Kalpoma', designation: 'Professor' },
          ];
          setFacultyList(mock);
        }
      })
      .catch(() => {
        setFacultyList([
          { id: 'fac-001', name: 'Dr. Mohammad Shafiul Alam', designation: 'Professor' },
        ]);
      });
  }, []);

  useEffect(() => {
    if (!selectedFacultyId) return;

    getFaculty(selectedFacultyId).then(setFacultyProfile).catch(() => {});
    getApplications(selectedFacultyId).then(setApplications).catch(() => {});
    getMentorships(selectedFacultyId).then(setMentorships).catch(() => {});
    getFacultySchedule(selectedFacultyId).then((res) => setScheduleSlots(res?.slots || [])).catch(() => {});
    getTasks(selectedFacultyId).then(setTasks).catch(() => {});
  }, [selectedFacultyId]);

  const handleDecide = async (id, status) => {
    try {
      await decideApplication(id, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      if (status === 'ACCEPTED') {
        getMentorships(selectedFacultyId).then(setMentorships);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const created = await createTask({
        facultyId: selectedFacultyId,
        title: newTaskTitle,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'PENDING'
      });
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Faculty Switcher */}
      <div className="bg-slate-800/40 border border-slate-700/70 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Faculty Workspace
          </div>
          <h1 className="text-2xl font-bold text-white">
            {facultyProfile?.name || 'Faculty Portal'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {facultyProfile?.designation || 'Academic Staff'} &bull; {facultyProfile?.email || 'scholarsync@aust.edu'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 whitespace-nowrap">Active Faculty:</label>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.designation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'applicants'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Applicants & AI Matches</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/50">
            {applications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mentorship')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'mentorship'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mentorship Board</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'schedule'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Timetable & Tasks</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'applicants' && (
        <ApplicantList applications={applications} onDecide={handleDecide} />
      )}

      {activeTab === 'mentorship' && (
        <MentorshipBoard mentorshipGroups={mentorships} />
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <ScheduleView slots={scheduleSlots} tasks={tasks} />

          {/* Quick Task Creation & Task List */}
          <div className="bg-slate-800/40 border border-slate-700/70 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white text-base">Allocated Tasks & Review Deadlines</h3>

            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add new task (e.g. Thesis Draft Review)..."
                className="flex-1 bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs px-4 py-2 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </form>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No pending tasks for this faculty.</p>
              ) : (
                tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={handleTaskStatus}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
