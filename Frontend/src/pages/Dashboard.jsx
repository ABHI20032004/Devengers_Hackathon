import {
  FileText,
  ClipboardCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import StatCard from "../components/StatCard";
import RiskBadge from "../components/RiskBadge";

import {
  getDocuments,
  getInspections,
  getDashboardStats,
} from "../services/api";


export default function Dashboard() {

  const [documents, setDocuments] =
    useState([]);

  const [inspections, setInspections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

    const [dashboardStats, setDashboardStats] =
  useState({
    open_findings: 0,
    critical_risks: 0,
    corrective_actions: 0,
    open_actions: 0,
    in_progress_actions: 0,
    resolved_actions: 0,
  });

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  async function loadDashboard() {

    try {

      setLoading(true);

const [
  documentData,
  inspectionData,
  statsData,
] = await Promise.all([

  getDocuments(),

  getInspections(),

  getDashboardStats(),

]);


setDocuments(
  documentData.documents || []
);

setInspections(
  inspectionData.inspections || []
);

setDashboardStats(
  statsData || {}
);

setInspections(
  inspectionData.inspections || []
);

setDashboardStats(
  statsData || {}
);

    } catch (error) {

      console.error(
        "Dashboard loading error:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadDashboard();

  }, []);


  // =====================================================
  // DOCUMENT METRICS
  // =====================================================

  const pages =
    documents.reduce(
      (sum, item) =>
        sum + (item.pages || 0),
      0
    );


  const chunks =
    documents.reduce(
      (sum, item) =>
        sum + (item.chunks || 0),
      0
    );


  // =====================================================
  // INSPECTION METRICS
  // =====================================================

  const completedInspections =
    inspections.filter(
      (item) =>
        item.status?.toLowerCase() ===
        "completed"
    );


  const processingInspections =
    inspections.filter(
      (item) => {

        const status =
          item.status?.toLowerCase();

        return (
          status === "processing" ||
          status === "in progress"
        );

      }
    );


  const pendingInspections =
    inspections.filter(
      (item) =>
        item.status?.toLowerCase() ===
        "pending"
    );


  const highRiskInspections =
    inspections.filter(
      (item) => {

        const risk =
          item.risk_level?.toUpperCase();

        return (
          risk === "HIGH" ||
          risk === "CRITICAL"
        );

      }
    );


  // =====================================================
  // COMPLIANCE
  // =====================================================

  const complianceScores =
    completedInspections
      .map(
        item =>
          Number(
            item.compliance_score
          ) || 0
      );


  const averageCompliance =
    complianceScores.length > 0

      ? Math.round(
          complianceScores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) /
          complianceScores.length
        )

      : 0;


  return (

    <div>


      {/* =================================================
          HERO
      ================================================= */}

      <div className="hero">

        <div className="hero-label">
          OFFLINE INDUSTRIAL INSPECTION INTELLIGENCE
        </div>


        <div className="hero-title">

          Inspection intelligence,
          <br />

          running entirely on your system.

        </div>


        <div className="hero-description">

          InspectAI combines local AI,
          document intelligence and inspection
          workflows to help teams identify risks,
          analyze evidence and manage corrective
          actions without sending sensitive data
          to the cloud.

        </div>

      </div>


      {/* =================================================
          MAIN STATS
      ================================================= */}

      <div className="stats-grid">


        <StatCard
          title="Documents"
          value={
            loading
              ? "..."
              : documents.length
          }
          description="Indexed locally"
          icon={FileText}
        />


        <StatCard
          title="Inspections"
          value={
            loading
              ? "..."
              : inspections.length
          }
          description={
            pendingInspections.length > 0
              ? `${pendingInspections.length} pending`
              : "Inspection records"
          }
          icon={ClipboardCheck}
        />


        <StatCard
  title="Open Findings"
  value={
    loading
      ? "..."
      : dashboardStats.open_findings
  }
  description={
    dashboardStats.open_findings > 0
      ? "Requires attention"
      : "No open findings"
  }
  icon={AlertTriangle}
  color="orange"
/>


        {/* <StatCard
  title="Critical Risks"
  value={
    loading
      ? "..."
      : dashboardStats.critical_risks
  }
  description={
    dashboardStats.critical_risks > 0
      ? "Requires attention"
      : "No critical risks"
  }
  icon={ShieldAlert}
  color="red"
/> */}

<StatCard
  title="Corrective Actions"
  value={
    loading
      ? "..."
      : dashboardStats.open_actions
  }
  description={
    dashboardStats.open_actions > 0
      ? `${dashboardStats.open_actions} open`
      : "No pending actions"
  }
  icon={ClipboardCheck}
/>

      </div>


      {/* =================================================
          INSPECTION OVERVIEW
      ================================================= */}

      <div
        className="card"
        style={{
          marginTop: 18,
        }}
      >

        <div className="card-padding">


          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            <div>

              <div className="card-title">
                Inspection Overview
              </div>

              <div className="card-subtitle">
                Current inspection activity
              </div>

            </div>


            <ClipboardCheck
              size={18}
              color="#2563eb"
            />

          </div>


          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: 15,
            }}
          >

            <Metric
              label="Total"
              value={
                loading
                  ? "..."
                  : inspections.length
              }
            />


            <Metric
              label="Completed"
              value={
                loading
                  ? "..."
                  : completedInspections.length
              }
            />


            <Metric
              label="Processing"
              value={
                loading
                  ? "..."
                  : processingInspections.length
              }
            />


            <Metric
              label="Avg. Compliance"
              value={
                loading
                  ? "..."
                  : `${averageCompliance}%`
              }
            />

          </div>


          {/* STATUS BAR */}

          {!loading &&
            inspections.length > 0 && (

            <div
              style={{
                marginTop: 22,
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
          
              }}
            >

              <StatusItem
                icon={CheckCircle2}
                label="Completed"
                value={
                  completedInspections.length
                }
              />


              <StatusItem
                icon={Clock3}
                label="Pending"
                value={
                  pendingInspections.length
                }
              />


              <StatusItem
                icon={AlertTriangle}
                label="High Risk"
                value={
                  highRiskInspections.length
                }
              />

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          TWO COLUMNS
      ================================================= */}

      <div className="two-column">


        {/* KNOWLEDGE BASE */}

        <div className="card">

          <div className="card-padding">

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >

              <div>

                <div className="card-title">
                  Knowledge Base
                </div>

                <div className="card-subtitle">
                  Local document intelligence
                </div>

              </div>


              <FileText
                size={18}
                color="#2563eb"
              />

            </div>


            <div
              style={{
                marginTop: 25,
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, 1fr)",
                gap: 15,
              }}
            >

              <Metric
                label="Indexed Pages"
                value={pages}
              />

              <Metric
                label="AI Chunks"
                value={chunks}
              />

            </div>

          </div>

        </div>


        {/* SYSTEM STATUS */}

        <div className="card">

          <div className="card-padding">

            <div className="card-title">
              System Status
            </div>

            <div className="card-subtitle">
              Local services
            </div>


            <div
              style={{
                marginTop: 18,
                display: "grid",
                gap: 10,
              }}
            >

              <System
                name="FastAPI"
                status="Online"
              />

              <System
                name="SQLite"
                status="Connected"
              />

              <System
                name="ChromaDB"
                status="Connected"
              />

              <System
                name="Ollama"
                status="Online"
              />

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          RECENT INSPECTIONS
      ================================================= */}

      <div
        className="card"
        style={{
          marginTop: 18,
        }}
      >

        <div className="card-padding">


          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >

            <div>

              <div className="card-title">
                Recent Inspections
              </div>

              <div className="card-subtitle">
                Latest inspection activity
              </div>

            </div>


            <a
              href="/inspections"
              style={{
                color: "#2563eb",
                fontSize: 11,
                fontWeight: 600,
                textDecoration:
                  "none",
                display: "flex",
                alignItems:
                  "center",
                gap: 4,
              }}
            >

              View all

              <ArrowRight
                size={12}
              />

            </a>

          </div>


          {loading ? (

            <div className="empty-state">
              Loading inspections...
            </div>


          ) : inspections.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">

                <ClipboardCheck
                  size={22}
                />

              </div>


              <strong>
                No inspections yet
              </strong>


              <p>
                Create your first inspection
                to begin analysis.
              </p>

            </div>


          ) : (

            <div className="table-wrapper">

              <table className="data-table">

                <thead>

                  <tr>

                    <th>
                      Inspection
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Risk
                    </th>

                    <th>
                      Compliance
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {inspections
                    .slice(0, 5)
                    .map(
                      (inspection) => (

                        <tr
                          key={
                            inspection.id
                          }
                        >

                          <td>

                            <strong>
                              {
                                inspection.title
                              }
                            </strong>

                          </td>


                          <td>

                            {
                              inspection.location ||
                              "—"
                            }

                          </td>


                          <td>

                            <span
                              className={
                                "badge " +
                                (
                                  inspection.status
                                    ?.toLowerCase() ===
                                  "completed"

                                    ? "badge-green"

                                    : inspection.status
                                        ?.toLowerCase() ===
                                      "failed"

                                    ? "badge-red"

                                    : "badge-yellow"
                                )
                              }
                            >

                              ●{" "}

                              {
                                inspection.status ||
                                "Pending"
                              }

                            </span>

                          </td>


                          <td>

                            <RiskBadge
                              level={
                                inspection.risk_level ||
                                "LOW"
                              }
                            />

                          </td>


                          <td>

                            {
                              inspection.compliance_score ??
                              0
                            }%

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          RECENT DOCUMENTS
      ================================================= */}

      <div
        className="card"
        style={{
          marginTop: 18,
        }}
      >

        <div className="card-padding">

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >

            <div>

              <div className="card-title">
                Recent Documents
              </div>

              <div className="card-subtitle">
                Latest indexed inspection documents
              </div>

            </div>


            <a
              href="/documents"
              style={{
                color: "#2563eb",
                fontSize: 11,
                fontWeight: 600,
                textDecoration:
                  "none",
                display: "flex",
                alignItems:
                  "center",
                gap: 4,
              }}
            >

              View all

              <ArrowRight
                size={12}
              />

            </a>

          </div>


          {loading ? (

            <div className="empty-state">
              Loading documents...
            </div>


          ) : documents.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">

                <FileText
                  size={22}
                />

              </div>


              <strong>
                No inspection documents
              </strong>


              <p>
                Upload your first PDF to start.
              </p>

            </div>


          ) : (

            <div className="table-wrapper">

              <table className="data-table">

                <thead>

                  <tr>

                    <th>
                      Document
                    </th>

                    <th>
                      Pages
                    </th>

                    <th>
                      Chunks
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {documents
                    .slice(0, 5)
                    .map(
                      (doc) => (

                        <tr
                          key={
                            doc.id
                          }
                        >

                          <td>

                            <strong>
                              {
                                doc.filename
                              }
                            </strong>

                          </td>


                          <td>
                            {doc.pages || 0}
                          </td>


                          <td>
                            {doc.chunks || 0}
                          </td>


                          <td>

                            <RiskBadge
                              level={
                                doc.status ===
                                "ready"
                                  ? "LOW"
                                  : "MEDIUM"
                              }
                            />

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   METRIC
========================================================= */

function Metric({
  label,
  value,
}) {

  return (

    <div>

      <div className="stat-label">
        {label}
      </div>

      <div
        style={{
          fontSize: 23,
          fontWeight: 800,
          marginTop: 5,
        }}
      >
        {value}
      </div>

    </div>
  );
}


/* =========================================================
   STATUS ITEM
========================================================= */

function StatusItem({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
      }}
    >

      <Icon
        size={14}
        color="#64748b"
      />

      <span
        style={{
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   SYSTEM
========================================================= */

function System({
  name,
  status,
}) {

  return (

    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        padding: "9px 0",
        borderBottom:
          "1px solid #f1f5f9",
      }}
    >

      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {name}
      </span>


      <span className="badge badge-green">

        ● {status}

      </span>

    </div>
  );
}