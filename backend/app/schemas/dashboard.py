from typing import List
from pydantic import BaseModel
from app.schemas.task import TaskResponse


class DashboardStatsResponse(BaseModel):
    total_tasks: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    overdue_tasks: int
    completion_rate: float
    recent_tasks: List[TaskResponse]
    upcoming_tasks: List[TaskResponse]
