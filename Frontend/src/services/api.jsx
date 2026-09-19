const API_URL = "http://127.0.0.1:8000";


// =====================================================
// GET DOCUMENTS
// =====================================================

export async function getDocuments() {
  const response = await fetch(
    `${API_URL}/api/documents`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch documents"
    );
  }

  return response.json();
}


// =====================================================
// UPLOAD SINGLE DOCUMENT
// =====================================================

export async function uploadDocument(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/api/documents/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Document upload failed"
    );
  }

  return data;
}


// =====================================================
// UPLOAD MULTIPLE DOCUMENTS
// =====================================================

export async function uploadDocuments(files) {
  const results = [];

  for (const file of files) {
    try {
      const result =
        await uploadDocument(file);

      results.push({
        file: file.name,
        success: true,
        ...result,
      });

    } catch (error) {

      results.push({
        file: file.name,
        success: false,
        error:
          error.message ||
          "Upload failed",
      });

    }
  }

  return results;
}


// =====================================================
// DELETE DOCUMENT
// =====================================================

export async function deleteDocument(
  documentId
) {
  const response = await fetch(
    `${API_URL}/api/documents/${documentId}`,
    {
      method: "DELETE",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Failed to delete document"
    );
  }

  return data;
}


// =====================================================
// CHAT
// =====================================================
export async function sendChatMessage(data) {

  const formData =
    new FormData();

  formData.append(
    "message",
    data.message
  );

  formData.append(
    "has_pdf",
    "false"
  );

  formData.append(
    "has_image",
    data.image ? "true" : "false"
  );

  if (data.mode) {

    formData.append(
      "mode",
      data.mode
    );

  }

  if (data.image) {

    formData.append(
      "image",
      data.image
    );

  }

  const response =
    await fetch(
      `${API_URL}/api/chat`,
      {
        method: "POST",
        body: formData,
      }
    );

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      result.detail ||
      "Failed to get AI response"
    );

  }

  return result;
}

// =====================================================
// INSPECTIONS
// =====================================================

export async function getInspections() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/inspections"
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load inspections"
    );
  }

  return data;
}


export async function getInspection(id) {

  const response = await fetch(
    `http://127.0.0.1:8000/api/inspections/${id}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load inspection"
    );
  }

  return data;
}


export async function createInspection(inspection) {

  const response = await fetch(
    "http://127.0.0.1:8000/api/inspections",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(inspection),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to create inspection"
    );
  }

  return data;
}


export async function updateInspection(
  id,
  inspection
) {

  const response = await fetch(
    `http://127.0.0.1:8000/api/inspections/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(inspection),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to update inspection"
    );
  }

  return data;
}


export async function deleteInspection(id) {

  const response = await fetch(
    `http://127.0.0.1:8000/api/inspections/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to delete inspection"
    );
  }

  return data;
}


export async function analyzeInspection(
  inspectionId
) {
  const response = await fetch(
    `${API_URL}/api/inspections/${inspectionId}/analyze`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Failed to analyze inspection"
    );
  }

  return data;
}


// ================================
// GET INSPECTION FINDINGS
// ================================

// ================================
// GET INSPECTION FINDINGS
// ================================

export async function getInspectionFindings(inspectionId) {
  const response = await fetch(
    `${API_URL}/api/inspections/${inspectionId}/findings`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to load inspection findings"
    );
  }

  return data;
}


export async function updateFindingStatus(
  findingId,
  status
) {

  const response = await fetch(
    `${API_URL}/api/findings/${findingId}/status`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    }
  );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.detail ||
      "Failed to update finding status"
    );

  }


  return data;
}



export async function createCorrectiveAction(data) {
  const response = await fetch(
    `${API_URL}/api/corrective-actions`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail ||
      "Failed to create corrective action"
    );
  }

  return result;
}


export async function getCorrectiveActions() {
  const response = await fetch(
    `${API_URL}/api/corrective-actions`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Failed to load corrective actions"
    );
  }

  return data;
}


export async function updateCorrectiveActionStatus(
  actionId,
  status
) {
  const response = await fetch(
    `${API_URL}/api/corrective-actions/${actionId}/status`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Failed to update action status"
    );
  }

  return data;
}


export async function getDashboardStats() {

  const response = await fetch(
    `${API_URL}/api/dashboard/stats`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
      "Failed to load dashboard statistics"
    );
  }

  return data;
}



// =====================================================
// EVIDENCE
// =====================================================

export async function getEvidenceByFinding(
  findingId
) {
  const response = await fetch(
    `${API_URL}/api/evidence/finding/${findingId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch evidence"
    );
  }

  return response.json();
}


export async function createEvidence(
  findingId,
  file,
  description = ""
) {
  const formData = new FormData();

  formData.append(
    "finding_id",
    findingId
  );

  formData.append(
    "file",
    file
  );

  formData.append(
    "description",
    description
  );

  const response = await fetch(
    `${API_URL}/api/evidence/`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {

    const error =
      await response
        .json()
        .catch(() => ({}));

    throw new Error(
      error.detail ||
      "Failed to create evidence"
    );
  }

  return response.json();
}


export async function deleteEvidence(
  evidenceId
) {
  const response = await fetch(
    `${API_URL}/api/evidence/${evidenceId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete evidence"
    );
  }

  return response.json();
}