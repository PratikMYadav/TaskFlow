def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Alice Johnson",
            "email": "alice@example.com",
            "password": "SecurePassword123",
            "confirm_password": "SecurePassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["full_name"] == "Alice Johnson"
    assert "hashed_password" not in data


def test_register_duplicate_email_fails(client):
    payload = {
        "full_name": "Duplicate User",
        "email": "duplicate@example.com",
        "password": "Password123",
        "confirm_password": "Password123"
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_register_password_mismatch_fails(client):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Mismatch User",
            "email": "mismatch@example.com",
            "password": "Password123",
            "confirm_password": "DifferentPassword123"
        }
    )
    assert response.status_code == 422


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Bob Smith",
            "email": "bob@example.com",
            "password": "Password123",
            "confirm_password": "Password123"
        }
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "Password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "bob@example.com"


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPassword"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_get_current_user_me(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"


def test_get_current_user_without_token_fails(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_change_password_success(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "old_password": "Password123!",
            "new_password": "NewSecretPassword1!",
            "confirm_new_password": "NewSecretPassword1!"
        }
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password changed successfully."

    # Verify login with new password works
    login_res = client.post(
        "/api/auth/login",
        json={"email": "testuser@example.com", "password": "NewSecretPassword1!"}
    )
    assert login_res.status_code == 200


def test_change_password_wrong_old_password_fails(client, auth_headers):
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "old_password": "WrongOldPassword",
            "new_password": "NewSecretPassword1!",
            "confirm_new_password": "NewSecretPassword1!"
        }
    )
    assert response.status_code == 400
    assert "Incorrect current password" in response.json()["detail"]
