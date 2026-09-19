from pypdf import PdfReader


CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def split_text(
    text,
    chunk_size=CHUNK_SIZE,
    overlap=CHUNK_OVERLAP
):

    text = text.strip()

    if not text:
        return []

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start = end - overlap

    return chunks


def extract_pdf_chunks(
    file_path,
    document_id,
    filename
):

    reader = PdfReader(file_path)

    chunks = []

    global_chunk_id = 0

    for page_number, page in enumerate(
        reader.pages,
        start=1
    ):

        text = page.extract_text() or ""

        page_chunks = split_text(text)

        for chunk_text in page_chunks:

            chunks.append({

                "document_id": document_id,

                "filename": filename,

                "page_number": page_number,

                "chunk_id": global_chunk_id,

                "text": chunk_text

            })

            global_chunk_id += 1

    return chunks, len(reader.pages)