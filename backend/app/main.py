from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, emails
from app.core.config import settings
from app.infrastructure.database import Base, engine

# Simple learning-project setup: no Alembic, just create tables on startup.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gmail Clone API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        settings.frontend_origin.replace("localhost", "127.0.0.1"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(emails.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}