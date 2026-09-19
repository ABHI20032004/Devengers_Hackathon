from .ollama_service import (
    create_embedding,
    generate_answer
)

from .chroma_service import (
    search_chunks
)


def ask_pdf_question(
    question: str,
    top_k: int = 5
):

    # --------------------------------
    # 1. Convert question to embedding
    # --------------------------------

    query_embedding = create_embedding(
        question
    )

    # --------------------------------
    # 2. Search ChromaDB
    # --------------------------------

    results = search_chunks(
        query_embedding,
        top_k
    )

    if not results:

        return {
            "answer": (
                "I could not find any "
                "relevant information in "
                "the uploaded documents."
            ),
            "sources": []
        }

    documents = results.get(
        "documents",
        [[]]
    )[0]

    metadatas = results.get(
        "metadatas",
        [[]]
    )[0]

    # --------------------------------
    # 3. Build context + sources
    # --------------------------------

    context_parts = []
    sources = []

    for index, (document, metadata) in enumerate(
        zip(documents, metadatas)
    ):

        filename = metadata.get(
            "filename",
            "Unknown"
        )

        page_number = metadata.get(
            "page_number",
            "Unknown"
        )

        document_id = metadata.get(
            "document_id",
            None
        )

        # --------------------------------
        # Context for LLM
        # --------------------------------

        context_parts.append(
            f"""
SOURCE [{index + 1}]
Document: {filename}
Page: {page_number}

Content:
{document}
"""
        )

        # --------------------------------
        # Source information for frontend
        # --------------------------------

        sources.append({
            "source_id": index + 1,
            "filename": filename,
            "page_number": page_number,
            "document_id": document_id
        })

    context = "\n\n".join(
        context_parts
    )

    # --------------------------------
    # 4. Ask Llama
    # --------------------------------

    prompt = f"""
You are NSpectAI's industrial inspection
AI assistant.

Answer the user's question using ONLY
the information contained in the provided
document context.

IMPORTANT SOURCE RULES:

1. Every factual statement must be
   supported by the provided context.

2. When using information from a source,
   cite it using this exact format:

   [Source 1, Page 3]

3. If multiple sources support a statement,
   cite all relevant sources.

4. Never invent a document name,
   page number, finding, measurement,
   date, risk level, or other fact.

5. If the requested information cannot
   be found in the provided context,
   clearly say:

   "The requested information was not
   found in the provided documents."

6. Do not cite sources that do not support
   the statement.

User Question:
{question}

Document Context:
{context}

Return a clear and professional answer
with inline source citations.
"""

    answer = generate_answer(
        prompt
    )

    # --------------------------------
    # 5. Return answer + references
    # --------------------------------

    return {
        "answer": answer,
        "sources": sources
    }