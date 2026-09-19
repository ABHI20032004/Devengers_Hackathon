from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CorrectiveAction, Finding


router = APIRouter(
    prefix="/api/corrective-actions",
    tags=["Corrective Actions"]
)


# =========================================================
# REQUEST MODELS
# =========================================================

class CorrectiveActionCreate(BaseModel):

    finding_id: int

    title: str

    assigned_to: str | None = None

    priority: str = "MEDIUM"

    due_date: str | None = None

    notes: str | None = None


class CorrectiveActionStatusUpdate(BaseModel):

    status: str


# =========================================================
# GET ALL CORRECTIVE ACTIONS
# =========================================================

@router.get("")
def get_corrective_actions(
    db: Session = Depends(get_db)
):

    actions = (
        db.query(CorrectiveAction)
        .order_by(
            CorrectiveAction.id.desc()
        )
        .all()
    )

    return {
        "success": True,

        "actions": [
            {
                "id": action.id,

                "finding_id":
                    action.finding_id,

                "title":
                    action.title,

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

                "created_at":
                    action.created_at,
            }

            for action in actions
        ]
    }


# =========================================================
# CREATE CORRECTIVE ACTION
# =========================================================

@router.post("")
def create_corrective_action(
    request: CorrectiveActionCreate,
    db: Session = Depends(get_db)
):

    finding = (
        db.query(Finding)
        .filter(
            Finding.id ==
            request.finding_id
        )
        .first()
    )

    if not finding:

        raise HTTPException(
            status_code=404,
            detail="Finding not found"
        )


    priority = (
        request.priority
        .upper()
        .strip()
    )


    allowed_priorities = [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
    ]


    if priority not in allowed_priorities:

        raise HTTPException(
            status_code=400,
            detail="Invalid priority"
        )


    action = CorrectiveAction(

        finding_id =
            request.finding_id,

        title =
            request.title.strip(),

        assigned_to =
            request.assigned_to,

        priority =
            priority,

        due_date =
            request.due_date,

        status =
            "OPEN",

        notes =
            request.notes,
    )


    db.add(action)

    db.commit()

    db.refresh(action)


    return {

        "success": True,

        "message":
            "Corrective action created",

        "action": {

            "id":
                action.id,

            "finding_id":
                action.finding_id,

            "title":
                action.title,

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

            "created_at":
                action.created_at,
        }
    }


# =========================================================
# UPDATE STATUS
# =========================================================

@router.patch("/{action_id}/status")
def update_corrective_action_status(
    action_id: int,

    request: CorrectiveActionStatusUpdate,

    db: Session = Depends(get_db)
):

    action = (
        db.query(CorrectiveAction)
        .filter(
            CorrectiveAction.id ==
            action_id
        )
        .first()
    )

    if not action:

        raise HTTPException(
            status_code=404,
            detail="Corrective action not found"
        )


    status = (
        request.status
        .upper()
        .strip()
    )


    allowed_statuses = [
        "OPEN",
        "IN PROGRESS",
        "RESOLVED"
    ]


    if status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail="Invalid corrective action status"
        )


    action.status = status

    db.commit()

    db.refresh(action)


    return {

        "success": True,

        "message":
            "Corrective action status updated",

        "action": {

            "id":
                action.id,

            "status":
                action.status
        }
    }