from .ollama_service import (
    generate_answer,
    generate_code_answer,
)

from .rag_service import ask_pdf_question

from .ocr_service import extract_text_from_image


# =========================================================
# QUESTION TYPE DETECTION
# =========================================================

def detect_question_type(
    question: str,
    has_pdf: bool = False,
    has_image: bool = False,
) -> str:

    q = question.lower().strip()

    # =====================================================
    # OCR
    # =====================================================

    ocr_keywords = [
        "ocr",
        "read this image",
        "read image",
        "read this photo",
        "extract text from image",
        "extract text from photo",
        "what does this image say",
        "what is written in this image",
        "scan this image",
    ]

    if has_image:
        return "ocr"

    if any(
        keyword in q
        for keyword in ocr_keywords
    ):
        return "ocr"


    # =====================================================
    # PDF / DOCUMENT / INSPECTION
    # =====================================================

    pdf_keywords = [
        "uploaded document",
        "uploaded pdf",
        "this document",
        "this pdf",
        "inspection document",
        "inspection report",
        "inspection pdf",
        "according to the document",
        "according to the pdf",
        "according to this report",
        "from the document",
        "from the pdf",
        "inspection findings",
        "safety finding",
        "safety findings",
        "compliance",
        "compliance score",
        "risk level",
        "risk assessment",
        "corrective action",
        "corrective actions",
        "inspection",
    ]

    if has_pdf:
        return "pdf"

    if any(
        keyword in q
        for keyword in pdf_keywords
    ):
        return "pdf"


    # =====================================================
    # CODE
    # =====================================================

    code_keywords = [

        # Programming languages
        "python",
        "javascript",
        "typescript",
        "java",
        "c++",
        "c#",
        "golang",
        "rust",
        "php",

        # sorting
        "merge sort",
        "quick sort",
        "insertion sort",
        "selection sort",
        "bubble sort",
        "heap sort",
        "counting sort",
        "radix sort",
        "bucket sort",

        # Programming
        "code",
        "coding",
        "program",
        "programming",
        "function",
        "class",
        "variable",
        "array",
        "string",
        "loop",
        "recursion",
        "algorithm",
        "data structure",

        # Debugging
        "debug",
        "debugging",
        "fix code",
        "fix this code",
        "find error",
        "error in my code",
        "code error",
        "syntax error",
        "runtime error",
        "stack trace",
        "traceback",
        "exception",
        "bug",
        "compile",
        "compiler",

        # Web development
        "react",
        "nodejs",
        "node.js",
        "express",
        "fastapi",
        "django",

        # Data structures
        "bst",
        "binary search tree",
        "binary tree",
        "avl tree",
        "heap",
        "stack",
        "queue",
        "linked list",
        "graph",
        "dfs",
        "bfs",
        "sorting",
        "searching",
        "binary search",
        "linear search",
        "hash table",
        "hashmap",

        # Coding requests
        "write code",
        "give code",
        "generate code",
        "code for",
        "implement",
        "implementation",
        "write a program",
        "solve this program",
        "solve this coding problem",
    ]

    if any(
        keyword in q
        for keyword in code_keywords
    ):
        return "code"


    # =====================================================
    # GENERAL
    # =====================================================

    return "general"


# =========================================================
# AUTOMATIC MODEL ROUTER
# =========================================================

def route_question(
    question: str,
    has_pdf: bool = False,
    has_image: bool = False,
    requested_mode: str | None = None,
    image_path: str | None = None,
):

    # -----------------------------------------------------
    # Determine question type
    # -----------------------------------------------------

    if requested_mode:

        requested_mode = requested_mode.lower().strip()

        # Only accept valid manual modes
        if requested_mode in [
            "general",
            "code",
            "pdf",
            "ocr",
        ]:

            question_type = requested_mode

        else:

            # Invalid mode such as "string"
            # → fall back to automatic detection

            question_type = detect_question_type(
                question,
                has_pdf=has_pdf,
                has_image=has_image,
            )

    else:

        question_type = detect_question_type(
            question,
            has_pdf=has_pdf,
            has_image=has_image,
        )

    # =====================================================
    # CODE MODEL
    # =====================================================

    if question_type == "code":

        answer = generate_code_answer(
            question
        )

        return {

            "type":
                "code",

            "model":
                "qwen2.5-coder:7b",

            "answer":
                answer,

            "sources":
                [],

            "routing_reason":
                "Programming or coding question detected."
        }


    # =====================================================
    # PDF / RAG
    # =====================================================

    if question_type == "pdf":

        result = ask_pdf_question(
            question
        )

        return {

            "type":
                "pdf",

            "model":
                "llama3.1:8b",

            "answer":
                result["answer"],

            "sources":
                result.get(
                    "sources",
                    []
                ),

            "routing_reason":
                "Inspection or document question detected."
        }


    # =====================================================
    # OCR
    # =====================================================

    if question_type == "ocr":

    # =================================================
    # OCR IMAGE PROCESSING
    # =================================================

        if not image_path:

            return {

                "type":
                    "ocr",

                "model":
                    "llama3.1:8b",

                "answer":
                    "Please upload an image for OCR processing.",

                "sources":
                    [],

                "routing_reason":
                    "OCR requested but no image was provided."
            }


        # -------------------------------------------------
        # Extract text using local Tesseract
        # -------------------------------------------------

        extracted_text = extract_text_from_image(
            image_path
        )


        if not extracted_text:

            return {

                "type":
                    "ocr",

                "model":
                    "llama3.1:8b",

                "answer":
                    "No readable text was detected in the image.",

                "sources":
                    [],

                "routing_reason":
                    "OCR completed but no text was detected."
            }


        # -------------------------------------------------
        # Send OCR text to local LLM
        # -------------------------------------------------

        ocr_prompt = f"""
    You are NSpectAI's local AI inspection assistant.

    The following text was extracted from an image
    using OCR.

    OCR TEXT:
    --------------------
    {extracted_text}
    --------------------

    User Question:
    {question}

    Analyze the OCR text and answer the user's question
    accurately.

    If the text contains safety inspection information,
    identify relevant risks, findings, compliance issues,
    or recommendations when appropriate.

    Do not invent information that is not present
    in the OCR text.
    """


        answer = generate_answer(
            ocr_prompt
        )


        return {

            "type":
                "ocr",

            "model":
                "llama3.1:8b",

            "answer":
                answer,

            "sources":
                [],

            "routing_reason":
                "Image processed using local Tesseract OCR and analyzed by llama3.1:8b."
        }


    # =====================================================
    # GENERAL MODEL
    # =====================================================

    answer = generate_answer(
        question
    )

    return {

        "type":
            "general",

        "model":
            "llama3.1:8b",

        "answer":
            answer,

        "sources":
            [],

        "routing_reason":
            "General question detected."
    }


