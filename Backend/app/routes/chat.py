from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import os
import uuid

from ..services.model_router import route_question


router = APIRouter(
    prefix="/api/chat",
    tags=["AI Chat"]
)


class ChatRequest(BaseModel):

    message: str

    # Optional manual override.
    # Examples:
    # "general"
    # "code"
    # "pdf"
    # "ocr"
    mode: None = None

    # Context information
    # sent by frontend when files are available
    has_pdf: bool = False
    has_image: bool = False


# =========================================================
# IMAGE UPLOAD DIRECTORY
# =========================================================

CHAT_IMAGE_DIR = "data/chat_images"

os.makedirs(
    CHAT_IMAGE_DIR,
    exist_ok=True
)


# =========================================================
# CHAT ENDPOINT
# =========================================================

@router.post("")
async def chat(

    message: str = Form(...),

    mode: Optional[str] = Form(None),

    has_pdf: bool = Form(False),

    has_image: bool = Form(False),

    image: Optional[UploadFile] = File(None)

):

    question = message.strip()

    if not question:

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    image_path = None

    try:

        # =================================================
        # SAVE IMAGE FOR OCR
        # =================================================

        if image is not None:

            extension = os.path.splitext(
                image.filename or ""
            )[1]

            filename = (
                f"{uuid.uuid4().hex}"
                f"{extension}"
            )

            image_path = os.path.join(
                CHAT_IMAGE_DIR,
                filename
            )

            with open(
                image_path,
                "wb"
            ) as buffer:

                while True:

                    chunk = await image.read(
                        1024 * 1024
                    )

                    if not chunk:
                        break

                    buffer.write(chunk)

            has_image = True


        # =================================================
        # AUTOMATIC MODEL ROUTING
        # =================================================

        result = route_question(

            question,

            has_pdf=has_pdf,

            has_image=has_image,

            requested_mode=mode,

            image_path=image_path
        )


        return {

            "success": True,

            "type":
                result["type"],

            "model":
                result["model"],

            "answer":
                result["answer"],

            "sources":
                result.get(
                    "sources",
                    []
                ),

            "routing_reason":
                result.get(
                    "routing_reason",
                    ""
                )
        }


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )

    finally:

        # =================================================
        # DELETE TEMPORARY IMAGE
        # =================================================

        if image_path and os.path.exists(
            image_path
        ):

            try:

                os.remove(
                    image_path
                )

            except Exception:
                pass