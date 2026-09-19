from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Inspection, Finding
from ..services.inspection_service import analyze_inspection


router = APIRouter(
    prefix="/api/inspections",
    tags=["Inspections"]
)


# =========================================================
# GET ALL INSPECTIONS
# =========================================================

@router.get("")
def get_inspections(
    db: Session = Depends(get_db)
):

    inspections = (
        db.query(Inspection)
        .order_by(
            Inspection.id.desc()
        )
        .all()
    )

    return {
        "success": True,

        "inspections": [
            {
                "id": inspection.id,
                "title": inspection.title,
                "location": inspection.location,
                "inspection_date":
                    inspection.inspection_date,
                "inspector":
                    inspection.inspector,
                "status":
                    inspection.status,
                "risk_level":
                    inspection.risk_level,
                "compliance_score":
                    inspection.compliance_score,
                "document_id":
                    inspection.document_id,
                "created_at":
                    (
                        inspection.created_at.isoformat()
                        if inspection.created_at
                        else None
                    )
            }

            for inspection in inspections
        ]
    }


# =========================================================
# CREATE INSPECTION
# =========================================================

@router.post("")
def create_inspection(
    data: dict,
    db: Session = Depends(get_db)
):

    title = data.get("title")

    if not title:

        raise HTTPException(
            status_code=400,
            detail="Inspection title is required"
        )


    document_id = data.get(
        "document_id"
    )


    # If a document is supplied,
    # make sure it exists.

    if document_id:

        from ..models import Document

        document = (
            db.query(Document)
            .filter(
                Document.id ==
                document_id
            )
            .first()
        )

        if not document:

            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )


        if document.status != "ready":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Document is not ready. "
                    "Please wait for PDF processing."
                )
            )


    inspection = Inspection(

        title=title,

        location=data.get(
            "location"
        ),

        inspection_date=data.get(
            "inspection_date"
        ),

        inspector=data.get(
            "inspector"
        ),

        status="pending",

        risk_level="LOW",

        compliance_score=0,

        document_id=document_id
    )


    db.add(inspection)

    db.commit()

    db.refresh(inspection)


    return {

        "success": True,

        "inspection": {

            "id":
                inspection.id,

            "title":
                inspection.title,

            "location":
                inspection.location,

            "inspection_date":
                inspection.inspection_date,

            "inspector":
                inspection.inspector,

            "status":
                inspection.status,

            "risk_level":
                inspection.risk_level,

            "compliance_score":
                inspection.compliance_score,

            "document_id":
                inspection.document_id,

            "created_at":
                (
                    inspection.created_at.isoformat()
                    if inspection.created_at
                    else None
                )
        }
    }


# =========================================================
# DELETE INSPECTION
# =========================================================

@router.delete("/{inspection_id}")
def delete_inspection(
    inspection_id: int,
    db: Session = Depends(get_db)
):

    inspection = (
        db.query(Inspection)
        .filter(
            Inspection.id ==
            inspection_id
        )
        .first()
    )


    if not inspection:

        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )


    # Remove findings belonging
    # to this inspection first.

    db.query(Finding).filter(
        Finding.inspection_id ==
        inspection_id
    ).delete(
        synchronize_session=False
    )


    db.delete(inspection)

    db.commit()


    return {

        "success": True,

        "message":
            "Inspection deleted successfully"
    }


# =========================================================
# ANALYZE INSPECTION WITH AI
# =========================================================

@router.post("/{inspection_id}/analyze")
def analyze(
    inspection_id: int,
    db: Session = Depends(get_db)
):

    inspection = (
        db.query(Inspection)
        .filter(
            Inspection.id ==
            inspection_id
        )
        .first()
    )


    if not inspection:

        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )


    if not inspection.document_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "No PDF document attached "
                "to this inspection"
            )
        )


    try:

        # =============================================
        # MARK AS PROCESSING
        # =============================================

        inspection.status = "processing"

        db.commit()


        # =============================================
        # RUN AI ANALYSIS
        # =============================================

        result = analyze_inspection(

            inspection_id=
                inspection.id,

            document_id=
                inspection.document_id
        )


        # =============================================
        # GET FINDINGS
        # =============================================

        findings = result.get(
            "findings",
            []
        )


        # =============================================
        # REMOVE OLD FINDINGS
        # =============================================

        db.query(Finding).filter(
            Finding.inspection_id ==
            inspection.id
        ).delete(
            synchronize_session=False
        )


        # =============================================
        # SAVE NEW FINDINGS
        # =============================================

        for item in findings:

            finding = Finding(

                inspection_id=
                    inspection.id,

                title=
                    item.get(
                        "title",
                        "Inspection Finding"
                    ),

                description=
                    item.get(
                        "description",
                        ""
                    ),

                category=
                    item.get(
                        "category",
                        "General Safety"
                    ),

                severity=
                    item.get(
                        "severity",
                        "LOW"
                    ).upper(),

                status="OPEN",

                recommendation=
                    item.get(
                        "recommendation",
                        ""
                    ),

                page_number=
                    item.get(
                        "page_number"
                    ),

                source_document=
                    item.get(
                        "source_document"
                    )
            )

            db.add(finding)


        # =============================================
        # UPDATE INSPECTION
        # =============================================

        inspection.risk_level = (
            result.get(
                "risk_level",
                "LOW"
            ).upper()
        )


        inspection.compliance_score = int(
            result.get(
                "compliance_score",
                0
            )
        )


        inspection.status = "completed"


        db.commit()

        db.refresh(
            inspection
        )


        return {

            "success": True,

            "inspection_id":
                inspection.id,

            "status":
                inspection.status,

            "risk_level":
                inspection.risk_level,

            "compliance_score":
                inspection.compliance_score,

            "findings_count":
                len(findings),

            "findings":
                findings
        }


    except Exception as e:

        db.rollback()


        inspection.status = "failed"

        db.commit()


        raise HTTPException(

            status_code=500,

            detail=str(e)
        )

    # =========================================================
# GET INSPECTION FINDINGS
# =========================================================

@router.get("/{inspection_id}/findings")
def get_inspection_findings(
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
        .order_by(
            Finding.id.desc()
        )
        .all()
    )

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
            "compliance_score": inspection.compliance_score,
            "document_id": inspection.document_id,
        },

        "findings": [
            {
                "id": finding.id,
                "title": finding.title,
                "description": finding.description,
                "category": finding.category,
                "severity": finding.severity,
                "status": finding.status,
                "recommendation": finding.recommendation,
                "page_number": finding.page_number,
                "source_document": finding.source_document,
            }
            for finding in findings
        ]
    }