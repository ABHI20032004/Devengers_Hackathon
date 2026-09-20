
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
  Upload,
  Trash2,
  Image,
  File,
} from "lucide-react";

import {
  getInspections,
  updateFindingStatus,
  createCorrectiveAction,
} from "../services/api";

import { useEffect, useMemo, useState } from "react";



export default function Findings() {

  const [findings, setFindings] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [severity, setSeverity] =
    useState("ALL");

  const [status, setStatus] =
    useState("ALL");

  const [selectedFinding, setSelectedFinding] =
    useState(null);

    const [evidence, setEvidence] =
  useState([]);

const [evidenceLoading, setEvidenceLoading] =
  useState(false);

const [evidenceUploading, setEvidenceUploading] =
  useState(false);

const [evidenceDescription, setEvidenceDescription] =
  useState("");

const [evidenceFile, setEvidenceFile] =
  useState(null);


  /* =====================================================
     LOAD FINDINGS
  ===================================================== */

  async function loadFindings() {

    try {

      setLoading(true);
      setError("");

      const data =
        await getInspections();

      const inspections =
        data.inspections || [];

      const allFindings = [];


      /*
       * Each inspection already has its own
       * findings endpoint.
       *
       * Load findings for every inspection.
       */

      for (const inspection of inspections) {

        try {

          const response =
            await fetch(
              `http://127.0.0.1:8000/api/inspections/${inspection.id}/findings`
            );

          if (!response.ok) {
            continue;
          }

          const result =
            await response.json();

          const inspectionFindings =
            result.findings || [];


          inspectionFindings.forEach(
            (finding) => {

              allFindings.push({

                ...finding,

                inspection_id:
                  inspection.id,

                inspection_title:
                  inspection.title ||
                  `Inspection #${inspection.id}`,

              });

            }
          );

        } catch (err) {

          console.error(
            `Failed to load findings for inspection ${inspection.id}`,
            err
          );

        }

      }


      setFindings(allFindings);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to load findings"
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadFindings();

  }, []);



const [showActionForm, setShowActionForm] =
  useState(false);

const [actionSaving, setActionSaving] =
  useState(false);

const [actionForm, setActionForm] = useState({
  title: "",
  assigned_to: "",
  priority: "MEDIUM",
  due_date: "",
  notes: "",
});


async function handleCreateAction() {
  if (!selectedFinding) return;

  if (!actionForm.title.trim()) {
    alert("Please enter an action title");
    return;
  }

  try {
    setActionSaving(true);

    await createCorrectiveAction({
      finding_id: selectedFinding.id,
      title: actionForm.title.trim(),
      assigned_to:
        actionForm.assigned_to.trim() || null,
      priority: actionForm.priority,
      due_date: actionForm.due_date || null,
      notes: actionForm.notes.trim() || null,
    });

    alert("Corrective action created successfully");

    setActionForm({
      title: "",
      assigned_to: "",
      priority: "MEDIUM",
      due_date: "",
      notes: "",
    });

    setShowActionForm(false);

  } catch (error) {
    console.error(
      "Create corrective action failed:",
      error
    );

    alert(
      error.message ||
      "Failed to create corrective action"
    );

  } finally {
    setActionSaving(false);
  }
}

/* =====================================================
   EVIDENCE
===================================================== */

async function loadEvidence(findingId) {

  try {

    setEvidenceLoading(true);

    const response = await fetch(
      `http://127.0.0.1:8000/api/evidence/finding/${findingId}`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load evidence"
      );
    }

    const data =
      await response.json();

    setEvidence(
      data.evidence || []
    );

  } catch (error) {

    console.error(
      "Failed to load evidence:",
      error
    );

    setEvidence([]);

  } finally {

    setEvidenceLoading(false);

  }
}


