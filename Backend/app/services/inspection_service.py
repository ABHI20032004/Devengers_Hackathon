import json
import re

from .ollama_service import generate_inspection_answer
from .chroma_service import collection


def get_document_chunks(
    document_id: int
):

    results = collection.get(
        where={
            "document_id": str(document_id)
        }
    )

    documents = results.get(
        "documents",
        []
    )

    metadatas = results.get(
        "metadatas",
        []
    )

    chunks = []

    for index, text in enumerate(documents):

        metadata = (
            metadatas[index]
            if index < len(metadatas)
            else {}
        )

        chunks.append({

            "text": text,

            "page_number":
                metadata.get(
                    "page_number"
                ),

            "filename":
                metadata.get(
                    "filename",
                    ""
                )
        })

    return chunks


def build_inspection_prompt(
    chunks
):

    context_parts = []

    for chunk in chunks:

        context_parts.append(
            f"""
PAGE {chunk["page_number"]}

{chunk["text"]}
"""
        )

    context = "\n".join(
        context_parts
    )

    return f"""
You are an industrial safety inspection AI.

Analyze the following inspection document carefully.

Identify only safety, compliance, operational, environmental,
electrical, fire, machinery, structural, or other relevant
inspection issues that are explicitly supported by the document.

For EVERY finding, determine its severity using the following
classification criteria:

LOW:
- Minor issue with limited impact.
- Small deviation from recommended practice.
- Low likelihood of causing harm.
- Does not require immediate corrective action.

MEDIUM:
- Moderate safety, operational, or compliance concern.
- Could cause an incident if left unresolved.
- Requires corrective action within a reasonable timeframe.
- Does not represent an immediate severe hazard.

HIGH:
- Serious safety, operational, or compliance issue.
- Significant potential for injury, equipment damage,
  environmental harm, or major non-compliance.
- Requires prompt corrective action.

CRITICAL:
- Immediate or potentially life-threatening hazard.
- Serious condition that could result in severe injury or death.
- Major uncontrolled electrical, fire, machinery, structural,
  chemical, or other hazardous condition.
- Requires urgent corrective action.

IMPORTANT:
Do NOT classify something as CRITICAL simply because it is
non-compliant or undesirable.

Use CRITICAL only when the document provides evidence of an
immediate or potentially severe hazard.

Only identify issues supported by the document.
Do not invent facts, measurements, hazards, or conditions.

Determine the overall inspection risk_level based on the
severity and significance of the findings.

Return ONLY valid JSON.

Required JSON format:

{{
  "risk_level": "LOW",
  "compliance_score": 85,
  "findings": [
    {{
      "title": "Short finding title",
      "description": "Detailed description of the issue supported by the document",
      "category": "Safety",
      "severity": "HIGH",
      "recommendation": "Recommended corrective action",
      "page_number": 1,
      "source_document": "filename.pdf"
    }}
  ]
}}

Rules:

- risk_level must be LOW, MEDIUM, HIGH or CRITICAL.
- compliance_score must be an integer between 0 and 100.
- severity must be LOW, MEDIUM, HIGH or CRITICAL.
- page_number must refer to the source document.
- source_document must contain the actual source filename when available.
- Each finding must be supported by information in the document.
- Do not invent facts.
- Do not duplicate the same finding.
- If there are no findings, return an empty findings array.
- Return valid JSON only.
- Do not use Markdown.
- Do not add explanations outside the JSON.

DOCUMENT:

{context}
"""



def extract_json(
    response
):

    response = response.strip()

    # Remove markdown fences

    response = re.sub(
        r"```json",
        "",
        response,
        flags=re.IGNORECASE
    )

    response = re.sub(
        r"```",
        "",
        response
    )

    response = response.strip()

    # Find JSON object

    start = response.find("{")
    end = response.rfind("}")

    if start == -1 or end == -1:

        raise ValueError(
            "AI did not return valid JSON"
        )

    return json.loads(
        response[start:end + 1]
    )


def analyze_inspection(
    inspection_id: int,
    document_id: int
):

    chunks = get_document_chunks(
        document_id
    )

    if not chunks:

        raise ValueError(
            "No indexed chunks found for the inspection PDF"
        )

    prompt = build_inspection_prompt(
        chunks
    )

    response = generate_inspection_answer(
        prompt
    )

    result = extract_json(
        response
    )

    return result