from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Finding


router = APIRouter(
    prefix="/api/findings",
    tags=["Findings"]
)


class FindingStatusUpdate(BaseModel):
    status: str


@router.patch("/{finding_id}/status")
def update_finding_status(
    finding_id: int,
    request: FindingStatusUpdate,
    db: Session = Depends(get_db)
):

    finding = (
        db.query(Finding)
        .filter(
            Finding.id == finding_id
        )
        .first()
    )

    if not finding:
        raise HTTPException(
            status_code=404,
            detail="Finding not found"
        )


    status = request.status.upper().strip()


    allowed_statuses = [
        "OPEN",
        "IN PROGRESS",
        "RESOLVED"
    ]


    if status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail="Invalid finding status"
        )


    finding.status = status

    db.commit()

    db.refresh(finding)


    return {
        "success": True,
        "message": "Finding status updated",
        "finding": {
            "id": finding.id,
            "status": finding.status
        }
    }