async function handleUploadEvidence() {

  if (!selectedFinding) return;

  if (!evidenceFile) {

    alert(
      "Please select an evidence file"
    );

    return;

  }


  try {

    setEvidenceUploading(true);


    const formData =
      new FormData();

    formData.append(
      "finding_id",
      selectedFinding.id
    );

    formData.append(
      "description",
      evidenceDescription
    );

    formData.append(
      "file",
      evidenceFile
    );


    const response =
      await fetch(
        "http://127.0.0.1:8000/api/evidence/",
        {
          method: "POST",
          body: formData,
        }
      );


    if (!response.ok) {

      const errorData =
        await response.json()
          .catch(() => ({}));

      throw new Error(
        errorData.detail ||
        "Failed to upload evidence"
      );

    }


    setEvidenceFile(null);

    setEvidenceDescription("");


    const fileInput =
      document.getElementById(
        "evidence-file-input"
      );

    if (fileInput) {
      fileInput.value = "";
    }


    await loadEvidence(
      selectedFinding.id
    );


  } catch (error) {

    console.error(
      "Evidence upload failed:",
      error
    );

    alert(
      error.message ||
      "Failed to upload evidence"
    );

  } finally {

    setEvidenceUploading(false);

  }

}


async function handleDeleteEvidence(
  evidenceId
) {

  if (
    !window.confirm(
      "Delete this evidence?"
    )
  ) {
    return;
  }


  try {

    const response =
      await fetch(
        `http://127.0.0.1:8000/api/evidence/${evidenceId}`,
        {
          method: "DELETE",
        }
      );


    if (!response.ok) {

      throw new Error(
        "Failed to delete evidence"
      );

    }


    setEvidence((current) =>
      current.filter(
        (item) =>
          item.id !== evidenceId
      )
    );


  } catch (error) {

    console.error(
      "Evidence delete failed:",
      error
    );

    alert(
      error.message ||
      "Failed to delete evidence"
    );

  }

}



