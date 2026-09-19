import os

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    Inspection,
    Finding,
    CorrectiveAction,
)

from ..services.report_service import (
    generate_inspection_report,
)


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.get("/{inspection_id}")
def generate_report(
    inspection_id: int,
    db: Session = Depends(get_db)
):

    inspection = (
        db.query(Inspection)
        .filter(
            Inspection.id == inspection_id
        )
        .first()
    )

    if not inspection:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )

    findings = (
        db.query(Finding)
        .filter(
            Finding.inspection_id == inspection_id
        )
        .all()
    )

    actions = []

    for finding in findings:

        finding_actions = (
            db.query(CorrectiveAction)
            .filter(
                CorrectiveAction.finding_id
                == finding.id
            )
            .all()
        )

        actions.extend(finding_actions)

    return {
        "success": True,

        "inspection": {
            "id": inspection.id,
            "title": inspection.title,
            "location": inspection.location,
            "inspection_date": inspection.inspection_date,
            "inspector": inspection.inspector,
            "status": inspection.status,
            "risk_level": inspection.risk_level,
            "compliance_score":
                inspection.compliance_score,
        },

        "findings": [
            {
                "id": finding.id,
                "title": finding.title,
                "description": finding.description,
                "category": finding.category,
                "severity": finding.severity,
                "status": finding.status,
                "recommendation":
                    finding.recommendation,
                "page_number":
                    finding.page_number,
                "source_document":
                    finding.source_document,
            }
            for finding in findings
        ],

        "corrective_actions": [
            {
                "id": action.id,
                "finding_id":
                    action.finding_id,
                "title": action.title,
                "assigned_to":
                    action.assigned_to,
                "priority":
                    action.priority,
                "due_date":
                    action.due_date,
                "status":
                    action.status,
                "notes":
                    action.notes,
            }
            for action in actions
        ],
    }

@router.get("/{inspection_id}/pdf")
def download_report(
    inspection_id: int,
    db: Session = Depends(get_db)
):

    inspection = (
        db.query(Inspection)
        .filter(
            Inspection.id == inspection_id
        )
        .first()
    )

    if not inspection:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )

    findings = (
        db.query(Finding)
        .filter(
            Finding.inspection_id == inspection_id
        )
        .all()
    )

    corrective_actions = []

    for finding in findings:

        actions = (
            db.query(CorrectiveAction)
            .filter(
                CorrectiveAction.finding_id ==
                finding.id
            )
            .all()
        )

        corrective_actions.extend(actions)

    reports_dir = os.path.join(
        "data",
        "reports"
    )

    os.makedirs(
        reports_dir,
        exist_ok=True
    )

    filename = (
        f"inspection_{inspection_id}_report.pdf"
    )

    output_path = os.path.join(
        reports_dir,
        filename
    )

    generate_inspection_report(
        inspection=inspection,
        findings=findings,
        corrective_actions=corrective_actions,
        output_path=output_path,
    )

    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename=filename,
    )