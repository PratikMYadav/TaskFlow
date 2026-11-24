from datetime import date, datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict


TaskPriorityLiteral = Literal["Low", "Medium", "High"]
TaskStatusLiteral = Literal["Pending", "In Progress", "Completed"]


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, max_length=5000, description="Optional detailed description")
    priority: TaskPriorityLiteral = Field("Medium", description="Priority level: Low, Medium, High")
    status: TaskStatusLiteral = Field("Pending", description="Status: Pending, In Progress, Completed")
    due_date: Optional[date] = Field(None, description="Due date (YYYY-MM-DD)")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    priority: Optional[TaskPriorityLiteral] = None
    status: Optional[TaskStatusLiteral] = None
    due_date: Optional[date] = None


class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    limit: int
    total_pages: int
