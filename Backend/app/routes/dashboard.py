from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Document, Inspection, Finding, CorrectiveAction


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db)
):

    documents = db.query(Document).count()

    inspections = db.query(Inspection).count()

    open_findings = (
        db.query(Finding)
        .filter(
            Finding.status == "OPEN"
        )
        .count()
    )

    critical_risks = (
        db.query(Finding)
        .filter(
            Finding.severity == "CRITICAL"
        )
        .filter(
            Finding.status != "RESOLVED"
        )
        .count()
    )

    corrective_actions = (
        db.query(CorrectiveAction)
        .count()
    )

    open_actions = (
        db.query(CorrectiveAction)
        .filter(
            CorrectiveAction.status == "OPEN"
        )
        .count()
    )

    in_progress_actions = (
        db.query(CorrectiveAction)
        .filter(
            CorrectiveAction.status == "IN PROGRESS"
        )
        .count()
    )

    resolved_actions = (
        db.query(CorrectiveAction)
        .filter(
            CorrectiveAction.status == "RESOLVED"
        )
        .count()
    )

    return {
        "documents": documents,
        "inspections": inspections,
        "open_findings": open_findings,
        "critical_risks": critical_risks,
        "corrective_actions": corrective_actions,
        "open_actions": open_actions,
        "in_progress_actions": in_progress_actions,
        "resolved_actions": resolved_actions,
    }