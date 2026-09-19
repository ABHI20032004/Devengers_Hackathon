from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models

from .routes.documents import router as documents_router
from .routes.chat import router as chat_router
from .routes.inspections import router as inspections_router
from .routes.findings import router as findings_router
from .routes.corrective_actions import router as corrective_actions_router
from .routes.dashboard import router as dashboard_router
from .routes.reports import router as reports_router
from .routes.evidence import router as evidence_router
from .routes.auth import router as auth_router
from .routes.network import router as network_router


# =====================================================
# CREATE DATABASE TABLES
# =====================================================

Base.metadata.create_all(bind=engine)


# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI(
    title="InspectAI",
    description="Offline Industrial Inspection AI",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# ROUTES
# =====================================================

app.include_router(
    documents_router
)

app.include_router(
    chat_router
)

app.include_router(
    inspections_router
)


app.include_router(
    findings_router
)

app.include_router(
    corrective_actions_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    reports_router
)

app.include_router(
    evidence_router
)

app.include_router(
    auth_router
)

app.include_router(
    network_router
)


# =====================================================
# BASIC ROUTES
# =====================================================

@app.get("/")
def root():

    return {
        "message": "InspectAI API is running",
        "status": "online"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }