export const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
};

export const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'High':
      return 'badge-priority-high';
    case 'Medium':
      return 'badge-priority-medium';
    case 'Low':
    default:
      return 'badge-priority-low';
  }
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'badge-status-completed';
    case 'In Progress':
      return 'badge-status-in-progress';
    case 'Pending':
    default:
      return 'badge-status-pending';
  }
};
