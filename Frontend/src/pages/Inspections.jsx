import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  RefreshCw,
  ClipboardCheck,
  MapPin,
  User,
  CalendarDays,
  Trash2,
  Eye,
  X,
  FileText,
  ShieldCheck,
  Check,
  Sparkles,
  AlertTriangle,
  CircleCheck,
} from "lucide-react";

import {
  getInspections,
  getDocuments,
  createInspection,
  deleteInspection,
  analyzeInspection,
} from "../services/api";


export default function Inspections() {

  // =====================================================
  // STATE
  // =====================================================

  const [inspections, setInspections] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [selectedInspection, setSelectedInspection] =
    useState(null);

  const [creating, setCreating] =
    useState(false);

  const [analyzingId, setAnalyzingId] =
    useState(null);

  const [analysisResult, setAnalysisResult] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    location: "",
    inspection_date: "",
    inspector: "",
    document_id: "",
  });


  // =====================================================
  // LOAD DATA
  // =====================================================

  async function loadData() {

    try {

      setLoading(true);
      setError("");

      const [
        inspectionData,
        documentData,
      ] = await Promise.all([
        getInspections(),
        getDocuments(),
      ]);

      setInspections(
        inspectionData.inspections || []
      );

      setDocuments(
        documentData.documents || []
      );

    } catch (err) {

      setError(
        err.message ||
        "Failed to load inspection data."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadData();

  }, []);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  function handleChange(event) {

    const {
      name,
      value,
    } = event.target;

    setForm(current => ({
      ...current,
      [name]: value,
    }));
  }


  // =====================================================
  // CREATE INSPECTION
  // =====================================================

  async function handleCreate(event) {

    event.preventDefault();

    setError("");

    if (!form.title.trim()) {

      setError(
        "Inspection title is required."
      );

      return;
    }


    if (!form.document_id) {

      setError(
        "Please select an inspection PDF."
      );

      return;
    }


    try {

      setCreating(true);

      const payload = {

        title:
          form.title.trim(),

        location:
          form.location.trim() ||
          null,

        inspection_date:
          form.inspection_date ||
          null,

        inspector:
          form.inspector.trim() ||
          null,

        document_id:
          Number(
            form.document_id
          ),

      };


      const data =
        await createInspection(
          payload
        );


      if (data.inspection) {

        setInspections(current => [
          data.inspection,
          ...current,
        ]);

      } else {

        await loadData();

      }


      setForm({
        title: "",
        location: "",
        inspection_date: "",
        inspector: "",
        document_id: "",
      });

      setShowCreate(false);

    } catch (err) {

      setError(
        err.message ||
        "Failed to create inspection."
      );

    } finally {

      setCreating(false);

    }
  }


  // =====================================================
  // ANALYZE WITH AI
  // =====================================================

  async function handleAnalyze(
    inspection
  ) {

    if (!inspection.document_id) {

      setError(
        "This inspection does not have a PDF attached."
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Analyze "${inspection.title}" with AI?\n\nThe attached PDF will be analyzed and inspection findings will be generated.`
      );


    if (!confirmed) {
      return;
    }


    try {

      setAnalyzingId(
        inspection.id
      );

      setError("");
      setAnalysisResult(null);


      const result =
        await analyzeInspection(
          inspection.id
        );


      // Update inspection immediately

      setInspections(current =>
        current.map(item =>
          item.id === inspection.id
            ? {
                ...item,

                status:
                  result.status ||
                  "completed",

                risk_level:
                  result.risk_level ||
                  "LOW",

                compliance_score:
                  result.compliance_score ??
                  0,

                findings_count:
                  result.findings_count ??
                  0,
              }
            : item
        )
      );


      setAnalysisResult(
        result
      );


      // Refresh database state

      await loadData();


      // Automatically open the inspection

      setSelectedInspection({
        ...inspection,

        status:
          result.status ||
          "completed",

        risk_level:
          result.risk_level ||
          "LOW",

        compliance_score:
          result.compliance_score ??
          0,

        findings_count:
          result.findings_count ??
          0,

        findings:
          result.findings ||
          [],
      });


    } catch (err) {

      setError(
        err.message ||
        "AI analysis failed."
      );

    } finally {

      setAnalyzingId(null);

    }
  }


  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(
    inspection
  ) {

    const confirmed =
      window.confirm(
        `Delete "${inspection.title}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setError("");

      await deleteInspection(
        inspection.id
      );


      setInspections(current =>
        current.filter(
          item =>
            item.id !==
            inspection.id
        )
      );


      if (
        selectedInspection?.id ===
        inspection.id
      ) {

        setSelectedInspection(
          null
        );

      }

    } catch (err) {

      setError(
        err.message ||
        "Failed to delete inspection."
      );

    }
  }


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredInspections =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (!query) {
        return inspections;
      }


      return inspections.filter(
        inspection =>

          inspection.title
            ?.toLowerCase()
            .includes(query) ||

          inspection.location
            ?.toLowerCase()
            .includes(query) ||

          inspection.inspector
            ?.toLowerCase()
            .includes(query) ||

          inspection.status
            ?.toLowerCase()
            .includes(query) ||

          inspection.risk_level
            ?.toLowerCase()
            .includes(query)
      );

    }, [
      inspections,
      search,
    ]);


  // =====================================================
  // READY DOCUMENTS
  // =====================================================

  const readyDocuments =
    documents.filter(
      document =>
        document.status ===
        "ready"
    );


  // =====================================================
  // HELPERS
  // =====================================================

  function getRiskClass(
    risk
  ) {

    switch (
      risk?.toUpperCase()
    ) {

      case "CRITICAL":
      case "HIGH":

        return "risk-high";

      case "MEDIUM":

        return "risk-medium";

      default:

        return "risk-low";
    }
  }


  function getStatusClass(
    status
  ) {

    switch (
      status?.toLowerCase()
    ) {

      case "completed":

        return "status-completed";

      case "processing":
      case "in progress":

        return "status-progress";

      case "failed":

        return "status-failed";

      default:

        return "status-pending";
    }
  }


  function getFindingIcon(
    severity
  ) {

    switch (
      severity?.toUpperCase()
    ) {

      case "CRITICAL":
      case "HIGH":

        return (
          <AlertTriangle
            size={15}
          />
        );

      case "MEDIUM":

        return (
          <AlertTriangle
            size={15}
          />
        );

      default:

        return (
          <CircleCheck
            size={15}
          />
        );
    }
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="inspections-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            INSPECTION MANAGEMENT
          </div>

          <h1 className="page-title">
            Inspections
          </h1>

          <div className="font-size-19 text-gray-600">
            Create, analyze and manage
            industrial safety inspections.
          </div>

        </div>


        <div className="actions">

          <button
            className="btn btn-secondary"
            onClick={loadData}
            disabled={loading}
          >

            <RefreshCw
              size={14}
            />

            Refresh

          </button>


          <button
            className="btn btn-primary"
            onClick={() => {

              setError("");

              setShowCreate(
                true
              );

            }}
          >

            <Plus
              size={15}
            />

            New Inspection

          </button>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="inspection-error">

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
          >

            <X size={15} />

          </button>

        </div>

      )}


      {/* =================================================
          STATS
      ================================================= */}

      <div className="inspection-stats">

        <div className="inspection-stat">

          <div className="inspection-stat-icon">

            <ClipboardCheck
              size={19}
            />

          </div>

          <div>

            <div className="inspection-stat-value">
              {inspections.length}
            </div>

            <div className="inspection-stat-label">
              Total Inspections
            </div>

          </div>

        </div>


        <div className="inspection-stat">

          <div className="inspection-stat-icon">

            <ShieldCheck
              size={19}
            />

          </div>

          <div>

            <div className="inspection-stat-value">

              {
                inspections.filter(
                  item =>
                    item.status
                      ?.toLowerCase() ===
                    "completed"
                ).length
              }

            </div>

            <div className="inspection-stat-label">
              Completed
            </div>

          </div>

        </div>


        <div className="inspection-stat">

          <div className="inspection-stat-icon">

            <FileText
              size={19}
            />

          </div>

          <div>

            <div className="inspection-stat-value">
              {readyDocuments.length}
            </div>

            <div className="inspection-stat-label">
              Ready Documents
            </div>

          </div>

        </div>


        <div className="inspection-stat">

          <div className="inspection-stat-icon">

            <Sparkles
              size={19}
            />

          </div>

          <div>

            <div className="inspection-stat-value">

              {
                inspections.filter(
                  item =>
                    item.status
                      ?.toLowerCase() ===
                    "processing"
                ).length
              }

            </div>

            <div className="inspection-stat-label">
              AI Processing
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="inspection-toolbar">

        <div className="inspection-search">

          <Search
            size={16}
          />

          <input
            type="text"
            placeholder="Search inspections..."
            value={search}
            onChange={event =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div className="card empty-state">

          <RefreshCw
            size={22}
            className="spin"
          />

          <strong>
            Loading inspections...
          </strong>

          <p>
            Fetching inspection records.
          </p>

        </div>

      ) : filteredInspections.length === 0 ? (

        /* =================================================
           EMPTY
        ================================================= */

        <div className="card empty-state">

          <div className="empty-icon">

            <ClipboardCheck
              size={22}
            />

          </div>

          <strong>

            {search
              ? "No inspections found"
              : "No inspections yet"}

          </strong>

          <p>

            {search
              ? "Try a different search."
              : "Create your first industrial inspection to get started."}

          </p>


          {!search && (

            <button
              className="btn btn-primary"
              onClick={() =>
                setShowCreate(
                  true
                )
              }
            >

              <Plus
                size={14}
              />

              Create Inspection

            </button>

          )}

        </div>

      ) : (

        /* =================================================
           INSPECTION GRID
        ================================================= */

        <div className="inspection-grid">

          {filteredInspections.map(
            inspection => (

              <div
                className="inspection-card"
                key={
                  inspection.id
                }
              >

                {/* TOP */}

                <div className="inspection-card-top">

                  <div className="inspection-number">

                    INSPECTION #

                    {String(
                      inspection.id
                    ).padStart(
                      3,
                      "0"
                    )}

                  </div>


                  <div
                    className={
                      `inspection-status ${
                        getStatusClass(
                          inspection.status
                        )
                      }`
                    }
                  >

                    {inspection.status ||
                      "Pending"}

                  </div>

                </div>


                {/* TITLE */}

                <h3 className="inspection-title">

                  {inspection.title}

                </h3>


                {/* META */}

                <div className="inspection-meta">

                  {inspection.location && (

                    <div>

                      <MapPin
                        size={14}
                      />

                      {inspection.location}

                    </div>

                  )}


                  {inspection.inspector && (

                    <div>

                      <User
                        size={14}
                      />

                      {inspection.inspector}

                    </div>

                  )}


                  {inspection.inspection_date && (

                    <div>

                      <CalendarDays
                        size={14}
                      />

                      {inspection.inspection_date}

                    </div>

                  )}

                </div>


                {/* DOCUMENT */}

                {inspection.document_id && (

                  <div className="inspection-document">

                    <FileText
                      size={14}
                    />

                    <span>

                      {(() => {

                        const document =
                          documents.find(
                            item =>
                              item.id ===
                              inspection.document_id
                          );

                        return (
                          document?.original_filename ||
                          document?.filename ||
                          `Document #${inspection.document_id}`
                        );

                      })()}

                    </span>

                  </div>

                )}


                <div className="inspection-divider" />


                {/* METRICS */}

                <div className="inspection-metrics">

                  <div>

                    <span>
                      Risk
                    </span>

                    <strong
                      className={
                        getRiskClass(
                          inspection.risk_level
                        )
                      }
                    >

                      {inspection.risk_level ||
                        "LOW"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Compliance
                    </span>

                    <strong>

                      {inspection.compliance_score ??
                        0}
                      %

                    </strong>

                  </div>


                  <div>

                    <span>
                      Findings
                    </span>

                    <strong>

                      {inspection.findings_count ??
                        0}

                    </strong>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="inspection-card-actions">

                  <button
                    className="btn btn-secondary"
                    onClick={() => {

                      setAnalysisResult(
                        null
                      );

                      setSelectedInspection(
                        inspection
                      );

                    }}
                  >

                    <Eye
                      size={14}
                    />

                    View

                  </button>


                  <button
                    className="btn btn-primary analyze-btn"
                    onClick={() =>
                      handleAnalyze(
                        inspection
                      )
                    }
                    disabled={
                      analyzingId ===
                      inspection.id
                    }
                  >

                    <Sparkles
                      size={14}
                    />

                    {analyzingId ===
                    inspection.id

                      ? "Analyzing..."

                      : inspection.status
                          ?.toLowerCase() ===
                        "completed"

                        ? "Re-analyze"

                        : "Analyze with AI"}

                  </button>


                  <button
                    className="icon-danger"
                    title="Delete inspection"
                    onClick={() =>
                      handleDelete(
                        inspection
                      )
                    }
                  >

                    <Trash2
                      size={15}
                    />

                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* =================================================
          CREATE INSPECTION MODAL
      ================================================= */}

      {showCreate && (

        <div
          className="modal-overlay"
          onMouseDown={event => {

            if (
              event.target ===
              event.currentTarget
            ) {

              setShowCreate(
                false
              );

            }

          }}
        >

          <div className="modal">

            <div className="modal-header">

              <div>

                <div className="eyebrow">
                  NEW INSPECTION
                </div>

                <h2>
                  Create Inspection
                </h2>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
              >

                <X
                  size={18}
                />

              </button>

            </div>


            <form
              onSubmit={
                handleCreate
              }
            >

              {/* TITLE */}

              <div className="form-group">

                <label>
                  Inspection Title *
                </label>

                <input
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Factory Safety Inspection"
                  required
                />

              </div>


              {/* LOCATION / INSPECTOR */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Location
                  </label>

                  <input
                    name="location"
                    value={
                      form.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Delhi Plant"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Inspector
                  </label>

                  <input
                    name="inspector"
                    value={
                      form.inspector
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Inspector name"
                  />

                </div>

              </div>


              {/* DATE */}

              <div className="form-group">

                <label>
                  Inspection Date
                </label>

                <input
                  type="date"
                  name="inspection_date"
                  value={
                    form.inspection_date
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* DOCUMENT */}

              <div className="form-group">

                <label>
                  Inspection Document *
                </label>


                {readyDocuments.length ===
                0 ? (

                  <div className="document-warning">

                    <FileText
                      size={18}
                    />

                    <div>

                      <strong>
                        No ready PDF documents
                      </strong>

                      <span>
                        Upload and process a
                        PDF from the Documents
                        page first.
                      </span>

                    </div>

                  </div>

                ) : (

                  <div className="document-selector">

                    {readyDocuments.map(
                      document => {

                        const selected =
                          String(
                            form.document_id
                          ) ===
                          String(
                            document.id
                          );


                        return (

                          <button
                            type="button"
                            key={
                              document.id
                            }
                            className={
                              `document-option ${
                                selected
                                  ? "document-option-selected"
                                  : ""
                              }`
                            }
                            onClick={() =>
                              setForm(
                                current => ({
                                  ...current,

                                  document_id:
                                    String(
                                      document.id
                                    ),
                                })
                              )
                            }
                          >

                            <div className="document-option-icon">

                              <FileText
                                size={18}
                              />

                            </div>


                            <div className="document-option-info">

                              <strong>

                                {
                                  document.original_filename ||
                                  document.filename
                                }

                              </strong>

                              <span>

                                {document.pages ??
                                  0}

                                {" "}
                                pages

                                {" • "}

                                {document.chunks ??
                                  0}

                                {" "}
                                chunks

                              </span>

                            </div>


                            <div className="document-option-check">

                              {selected && (

                                <Check
                                  size={16}
                                />

                              )}

                            </div>

                          </button>

                        );

                      }
                    )}

                  </div>

                )}

              </div>


              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowCreate(
                      false
                    )
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    creating ||
                    readyDocuments.length ===
                      0
                  }
                >

                  {creating
                    ? "Creating..."
                    : "Create Inspection"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          INSPECTION DETAILS MODAL
      ================================================= */}

      {selectedInspection && (

        <div
          className="modal-overlay"
          onMouseDown={event => {

            if (
              event.target ===
              event.currentTarget
            ) {

              setSelectedInspection(
                null
              );

            }

          }}
        >

          <div className="modal inspection-detail-modal">

            {/* HEADER */}

            <div className="modal-header">

              <div>

                <div className="eyebrow">

                  INSPECTION #

                  {String(
                    selectedInspection.id
                  ).padStart(
                    3,
                    "0"
                  )}

                </div>

                <h2>

                  {
                    selectedInspection.title
                  }

                </h2>

              </div>


              <button
                className="modal-close"
                onClick={() =>
                  setSelectedInspection(
                    null
                  )
                }
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* STATUS */}

            <div className="inspection-detail-status">

              <div>

                <span>
                  Status : 
                </span>

                <strong
                  className={
                    getStatusClass(
                      selectedInspection.status
                    )
                  }
                >

                  {selectedInspection.status ||
                    "pending"}

                </strong>

              </div>


              <div>

                <span>
                  Risk : 
                </span>

                <strong
                  className={
                    getRiskClass(
                      selectedInspection.risk_level
                    )
                  }
                >

                  {selectedInspection.risk_level ||
                    "LOW"}

                </strong>

              </div>


              <div>

                <span>
                  Compliance : 
                </span>

                <strong>

                  {selectedInspection.compliance_score ??
                    0}
                  %

                </strong>

              </div>

            </div>


            {/* DETAILS */}

            <div className="detail-list">

              <div>

                <span>
                  Location
                </span>

                <strong>

                  {
                    selectedInspection.location ||
                    "Not specified"
                  }

                </strong>

              </div>


              <div>

                <span>
                  Inspector
                </span>

                <strong>

                  {
                    selectedInspection.inspector ||
                    "Not specified"
                  }

                </strong>

              </div>


              <div>

                <span>
                  Inspection Date
                </span>

                <strong>

                  {
                    selectedInspection.inspection_date ||
                    "Not specified"
                  }

                </strong>

              </div>


              <div>

                <span>
                  Attached PDF
                </span>

                <strong>

                  {(() => {

                    const document =
                      documents.find(
                        item =>
                          item.id ===
                          selectedInspection.document_id
                      );

                    return (
                      document?.original_filename ||
                      document?.filename ||
                      (
                        selectedInspection.document_id
                          ? `Document #${selectedInspection.document_id}`
                          : "No document attached"
                      )
                    );

                  })()}

                </strong>

              </div>

            </div>


            {/* FINDINGS */}

            {selectedInspection.findings &&
              selectedInspection.findings.length >
                0 && (

                <div className="inspection-findings">

                  <div className="inspection-section-title">

                    <div>

                      <Sparkles
                        size={15}
                      />

                      AI Findings

                    </div>

                    <span>

                      {
                        selectedInspection.findings.length
                      }

                    </span>

                  </div>


                  <div className="finding-list">

                    {selectedInspection.findings.map(
                      (finding, index) => (

                        <div
                          className="finding-item"
                          key={
                            finding.id ||
                            index
                          }
                        >

                          <div className="finding-icon">

                            {getFindingIcon(
                              finding.severity
                            )}

                          </div>


                          <div className="finding-content">

                            <div className="finding-top">

                              <strong>

                                {
                                  finding.title ||
                                  "Inspection Finding"
                                }

                              </strong>

                              <span
                                className={
                                  `finding-severity ${getRiskClass(
                                    finding.severity
                                  )}`
                                }
                              >

                                {
                                  finding.severity ||
                                  "LOW"
                                }

                              </span>

                            </div>


                            {finding.category && (

                              <div className="finding-category">

                                {
                                  finding.category
                                }

                              </div>

                            )}


                            <p>

                              {
                                finding.description ||
                                "No description provided."
                              }

                            </p>


                            {finding.recommendation && (

                              <div className="finding-recommendation">

                                <strong>
                                  Recommendation:
                                </strong>

                                <span>

                                  {
                                    finding.recommendation
                                  }

                                </span>

                              </div>

                            )}


                            {finding.page_number && (

                              <div className="finding-page">

                                <FileText
                                  size={12}
                                />

                                Page{" "}
                                {
                                  finding.page_number
                                }

                              </div>

                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


            {/* NO FINDINGS */}

            {selectedInspection.status
              ?.toLowerCase() ===
              "completed" &&
              (!selectedInspection.findings ||
                selectedInspection.findings.length ===
                  0) && (

                <div className="no-findings">

                  <CircleCheck
                    size={20}
                  />

                  <div>

                    <strong>
                      No findings returned
                    </strong>

                    <span>
                      The AI analysis did not
                      identify any issues in the
                      analyzed document.
                    </span>

                  </div>

                </div>

              )}


            {/* FOOTER */}

            <div className="modal-actions">

            <button
                className="btn btn-secondary"
                onClick={() =>
                setSelectedInspection(null)
                }
            >
                Close
            </button>


            {selectedInspection.status
                ?.toLowerCase() !== "processing" && (

                <>
                <button
                    className="btn btn-primary"
                    onClick={() =>
                    handleAnalyze(selectedInspection)
                    }
                    disabled={
                    analyzingId ===
                    selectedInspection.id
                    }
                >
                    <Sparkles size={14} />

                    {analyzingId ===
                    selectedInspection.id
                    ? "Analyzing..."
                    : selectedInspection.status
                        ?.toLowerCase() ===
                        "completed"
                        ? "Re-analyze"
                        : "Analyze with AI"}
                </button>


                {/* VIEW AI REPORT */}

                <button
                    className="btn btn-secondary"
                    onClick={() =>
                    window.location.href =
                        `/inspections/${selectedInspection.id}`
                    }
                >
                    View Report
                </button>
                </>

            )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}