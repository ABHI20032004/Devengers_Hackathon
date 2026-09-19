import os
import pytesseract
from PIL import Image


# Tesseract installation path
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if not os.path.exists(TESSERACT_PATH):
    raise FileNotFoundError(
        f"Tesseract not found at: {TESSERACT_PATH}"
    )

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image using local Tesseract OCR.
    """

    if not os.path.exists(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    try:
        image = Image.open(image_path)

        # Convert image to RGB
        image = image.convert("RGB")

        # Perform OCR
        text = pytesseract.image_to_string(image)

        return text.strip()

    except Exception as e:
        raise RuntimeError(
            f"OCR processing failed: {str(e)}"
        )