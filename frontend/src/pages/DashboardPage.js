import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import StatCard from '../components/StatCard';
import TaskModal from '../components/TaskModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, isOverdue, getPriorityBadgeClass, getStatusBadgeClass } from '../utils/formatters';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard metrics. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      await taskService.createTask(taskData);
      setShowModal(false);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !stats) {
    return <LoadingSpinner text="Loading dashboard metrics..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Dashboard</h2>
          <p className="text-muted small mb-0">Overview of your task progress and upcoming deadlines</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={fetchStats}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            title="Refresh statistics"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg"></i>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-4" role="alert">
          {error}
        </div>
      )}

      {/* 5 Summary Cards */}
      <div className="row g-3 mb-4">
        <StatCard
          title="Total Tasks"
          count={stats?.total_tasks || 0}
          icon="bi-collection"
          colorClass="text-primary"
          bgClass="bg-primary-subtle"
        />
        <StatCard
          title="Pending"
          count={stats?.pending_tasks || 0}
          icon="bi-clock-history"
          colorClass="text-secondary"
          bgClass="bg-secondary-subtle"
        />
        <StatCard
          title="In Progress"
          count={stats?.in_progress_tasks || 0}
          icon="bi-arrow-repeat"
          colorClass="text-info"
          bgClass="bg-info-subtle"
        />
        <StatCard
          title="Completed"
          count={stats?.completed_tasks || 0}
          icon="bi-check2-circle"
          colorClass="text-success"
          bgClass="bg-success-subtle"
        />
        <StatCard
          title="Overdue"
          count={stats?.overdue_tasks || 0}
          icon="bi-exclamation-octagon"
          colorClass="text-danger"
          bgClass="bg-danger-subtle"
        />
      </div>

      {/* Completion Progress Bar */}
      <div className="tf-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold text-dark">Overall Task Completion</span>
          <span className="fw-bold text-primary">{stats?.completion_rate || 0}%</span>
        </div>
        <div className="progress" style={{ height: '10px' }}>
          <div
            className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: `${stats?.completion_rate || 0}%` }}
            aria-valuenow={stats?.completion_rate || 0}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Deadlines & Recent Tasks */}
      <div className="row g-4">
        {/* Upcoming Tasks */}
        <div className="col-12 col-lg-6">
          <div className="tf-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-calendar-check text-warning"></i>
                Upcoming Deadlines
              </h5>
              <Link to="/tasks" className="small text-decoration-none text-primary fw-medium">
                View all
              </Link>
            </div>

            {stats?.upcoming_tasks && stats.upcoming_tasks.length > 0 ? (
              <div className="list-group list-group-flush">
                {stats.upcoming_tasks.map((task) => (
                  <div key={task.id} className="list-group-item px-0 py-3 border-bottom d-flex justify-content-between align-items-center gap-2">
                    <div className="text-truncate">
                      <h6 className="mb-1 text-dark fw-semibold text-truncate">{task.title}</h6>
                      <div className="d-flex align-items-center gap-2 small text-muted">
                        <span className={`badge ${getPriorityBadgeClass(task.priority)} px-2 py-0`}>
                          {task.priority}
                        </span>
                        <span><i className="bi bi-calendar-event me-1"></i>{formatDate(task.due_date)}</span>
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(task.status)} px-2 py-1`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-calendar-x fs-2 d-block mb-2 text-secondary"></i>
                <p className="small mb-0">No upcoming deadlines found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="col-12 col-lg-6">
          <div className="tf-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-primary"></i>
                Recent Tasks
              </h5>
              <Link to="/tasks" className="small text-decoration-none text-primary fw-medium">
                View all
              </Link>
            </div>

            {stats?.recent_tasks && stats.recent_tasks.length > 0 ? (
              <div className="list-group list-group-flush">
                {stats.recent_tasks.map((task) => {
                  const overdue = isOverdue(task.due_date, task.status);
                  return (
                    <div key={task.id} className="list-group-item px-0 py-3 border-bottom d-flex justify-content-between align-items-center gap-2">
                      <div className="text-truncate">
                        <h6 className={`mb-1 fw-semibold text-truncate ${task.status === 'Completed' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                          {task.title}
                        </h6>
                        <div className="d-flex align-items-center gap-2 small text-muted">
                          <span className={`badge ${getPriorityBadgeClass(task.priority)} px-2 py-0`}>
                            {task.priority}
                          </span>
                          <span className={overdue ? 'text-danger fw-semibold' : ''}>
                            <i className="bi bi-calendar-event me-1"></i>{formatDate(task.due_date)}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(task.status)} px-2 py-1`}>
                        {task.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                <p className="small mb-0">No tasks created yet. Click "New Task" to begin!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleCreateTask}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default DashboardPage;
