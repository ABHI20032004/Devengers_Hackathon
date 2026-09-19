from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    hashed_password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="user",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    original_filename = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    pages = Column(Integer, default=0)

    chunks = Column(Integer, default=0)

    status = Column(String, default="processing")

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    location = Column(String)

    inspection_date = Column(String)

    inspector = Column(String)

    status = Column(String, default="pending")

    risk_level = Column(String, default="LOW")

    compliance_score = Column(Integer, default=0)

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id"),
        nullable=True
    )

    title = Column(String, nullable=False)

    description = Column(Text)

    category = Column(String)

    severity = Column(String, default="LOW")

    status = Column(String, default="OPEN")

    recommendation = Column(Text)

    page_number = Column(Integer)

    source_document = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(Integer, primary_key=True, index=True)

    finding_id = Column(
        Integer,
        ForeignKey("findings.id"),
        nullable=True
    )

    title = Column(String, nullable=False)

    assigned_to = Column(String)

    priority = Column(String, default="MEDIUM")

    due_date = Column(String)

    status = Column(String, default="OPEN")

    notes = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id"),
        nullable=True
    )

    finding_id = Column(
        Integer,
        ForeignKey("findings.id"),
        nullable=True
    )

    file_path = Column(String, nullable=False)

    file_type = Column(String)

    description = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id"),
        nullable=True
    )

    title = Column(String, nullable=False)

    file_path = Column(String)

    generated_at = Column(
        DateTime,
        default=datetime.utcnow
    )