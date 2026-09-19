import ollama


# =========================
# MODEL CONFIGURATION
# =========================

CHAT_MODEL = "llama3.1:8b"

CODE_MODEL = "qwen2.5-coder:7b"

AUTOCOMPLETE_MODEL = "qwen2.5-coder:1.5b-base"

EMBEDDING_MODEL = "nomic-embed-text:latest"


# =========================
# EMBEDDINGS
# =========================

def create_embedding(text: str):

    response = ollama.embeddings(
        model=EMBEDDING_MODEL,
        prompt=text
    )

    return response["embedding"]


# =========================
# GENERAL AI
# =========================

def generate_answer(prompt: str):

    response = ollama.chat(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]


# =========================
# CODE AI
# =========================

def generate_code_answer(prompt: str):

    response = ollama.chat(
        model=CODE_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]


# =========================
# AUTOCOMPLETE
# =========================

def generate_autocomplete(prompt: str):

    response = ollama.chat(
        model=AUTOCOMPLETE_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]

def generate_inspection_answer(
    prompt: str
):

    response = ollama.chat(

        model="llama3.1:8b",

        messages=[
            {
                "role": "system",
                "content":
                    "You are an industrial inspection AI. Return accurate structured JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

    )

    return response["message"]["content"]