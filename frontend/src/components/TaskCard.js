import React from 'react';
import { formatDate, isOverdue, getPriorityBadgeClass, getStatusBadgeClass } from '../utils/formatters';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div className={`tf-card tf-card-hover p-3 h-100 d-flex flex-column justify-content-between ${overdue ? 'border-danger' : ''}`}>
      <div>
        <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
          <span className={`badge ${getPriorityBadgeClass(task.priority)} px-2 py-1`}>
            {task.priority} Priority
          </span>
          <div className="dropdown">
            <select
              className={`form-select form-select-sm py-0 px-2 fw-semibold ${getStatusBadgeClass(task.status)}`}
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              style={{ width: 'auto', border: 'none', cursor: 'pointer' }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <h5 className={`fw-bold mb-2 ${task.status === 'Completed' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
          {task.title}
        </h5>

        {task.description && (
          <p className="text-muted small mb-3 text-break" style={{ whiteSpace: 'pre-line' }}>
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-2 border-top mt-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-1 small">
          <i className={`bi bi-calendar-event ${overdue ? 'text-danger fw-bold' : 'text-muted'}`}></i>
          <span className={overdue ? 'text-danger fw-bold' : 'text-muted'}>
            {formatDate(task.due_date)} {overdue && '(Overdue)'}
          </span>
        </div>

        <div className="d-flex gap-1">
          <button
            onClick={() => onEdit(task)}
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            title="Edit task"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="btn btn-sm btn-outline-danger py-1 px-2"
            title="Delete task"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
