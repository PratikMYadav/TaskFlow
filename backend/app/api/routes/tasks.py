import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, desc, asc
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task owned by the authenticated user."""
    new_task = Task(
        user_id=current_user.id,
        title=task_in.title.strip(),
        description=task_in.description.strip() if task_in.description else None,
        priority=task_in.priority,
        status=task_in.status,
        due_date=task_in.due_date
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.get("/", response_model=TaskListResponse)
def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status (Pending, In Progress, Completed)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Low, Medium, High)"),
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    sort_by: str = Query("created_at", description="Field to sort by: created_at, due_date, title, priority"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve paginated tasks for the authenticated user with searching and filtering."""
    query = db.query(Task).filter(Task.user_id == current_user.id)

    # Filter by status
    if status and status != "All":
        query = query.filter(Task.status == status)

    # Filter by priority
    if priority and priority != "All":
        query = query.filter(Task.priority == priority)

    # Search keyword
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term)
            )
        )

    # Sorting
    sort_column = {
        "created_at": Task.created_at,
        "due_date": Task.due_date,
        "title": Task.title,
        "priority": Task.priority,
        "status": Task.status
    }.get(sort_by, Task.created_at)

    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()
    offset = (page - 1) * limit
    tasks = query.offset(offset).limit(limit).all()
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "tasks": tasks,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details of a single task owned by the user."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found."
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing task owned by the user."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found."
        )

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "title" and value:
            setattr(task, field, value.strip())
        elif field == "description" and value is not None:
            setattr(task, field, value.strip())
        else:
            setattr(task, field, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task owned by the user."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found."
        )

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully.", "id": task_id}
