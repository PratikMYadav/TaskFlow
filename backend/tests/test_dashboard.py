from datetime import date, timedelta


def test_dashboard_stats(client, auth_headers):
    today = date.today()
    yesterday = (today - timedelta(days=2)).isoformat()
    tomorrow = (today + timedelta(days=2)).isoformat()

    # 1 Pending (not overdue)
    client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Task 1", "priority": "Low", "status": "Pending", "due_date": tomorrow}
    )
    # 1 In Progress
    client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Task 2", "priority": "Medium", "status": "In Progress", "due_date": tomorrow}
    )
    # 1 Completed
    client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Task 3", "priority": "High", "status": "Completed", "due_date": yesterday}
    )
    # 1 Overdue (Pending with due_date in past)
    client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Task 4", "priority": "High", "status": "Pending", "due_date": yesterday}
    )

    res = client.get("/api/dashboard/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    assert data["total_tasks"] == 4
    assert data["pending_tasks"] == 2
    assert data["in_progress_tasks"] == 1
    assert data["completed_tasks"] == 1
    assert data["overdue_tasks"] == 1
    assert data["completion_rate"] == 25.0
    assert len(data["recent_tasks"]) == 4
    assert len(data["upcoming_tasks"]) == 2  # Task 1 and Task 2 are upcoming & not completed


def test_health_endpoint(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "TaskFlow Backend"