///////   handle status change
async function handleStatusChange(
  finding,
  newStatus
) {
  try {

    await updateFindingStatus(
      finding.id,
      newStatus
    );

    setFindings((current) =>
      current.map((item) =>
        item.id === finding.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    setSelectedFinding((current) =>
      current &&
      current.id === finding.id
        ? {
            ...current,
            status: newStatus,
          }
        : current
    );

  } catch (error) {

    console.error(
      "Status update failed:",
      error
    );

    alert(
      error.message ||
      "Failed to update status"
    );
  }
}


  /* =====================================================
     FILTER FINDINGS
  ===================================================== */

  const filteredFindings =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return findings.filter(
        (finding) => {

          const findingSeverity =
            (
              finding.severity ||
              "LOW"
            ).toUpperCase();


          const findingStatus =
            (
              finding.status ||
              "OPEN"
            ).toUpperCase();


          const matchesSeverity =
            severity === "ALL" ||
            findingSeverity === severity;


          const matchesStatus =
            status === "ALL" ||
            findingStatus === status;


          const matchesSearch =
            !query ||
            [
              finding.title,
              finding.description,
              finding.category,
              finding.recommendation,
              finding.source_document,
              finding.inspection_title,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(query)
              );


          return (
            matchesSeverity &&
            matchesStatus &&
            matchesSearch
          );

        }
      );

    }, [
      findings,
      search,
      severity,
      status,
    ]);


  /* =====================================================
     COUNTS
  ===================================================== */

  const criticalCount =
    findings.filter(
      (item) =>
        item.severity?.toUpperCase() ===
        "CRITICAL"
    ).length;


  const highCount =
    findings.filter(
      (item) =>
        item.severity?.toUpperCase() ===
        "HIGH"
    ).length;


  const openCount =
    findings.filter(
      (item) =>
        (
          item.status || "OPEN"
        ).toUpperCase() ===
        "OPEN"
    ).length;


  const resolvedCount =
    findings.filter(
      (item) =>
        (
          item.status || ""
        ).toUpperCase() ===
        "RESOLVED"
    ).length;


  return (
    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <h1 className="page-title">
            Findings
          </h1>

          <div className="font-size-5 text-gray-700">
            Review and manage AI-detected
            inspection findings.
          </div>

        </div>


        <div className="actions">

          <button
            className="btn btn-secondary"
            onClick={loadFindings}
            disabled={loading}
          >

            <RefreshCw
              size={14}
              className={
                loading
                  ? "spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="card"
          style={{
            padding: 13,
            marginBottom: 18,
            color: "#b91c1c",
            background: "#fef2f2",
            fontSize: 11,
          }}
        >

          {error}

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="findings-summary-grid">

        <FindingStat
          label="Total Findings"
          value={findings.length}
          icon={AlertTriangle}
        />

        <FindingStat
          label="Open"
          value={openCount}
          icon={AlertTriangle}
        />

        <FindingStat
          label="High Risk"
          value={
            highCount +
            criticalCount
          }
          icon={ShieldAlert}
        />

        <FindingStat
          label="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
        />

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="card findings-toolbar">

        <div className="finding-search">

          <Search size={15} />

          <input
            type="text"
            placeholder="Search findings..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (

            <button
              className="search-clear"
              onClick={() =>
                setSearch("")
              }
            >

              <X size={13} />

            </button>

          )}

        </div>


        <div className="finding-filters">

          <select
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Severities
            </option>

            <option value="CRITICAL">
              Critical
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>

          </select>


          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
          >

            <option value="ALL">
              All Status
            </option>

            <option value="OPEN">
              Open
            </option>

            <option value="IN PROGRESS">
              In Progress
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

          </select>

        </div>

      </div>


      {/* =================================================
          RESULTS
      ================================================= */}

      {loading ? (

        <div className="card empty-state">

          <RefreshCw
            size={22}
            className="spin"
          />

          <strong>
            Loading findings...
          </strong>

        </div>

      ) : filteredFindings.length === 0 ? (

        <div className="card empty-state">

          <div className="empty-icon">

            <CheckCircle2 size={22} />

          </div>

          <strong>
            No findings found
          </strong>

          <p>
            {findings.length === 0
              ? "Analyze an inspection to generate AI findings."
              : "Try changing your search or filters."}
          </p>

        </div>

      ) : (

        <div className="card">

          <div className="table-wrapper">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Finding
                  </th>

                  <th>
                    Inspection
                  </th>

                  <th>
                    Severity
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Source
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredFindings.map(
                  (finding, index) => (

                    <tr
                      key={
                        finding.id ||
                        `${finding.inspection_id}-${index}`
                      }
                      className="finding-row"
                        onClick={() => {
                        setSelectedFinding(finding);
                        loadEvidence(finding.id);
                      }}
                    >

                      <td>

                        <div className="finding-table-title">

                          <span className="finding-id ">
                            ID: #{finding.id}
                          </span>

                          <strong>
                            {finding.title ||
                              "Inspection Finding"}
                          </strong>

                          {/* <span>
                            {finding.description
                              ? finding.description.slice(
                                  0,
                                  80
                                ) +
                                (
                                  finding.description
                                    .length > 80
                                    ? "..."
                                    : ""
                                )
                              : "No description"}
                          </span> */}

                        </div>

                      </td>


                      <td>

                        <span className="inspection-name">

                          {finding.inspection_title}

                        </span>

                      </td>


                      <td>

                        <SeverityBadge
                          severity={
                            finding.severity
                          }
                        />

                      </td>


                      <td>

                        <span className="category-badge">

                          {finding.category ||
                            "General"}

                        </span>

                      </td>


                      <td>

                        <StatusBadge
                          status={
                            finding.status
                          }
                        />

                      </td>


                      <td>

                        <div className="source-cell">

                          <FileText size={13} />

                          <span>

                            {finding.source_document ||
                              (
                                finding.page_number
                                  ? `Page ${finding.page_number}`
                                  : "Document"
                              )}

                          </span>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      {selectedFinding && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedFinding(null)
          }
        >

          <div
            className="modal finding-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <div className="hero-label">
                  INSPECTION FINDING
                </div>

                <h2>
                  {selectedFinding.title ||
                    "Finding"}
                </h2>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setSelectedFinding(null)
                }
              >

                <X size={17} />

              </button>

            </div>


            <div className="finding-detail-body">

              <div className="detail-badges">

                <SeverityBadge
                  severity={
                    selectedFinding.severity
                  }
                />

                <StatusBadge
                  status={
                    selectedFinding.status
                  }
                />

                <span className="category-badge">

                  {selectedFinding.category ||
                    "General"}

                </span>

              </div>

              <div className="status-control">

                <label>Finding Status</label>

                <select
                    value={
                    (
                        selectedFinding.status || "OPEN"
                    ).toUpperCase()
                    }
                    onChange={(event) =>
                    handleStatusChange(
                        selectedFinding,
                        event.target.value
                    )
                    }
                >
                    <option value="OPEN">
                    Open
                    </option>

                    <option value="IN PROGRESS">
                    In Progress
                    </option>

                    <option value="RESOLVED">
                    Resolved
                    </option>
                </select>

                </div>


              <DetailBlock
                title="Description"
                value={
                  selectedFinding.description ||
                  "No description provided."
                }
              />


              <DetailBlock
                title="Recommended Action"
                value={
                  selectedFinding.recommendation ||
                  "No recommendation provided."
                }
              />


              {/* =================================================
    EVIDENCE
================================================= */}

          <div className="evidence-section">

            <div className="detail-block-title">
              EVIDENCE
            </div>


            {/* Upload */}

            <div className="evidence-upload-box">

              <div className="evidence-upload-row">

                <label
                  htmlFor="evidence-file-input"
                  className="btn btn-secondary"
                >

                  <Upload size={13} />

                  Select Evidence

                </label>


                <input
                  id="evidence-file-input"
                  type="file"
                  style={{
                    display: "none",
                  }}
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(event) =>
                    setEvidenceFile(
                      event.target.files?.[0] ||
                      null
                    )
                  }
                />


                {evidenceFile && (

                  <span className="evidence-file-name">

                    {evidenceFile.name}

                  </span>

                )}

              </div>


              <textarea
                placeholder="Describe this evidence..."
                value={
                  evidenceDescription
                }
                onChange={(event) =>
                  setEvidenceDescription(
                    event.target.value
                  )
                }
                rows={2}
              />


              <button
                className="btn btn-primary"
                onClick={
                  handleUploadEvidence
                }
                disabled={
                  evidenceUploading ||
                  !evidenceFile
                }
              >

                <Upload size={13} />

                {evidenceUploading
                  ? "Uploading..."
                  : "Upload Evidence"}

              </button>

            </div>


            {/* Existing Evidence */}

            <div className="evidence-list">

              {evidenceLoading ? (

                <div className="evidence-empty">

                  Loading evidence...

                </div>

              ) : evidence.length === 0 ? (

                <div className="evidence-empty">

                  <FileText size={17} />

                  <span>
                    No evidence attached.
                  </span>

                </div>

              ) : (

                evidence.map((item) => (

                  <div
                    className="evidence-item"
                    key={item.id}
                  >

                    <div className="evidence-icon">

                      {item.file_type?.startsWith(
                        "image/"
                      ) ? (

                        <Image size={16} />

                      ) : (

                        <File size={16} />

                      )}

                    </div>


                    <div className="evidence-info">

                      <strong>

                        {item.file_path
                          ?.split("\\")
                          .pop()
                          ?.split("/")
                          .pop() ||
                          "Evidence"}

                      </strong>


                      {item.description && (

                        <span>
                          {item.description}
                        </span>

                      )}

                    </div>


                    <button
                      className="evidence-delete"
                      onClick={() =>
                        handleDeleteEvidence(
                          item.id
                        )
                      }
                      title="Delete evidence"
                    >

                      <Trash2 size={14} />

                    </button>

                  </div>

                ))

              )}

            </div>

          </div>


              <div className="finding-source-detail">

                <div>

                  <span>
                    Source Document
                  </span>

                  <strong>
                    {selectedFinding.source_document ||
                      "Not specified"}
                  </strong>

                </div>


                <div>

                  <span>
                    Page
                  </span>

                  <strong>
                    {selectedFinding.page_number ||
                      "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Inspection
                  </span>

                  <strong>
                    {selectedFinding.inspection_title}
                  </strong>

                </div>

              </div>

            </div>


            {showActionForm && (

  <div className="corrective-action-form">

    <div className="detail-block-title">
      CREATE CORRECTIVE ACTION
    </div>

    <div className="action-form-grid">

      <div className="form-group">

        <label>
          Action Title
        </label>

        <input
          type="text"
          placeholder="Describe the corrective action"
          value={actionForm.title}
          onChange={(event) =>
            setActionForm({
              ...actionForm,
              title: event.target.value,
            })
          }
        />

      </div>


      <div className="form-group">

        <label>
          Assigned To
        </label>

        <input
          type="text"
          placeholder="Person responsible"
          value={actionForm.assigned_to}
          onChange={(event) =>
            setActionForm({
              ...actionForm,
              assigned_to:
                event.target.value,
            })
          }
        />

      </div>


      <div className="form-group">

        <label>
          Priority
        </label>

        <select
          value={actionForm.priority}
          onChange={(event) =>
            setActionForm({
              ...actionForm,
              priority:
                event.target.value,
            })
          }
        >

          <option value="LOW">
            Low
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="HIGH">
            High
          </option>

          <option value="CRITICAL">
            Critical
          </option>

        </select>

      </div>


      <div className="form-group">

        <label>
          Due Date
        </label>

        <input
          type="date"
          value={actionForm.due_date}
          onChange={(event) =>
            setActionForm({
              ...actionForm,
              due_date:
                event.target.value,
            })
          }
        />

      </div>


      <div
        className="form-group"
        style={{
          gridColumn: "1 / -1",
        }}
      >

        <label>
          Notes
        </label>

        <textarea
          rows="3"
          placeholder="Additional instructions or notes"
          value={actionForm.notes}
          onChange={(event) =>
            setActionForm({
              ...actionForm,
              notes:
                event.target.value,
            })
          }
        />

      </div>

    </div>


    <div className="action-form-buttons">

      <button
        className="btn btn-secondary"
        onClick={() =>
          setShowActionForm(false)
        }
        disabled={actionSaving}
      >
        Cancel
      </button>


      <button
        className="btn btn-primary"
        onClick={handleCreateAction}
        disabled={actionSaving}
      >

        {actionSaving
          ? "Creating..."
          : "Create Action"}

      </button>

    </div>

  </div>

)}


            <div className="modal-actions">

            <button
                className="btn btn-secondary"
                onClick={() =>
                setSelectedFinding(null)
                }
            >
                Close
            </button>

            <button
                className="btn btn-primary"
                onClick={() =>
                setShowActionForm(true)
                }
            >
                Create Corrective Action
            </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   STAT
========================================================= */

function FindingStat({
  label,
  value,
  icon: Icon,
}) {

  return (
    <div className="card finding-stat">

      <div className="finding-stat-icon">

        <Icon size={17} />

      </div>

      <div>

        <div className="stat-label">
          {label}
        </div>

        <div className="finding-stat-value">
          {value}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SEVERITY BADGE
========================================================= */

function SeverityBadge({
  severity,
}) {

  const value =
    (
      severity ||
      "LOW"
    ).toUpperCase();

  return (
    <span
      className={`severity-badge severity-${value.toLowerCase()}`}
    >
      {value}
    </span>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {

  const value =
    (status || "OPEN").toUpperCase();

  let className = "finding-status open";

  if (value === "RESOLVED") {
    className = "finding-status resolved";
  }

  if (value === "IN PROGRESS") {
    className = "finding-status progress";
  }

  return (
    <span className={className}>
      {value === "IN PROGRESS"
        ? "IN PROGRESS"
        : value}
    </span>
  );
}


/* =========================================================
   DETAIL BLOCK
========================================================= */

function DetailBlock({
  title,
  value,
}) {

  return (
    <div className="detail-block">

      <div className="detail-block-title">
        {title}
      </div>

      <div className="detail-block-text">
        {value}
      </div>

    </div>
  );
}