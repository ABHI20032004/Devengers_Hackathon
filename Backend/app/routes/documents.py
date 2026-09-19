import os
import shutil
import uuid

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Document

from ..services.pdf_service import (
    extract_pdf_chunks
)

from ..services.ollama_service import (
    create_embedding
)

from ..services.chroma_service import (
    add_chunks,
    delete_document_chunks
)


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


UPLOAD_DIR = "./uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# Maximum PDF size = 50 MB
MAX_FILE_SIZE = 50 * 1024 * 1024


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # =========================
    # VALIDATE FILE
    # =========================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )


    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )


    # =========================
    # CHECK DUPLICATE
    # =========================

    existing = (
        db.query(Document)
        .filter(
            Document.original_filename
            == file.filename
        )
        .first()
    )


    if existing:

        raise HTTPException(
            status_code=409,
            detail=(
                f"'{file.filename}' "
                "has already been uploaded."
            )
        )


    # =========================
    # CREATE UNIQUE ID
    # =========================

    document_id = str(
        uuid.uuid4()
    )


    safe_filename = (
        f"{document_id}_{file.filename}"
    )


    file_path = os.path.join(
        UPLOAD_DIR,
        safe_filename
    )


    # =========================
    # SAVE FILE
    # =========================

    file_size = 0


    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            while True:

                chunk = file.file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                file_size += len(chunk)


                if file_size > MAX_FILE_SIZE:

                    buffer.close()

                    os.remove(
                        file_path
                    )

                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "PDF is too large. "
                            "Maximum size is 50 MB."
                        )
                    )


                buffer.write(chunk)


    except HTTPException:
        raise


    except Exception as e:

        if os.path.exists(file_path):

            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Failed to save PDF: {str(e)}"
        )


    # =========================
    # DATABASE RECORD
    # =========================

    document = Document(

        filename=safe_filename,

        original_filename=file.filename,

        file_path=file_path,

        status="processing"

    )


    db.add(document)

    db.commit()

    db.refresh(document)


    # =========================
    # PROCESS PDF
    # =========================

    try:

        chunks, page_count = (
            extract_pdf_chunks(
                file_path,
                document.id,
                file.filename
            )
        )


        if not chunks:

            document.status = "failed"

            db.commit()

            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text was found "
                    "in this PDF."
                )
            )


        # =========================
        # CREATE EMBEDDINGS
        # =========================

        embedded_chunks = []


        for chunk in chunks:

            embedding = create_embedding(
                chunk["text"]
            )

            chunk["embedding"] = embedding

            embedded_chunks.append(
                chunk
            )


        # =========================
        # STORE IN CHROMADB
        # =========================

        add_chunks(
            embedded_chunks
        )


        # =========================
        # UPDATE DATABASE
        # =========================

        document.pages = page_count

        document.chunks = len(chunks)

        document.status = "ready"

        db.commit()


        return {

            "success": True,

            "document_id": document.id,

            "filename": file.filename,

            "pages": page_count,

            "chunks": len(chunks),

            "status": "ready"

        }


    except HTTPException:
        raise


    except Exception as e:

        document.status = "failed"

        db.commit()

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )

@router.get("")
def get_documents(
    db: Session = Depends(get_db)
):

    documents = (
        db.query(Document)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    return {
        "success": True,
        "documents": [
            {
                "id": document.id,
                "filename": document.original_filename,
                "pages": document.pages,
                "chunks": document.chunks,
                "status": document.status,
                "uploaded_at": (
                    document.uploaded_at.isoformat()
                    if document.uploaded_at
                    else None
                )
            }
            for document in documents
        ]
    }

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):

    # Find document
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    # =========================
    # DELETE CHROMADB CHUNKS
    # =========================

    deleted_chunks = (
        delete_document_chunks(
            document.id
        )
    )


    # =========================
    # DELETE PDF FILE
    # =========================

    if os.path.exists(
        document.file_path
    ):

        os.remove(
            document.file_path
        )


    # =========================
    # DELETE DATABASE RECORD
    # =========================

    filename = document.original_filename

    db.delete(
        document
    )

    db.commit()


    return {

        "success": True,

        "message": (
            f"Document '{filename}' "
            "deleted successfully."
        ),

        "document_id": document_id,

        "deleted_chunks": deleted_chunks

    }