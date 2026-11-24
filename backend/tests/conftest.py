import os
os.environ["ENV"] = "testing"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database.base import Base
from contextlib import asynccontextmanager
from app.database.session import get_db
from main import app

# Replace lifespan in tests with a noop async context manager so TestClient never connects to MySQL
@asynccontextmanager
async def noop_lifespan(app):
    yield

app.router.lifespan_context = noop_lifespan

# Create in-memory SQLite database dedicated for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Provides a fresh isolated database session per test with clean tables."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    """Register and login a default user, returning Bearer auth headers."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Test User",
            "email": "testuser@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
    )
    res = client.post(
        "/api/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "Password123!"
        }
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_auth_headers(client):
    """Register and login a second user for testing authorization isolation."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Second User",
            "email": "seconduser@example.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
    )
    res = client.post(
        "/api/auth/login",
        json={
            "email": "seconduser@example.com",
            "password": "Password123!"
        }
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
