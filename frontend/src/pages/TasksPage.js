import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        sort_by: sortBy,
        order,
      };
      if (search.trim()) params.search = search.trim();
      if (status !== 'All') params.status = status;
      if (priority !== 'All') params.priority = priority;

      const data = await taskService.getTasks(params);
      setTasks(data.tasks);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, sortBy, order]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250); // slight debounce for search input
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
      } else {
        await taskService.createTask(taskData);
      }
      setShowTaskModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await taskService.updateTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (err) {
      fetchTasks(); // revert on failure
    }
  };

  const handleOpenDeleteModal = (task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setIsDeleting(true);
      await taskService.deleteTask(deletingTask.id);
      setShowDeleteModal(false);
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">All Tasks</h2>
          <p className="text-muted small mb-0">
            {total} {total === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg"></i>
          <span>Create Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="tf-card p-3 mb-4">
        <div className="row g-2">
          {/* Search Input */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearch('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Sort By Field */}
          <div className="col-8 col-md-3">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Sort by: Date Created</option>
              <option value="due_date">Sort by: Due Date</option>
              <option value="title">Sort by: Title</option>
              <option value="priority">Sort by: Priority</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <div className="col-4 col-md-1">
            <button
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="btn btn-outline-secondary w-100"
              title={order === 'asc' ? 'Ascending' : 'Descending'}
            >
              <i className={`bi bi-sort-${order === 'asc' ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger py-2 small mb-4" role="alert">
          {error}
        </div>
      )}

      {/* Task List / Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching tasks..." />
      ) : tasks.length > 0 ? (
        <div className="row g-3">
          {tasks.map((task) => (
            <div key={task.id} className="col-12 col-md-6 col-lg-4">
              <TaskCard
                task={task}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="tf-card p-5 text-center my-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-light text-muted rounded-circle p-4 mb-3">
            <i className="bi bi-clipboard-x fs-1"></i>
          </div>
          <h4 className="fw-bold text-dark">No Tasks Found</h4>
          <p className="text-muted small mx-auto" style={{ maxWidth: '420px' }}>
            {search || status !== 'All' || priority !== 'All'
              ? 'No tasks match your active filters or search terms. Try clearing your filters.'
              : 'You have not created any tasks yet. Get started by clicking the button below!'}
          </p>
          {search || status !== 'All' || priority !== 'All' ? (
            <button
              onClick={() => {
                setSearch('');
                setStatus('All');
                setPriority('All');
              }}
              className="btn btn-outline-secondary btn-sm"
            >
              Clear Filters
            </button>
          ) : (
            <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
              <i className="bi bi-plus-lg me-1"></i> Create First Task
            </button>
          )}
        </div>
      )}

      {/* Task Create/Edit Modal */}
      <TaskModal
        show={showTaskModal}
        onHide={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setDeletingTask(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to permanently delete "${deletingTask?.title}"?`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default TasksPage;
