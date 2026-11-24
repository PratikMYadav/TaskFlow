import enum
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from app.database.base import Base


class TaskPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class TaskStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    priority = Column(
        Enum("Low", "Medium", "High", name="task_priority"),
        default="Medium",
        nullable=False,
        index=True
    )
    status = Column(
        Enum("Pending", "In Progress", "Completed", name="task_status"),
        default="Pending",
        nullable=False,
        index=True
    )
    due_date = Column(Date, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationship to user
    owner = relationship("User", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task id={self.id} title={self.title[:20]} status={self.status}>"
