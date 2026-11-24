from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import desc, asc
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate personalized task metrics and statistics for the dashboard."""
    today = date.today()
    user_tasks_query = db.query(Task).filter(Task.user_id == current_user.id)

    total_tasks = user_tasks_query.count()
    pending_tasks = user_tasks_query.filter(Task.status == "Pending").count()
    in_progress_tasks = user_tasks_query.filter(Task.status == "In Progress").count()
    completed_tasks = user_tasks_query.filter(Task.status == "Completed").count()

    # Overdue tasks: due_date < today AND status != 'Completed'
    overdue_tasks = user_tasks_query.filter(
        Task.due_date < today,
        Task.status != "Completed"
    ).count()

    # Calculate completion rate percentage
    completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # 5 most recent tasks
    recent_tasks = (
        user_tasks_query.order_by(desc(Task.created_at))
        .limit(5)
        .all()
    )

    # 5 upcoming tasks with non-completed status
    upcoming_tasks = (
        user_tasks_query.filter(
            Task.due_date >= today,
            Task.status != "Completed"
        )
        .order_by(asc(Task.due_date))
        .limit(5)
        .all()
    )

    return {
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "completed_tasks": completed_tasks,
        "overdue_tasks": overdue_tasks,
        "completion_rate": completion_rate,
        "recent_tasks": recent_tasks,
        "upcoming_tasks": upcoming_tasks
    }
