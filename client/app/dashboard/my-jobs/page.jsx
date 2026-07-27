'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import {
  Briefcase,
  Calendar,
  Building2,
  Phone,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  Check,
  Tag,
  DollarSign,
} from 'lucide-react';

export default function MyJobsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/my-jobs');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/jobs/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        setFeedback(`Task status updated to '${newStatus}'.`);
        fetchTasks();
      }
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'done':
        return { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      default:
        return { label: 'Assigned', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Execution Portal • User: {user?.name} ({user?.role})
          </div>
          <h1 className="text-2xl font-extrabold font-serif-title text-white">
            Task Assignments & Event Execution
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            View venue details, event dates, customer contacts, and update task progress.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Task Cards List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Loading assigned task roster...
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-8 text-center text-slate-400 glass-card rounded-2xl">
          No tasks currently assigned to your account.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => {
            const badge = getStatusBadge(task.status);
            return (
              <div
                key={task.id}
                className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Event #{task.booking_id}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5">
                        {task.package_name || task.category_name}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Details Meta */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Building2 className="w-3.5 h-3.5" /> Venue:
                      </span>
                      <span className="font-semibold text-white">{task.hall_name}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" /> Date & Slot:
                      </span>
                      <span className="font-semibold text-white">
                        {task.event_date} ({task.slot || 'Night'} Slot)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <User className="w-3.5 h-3.5" /> Customer Contact:
                      </span>
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        {task.customer_name} ({task.customer_phone})
                      </span>
                    </div>

                    {task.commission_earned && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-emerald-400">
                        <span>Partner Commission Earned:</span>
                        <span className="font-mono text-sm">
                          PKR {Number(task.commission_earned).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  {task.status === 'assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Work (In Progress)
                    </button>
                  )}

                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'done')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Complete Task (Mark Done)
                    </button>
                  )}

                  {task.status === 'done' && (
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Work Execution Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
