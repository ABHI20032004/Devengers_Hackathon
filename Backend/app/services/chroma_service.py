import chromadb


CHROMA_PATH = "./data/chroma"


client = chromadb.PersistentClient(
    path=CHROMA_PATH
)


collection = client.get_or_create_collection(
    name="inspection_documents"
)


def add_chunks(chunks):

    if not chunks:
        return

    ids = []
    documents = []
    embeddings = []
    metadatas = []

    for chunk in chunks:

        chunk_id = (
            f'{chunk["document_id"]}_'
            f'{chunk["page_number"]}_'
            f'{chunk["chunk_id"]}'
        )

        ids.append(chunk_id)

        documents.append(
            chunk["text"]
        )

        embeddings.append(
            chunk["embedding"]
        )

        metadatas.append({

            "document_id": str(
                chunk["document_id"]
            ),

            "filename": chunk["filename"],

            "page_number": chunk["page_number"],

            "chunk_id": chunk["chunk_id"]

        })

    collection.upsert(

        ids=ids,

        documents=documents,

        embeddings=embeddings,

        metadatas=metadatas

    )


def search_chunks(
    query_embedding,
    top_k=5
):

    if collection.count() == 0:
        return []

    results = collection.query(

        query_embeddings=[
            query_embedding
        ],

        n_results=top_k

    )

    return results


def delete_document_chunks(document_id):
    """
    Delete all ChromaDB chunks belonging to a document.
    """

    document_id = str(document_id)

    results = collection.get(
        where={
            "document_id": document_id
        }
    )

    ids = results.get("ids", [])

    if ids:
        collection.delete(
            ids=ids
        )

    return len(ids)