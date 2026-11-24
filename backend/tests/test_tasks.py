from datetime import date, timedelta


def test_create_task(client, auth_headers):
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    response = client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={
            "title": "Complete TaskFlow API",
            "description": "Implement all endpoints cleanly",
            "priority": "High",
            "status": "In Progress",
            "due_date": tomorrow
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Complete TaskFlow API"
    assert data["priority"] == "High"
    assert data["status"] == "In Progress"
    assert data["due_date"] == tomorrow
    assert "id" in data


def test_get_tasks_list(client, auth_headers):
    # Create 3 tasks
    for i in range(3):
        client.post(
            "/api/tasks/",
            headers=auth_headers,
            json={"title": f"Task {i+1}", "priority": "Medium", "status": "Pending"}
        )

    response = client.get("/api/tasks/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["tasks"]) == 3


def test_get_task_by_id(client, auth_headers):
    create_res = client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Single Task Test", "priority": "Low", "status": "Pending"}
    )
    task_id = create_res.json()["id"]

    get_res = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Single Task Test"


def test_update_task(client, auth_headers):
    create_res = client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Initial Title", "priority": "Low", "status": "Pending"}
    )
    task_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/tasks/{task_id}",
        headers=auth_headers,
        json={"title": "Updated Title", "status": "Completed", "priority": "High"}
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["title"] == "Updated Title"
    assert updated["status"] == "Completed"
    assert updated["priority"] == "High"


def test_delete_task(client, auth_headers):
    create_res = client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Task to Delete", "priority": "Medium", "status": "Pending"}
    )
    task_id = create_res.json()["id"]

    del_res = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Ensure it cannot be retrieved
    get_res = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_res.status_code == 404


def test_user_task_authorization_isolation(client, auth_headers, second_auth_headers):
    # User 1 creates a task
    create_res = client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "User 1 Secret Task", "priority": "High", "status": "Pending"}
    )
    user1_task_id = create_res.json()["id"]

    # User 2 attempts to get User 1's task -> must return 404
    get_res = client.get(f"/api/tasks/{user1_task_id}", headers=second_auth_headers)
    assert get_res.status_code == 404

    # User 2 attempts to update User 1's task -> must return 404
    update_res = client.put(
        f"/api/tasks/{user1_task_id}",
        headers=second_auth_headers,
        json={"title": "Hacked Title"}
    )
    assert update_res.status_code == 404

    # User 2 attempts to delete User 1's task -> must return 404
    delete_res = client.delete(f"/api/tasks/{user1_task_id}", headers=second_auth_headers)
    assert delete_res.status_code == 404

    # User 2's task list must be empty
    list_res = client.get("/api/tasks/", headers=second_auth_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 0


def test_search_and_filter_tasks(client, auth_headers):
    client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Review PR", "priority": "High", "status": "Pending"}
    )
    client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Write Unit Tests", "priority": "Medium", "status": "Completed"}
    )
    client.post(
        "/api/tasks/",
        headers=auth_headers,
        json={"title": "Deploy to Staging", "priority": "High", "status": "In Progress"}
    )

    # Filter by status: Completed
    res_completed = client.get("/api/tasks/?status=Completed", headers=auth_headers)
    assert res_completed.json()["total"] == 1
    assert res_completed.json()["tasks"][0]["title"] == "Write Unit Tests"

    # Filter by priority: High
    res_high = client.get("/api/tasks/?priority=High", headers=auth_headers)
    assert res_high.json()["total"] == 2

    # Search keyword: "PR"
    res_search = client.get("/api/tasks/?search=PR", headers=auth_headers)
    assert res_search.json()["total"] == 1
    assert res_search.json()["tasks"][0]["title"] == "Review PR"
