import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  MapPin,
  User,
  Calendar,
  Loader2,
  ClipboardCheck,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getInspectionFindings } from "../services/api";

export default function InspectionDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function load() {

      try {

        setLoading(true);
        setError("");

        const result =
          await getInspectionFindings(id);

        setData(result);

      } catch (err) {

        console.error(err);

        setError(
          err.message ||
          "Failed to load inspection"
        );

      } finally {

        setLoading(false);

      }
    }

    load();

  }, [id]);


  if (loading) {

    return (
      <div className="inspection-loading">

        <Loader2
          size={22}
          className="spin"
        />

        <span>
          Loading inspection report...
        </span>

      </div>
    );
  }


  if (error) {

    return (
      <div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/inspections")}
        >
          <ArrowLeft size={14} />
          Back to inspections
        </button>

        <div
          className="card"
          style={{
            marginTop: 18,
            padding: 20,
            color: "#b91c1c",
            background: "#fef2f2",
          }}
        >
          {error}
        </div>

      </div>
    );
  }


  if (!data) {
    return null;
  }


  const inspection =
    data.inspection || {};

  const findings =
    data.findings || [];


  const risk =
    (
      inspection.risk_level ||
      "LOW"
    ).toUpperCase();


  const score =
    inspection.compliance_score ?? 0;


  return (
    <div className="inspection-report">

      {/* HEADER */}

      <div className="inspection-report-header">

        <div>

          <button
            className="back-button"
            onClick={() =>
              navigate("/inspections")
            }
          >
            <ArrowLeft size={15} />
            Back to Inspections
          </button>

          <div className="hero-label">
            AI INSPECTION REPORT
          </div>

          <h1 className="page-title">
            {inspection.title ||
              `Inspection #${inspection.id}`}
          </h1>

          <div className="page-description">
            AI-generated inspection findings
            and compliance assessment.
          </div>

        </div>


        <div className="report-status">

          <span
            className={`status-pill ${
              inspection.status ===
              "completed"
                ? "status-completed"
                : "status-processing"
            }`}
          >

            {inspection.status ===
            "completed" ? (
              <CheckCircle2 size={14} />
            ) : (
              <Loader2 size={14} />
            )}

            {inspection.status || "UNKNOWN"}

          </span>

        </div>

      </div>


      {/* META */}

      <div className="inspection-meta-grid">

        <MetaItem
          icon={MapPin}
          label="Location"
          value={
            inspection.location ||
            "Not specified"
          }
        />

        <MetaItem
          icon={User}
          label="Inspector"
          value={
            inspection.inspector ||
            "Not specified"
          }
        />

        <MetaItem
          icon={Calendar}
          label="Inspection Date"
          value={
            inspection.inspection_date ||
            "Not specified"
          }
        />

        <MetaItem
          icon={FileText}
          label="Document"
          value={
            inspection.document_id
              ? `Document #${inspection.document_id}`
              : "Not attached"
          }
        />

      </div>


      {/* SUMMARY */}

      <div className="inspection-summary-grid">

        <SummaryCard
          label="Compliance Score"
          value={`${score}%`}
          description={
            score >= 80
              ? "Good compliance"
              : score >= 60
              ? "Needs improvement"
              : "Immediate attention required"
          }
          icon={ClipboardCheck}
        />


        <SummaryCard
          label="Risk Level"
          value={risk}
          description="Overall inspection risk"
          icon={
            risk === "CRITICAL" ||
            risk === "HIGH"
              ? ShieldAlert
              : AlertTriangle
          }
          risk={risk}
        />


        <SummaryCard
          label="Total Findings"
          value={findings.length}
          description="AI identified issues"
          icon={AlertTriangle}
        />

      </div>


      {/* FINDINGS */}

      <div className="findings-section">

        <div className="section-heading">

          <div>

            <div className="card-title">
              AI Findings
            </div>

            <div className="card-subtitle">
              Issues identified from the inspection
              document.
            </div>

          </div>

          <div className="finding-count">
            {findings.length} findings
          </div>

        </div>


        {findings.length === 0 ? (

          <div className="card empty-state">

            <div className="empty-icon">
              <CheckCircle2 size={24} />
            </div>

            <strong>
              No findings detected
            </strong>

            <p>
              The AI did not identify any
              inspection issues in the document.
            </p>

          </div>

        ) : (

          <div className="findings-list">

            {findings.map(
              (finding, index) => (

                <FindingCard
                  key={
                    finding.id ||
                    index
                  }
                  finding={finding}
                  index={index}
                />

              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}


/* =====================================================
   META ITEM
===================================================== */

function MetaItem({
  icon: Icon,
  label,
  value,
}) {

  return (
    <div className="report-meta-card">

      <div className="report-meta-icon">
        <Icon size={16} />
      </div>

      <div>

        <div className="report-meta-label">
          {label}
        </div>

        <div className="report-meta-value">
          {value}
        </div>

      </div>

    </div>
  );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  risk,
}) {

  return (
    <div className="card report-summary-card">

      <div className="summary-icon">
        <Icon size={18} />
      </div>

      <div>

        <div className="stat-label">
          {label}
        </div>

        <div
          className={
            risk
              ? `summary-value risk-${risk.toLowerCase()}`
              : "summary-value"
          }
        >
          {value}
        </div>

        <div className="summary-description">
          {description}
        </div>

      </div>

    </div>
  );
}


/* =====================================================
   FINDING CARD
===================================================== */

function FindingCard({
  finding,
  index,
}) {

  const severity =
    (
      finding.severity ||
      "LOW"
    ).toUpperCase();


  const severityClass =
    `severity-${severity.toLowerCase()}`;


  return (
    <div className="finding-card">

      <div className="finding-number">
        {String(index + 1).padStart(2, "0")}
      </div>


      <div className="finding-content">

        <div className="finding-top">

          <div>

            <div className="finding-title">
              {finding.title ||
                "Inspection Finding"}
            </div>

            <div className="finding-category">
              {finding.category ||
                "General Safety"}
            </div>

          </div>


          <span
            className={`severity-badge ${severityClass}`}
          >
            {severity}
          </span>

        </div>


        <div className="finding-description">

          {finding.description ||
            "No description provided."}

        </div>


        {finding.recommendation && (

          <div className="recommendation-box">

            <div className="recommendation-title">
              Recommended Action
            </div>

            <div>
              {finding.recommendation}
            </div>

          </div>

        )}


        <div className="finding-footer">

          {finding.page_number && (

            <span>
              <FileText size={12} />
              Page {finding.page_number}
            </span>

          )}


          {finding.source_document && (

            <span>
              Source:{" "}
              {finding.source_document}
            </span>

          )}


          <span>
            Status:{" "}
            {finding.status || "OPEN"}
          </span>

        </div>

      </div>

    </div>
  );
}