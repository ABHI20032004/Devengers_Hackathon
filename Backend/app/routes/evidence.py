import os
import shutil

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from fastapi.responses import FileResponse


from ..database import get_db
from ..models import Evidence, Finding

from sqlalchemy.orm import Session


router = APIRouter(
    prefix="/api/evidence",
    tags=["Evidence"]
)


EVIDENCE_DIR = os.path.join(
    "data",
    "evidence"
)


os.makedirs(
    EVIDENCE_DIR,
    exist_ok=True
)






# =========================================================
# UPLOAD EVIDENCE
# =========================================================

@router.post("/")
def upload_evidence(
    finding_id: int = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    # Check finding

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


    # Create unique filename

    filename = file.filename or "evidence"

    safe_filename = (
        f"{finding_id}_"
        f"{filename}"
    )

    file_path = os.path.join(
        EVIDENCE_DIR,
        safe_filename
    )


    # Save file locally

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save evidence: {str(e)}"
        )


    # Save database record

    evidence = Evidence(

        inspection_id=
            finding.inspection_id,

        finding_id=
            finding.id,

        file_path=
            file_path,

        file_type=
            file.content_type,

        description=
            description,
    )


    db.add(evidence)

    db.commit()

    db.refresh(evidence)


    return {

        "success": True,

        "message":
            "Evidence uploaded successfully",

        "evidence": {

            "id":
                evidence.id,

            "finding_id":
                evidence.finding_id,

            "inspection_id":
                evidence.inspection_id,

            "file_path":
                evidence.file_path,

            "file_type":
                evidence.file_type,

            "description":
                evidence.description,

            "created_at":
                evidence.created_at,
        }
    }


# =========================================================
# GET FINDING EVIDENCE
# =========================================================

@router.get("/finding/{finding_id}")
def get_finding_evidence(
    finding_id: int,
    db: Session = Depends(get_db),
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


    evidence = (
        db.query(Evidence)
        .filter(
            Evidence.finding_id ==
            finding_id
        )
        .order_by(
            Evidence.id.desc()
        )
        .all()
    )


    return {

        "success": True,

        "finding_id":
            finding_id,

        "evidence": [

            {

                "id":
                    item.id,

                "finding_id":
                    item.finding_id,

                "inspection_id":
                    item.inspection_id,

                "file_path":
                    item.file_path,

                "file_type":
                    item.file_type,

                "description":
                    item.description,

                "created_at":
                    item.created_at,

            }

            for item in evidence

        ]
    }


# =========================================================
# GET ALL EVIDENCE
# =========================================================

@router.get("/")
def get_all_evidence(
    db: Session = Depends(get_db),
):
    evidence = (
        db.query(Evidence)
        .order_by(Evidence.id.desc())
        .all()
    )

    return {
        "success": True,
        "evidence": [
            {
                "id": item.id,
                "finding_id": item.finding_id,
                "inspection_id": item.inspection_id,
                "file_path": item.file_path,
                "file_type": item.file_type,
                "description": item.description,
                "created_at": item.created_at,
            }
            for item in evidence
        ]
    }




# =========================================================
# VIEW / SERVE EVIDENCE FILE
# =========================================================

@router.get("/file/{evidence_id}")
def get_evidence_file(
    evidence_id: int,
    db: Session = Depends(get_db),
):

    evidence = (
        db.query(Evidence)
        .filter(
            Evidence.id == evidence_id
        )
        .first()
    )

    if not evidence:

        raise HTTPException(
            status_code=404,
            detail="Evidence not found"
        )


    if not evidence.file_path:

        raise HTTPException(
            status_code=404,
            detail="Evidence file path not found"
        )


    if not os.path.exists(
        evidence.file_path
    ):

        raise HTTPException(
            status_code=404,
            detail="Evidence file not found on server"
        )


    filename = os.path.basename(
        evidence.file_path
    )


    return FileResponse(
        path=evidence.file_path,
        media_type=evidence.file_type
        or "application/octet-stream",
        filename=filename,
        content_disposition_type="inline",
    )

# =========================================================
# DELETE EVIDENCE
# =========================================================

@router.delete("/{evidence_id}")
def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
):

    evidence = (
        db.query(Evidence)
        .filter(
            Evidence.id == evidence_id
        )
        .first()
    )

    if not evidence:

        raise HTTPException(
            status_code=404,
            detail="Evidence not found"
        )


    # Delete local file

    if (
        evidence.file_path
        and os.path.exists(
            evidence.file_path
        )
    ):

        os.remove(
            evidence.file_path
        )


    db.delete(evidence)

    db.commit()


    return {

        "success": True,

        "message":
            "Evidence deleted successfully"

    }