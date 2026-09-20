import {
  FileBarChart,
  FileText,
  Download,
  ClipboardCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

import {  getInspections } from "../services/api";

const API_URL = "http://127.0.0.1:8000";


export default function Reports() {

  const [inspections, setInspections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [downloadingId, setDownloadingId] =
    useState(null);


  useEffect(() => {

    getInspections()
      .then((data) => {

        setInspections(
          data.inspections || []
        );

      })
      .catch((error) => {

        console.error(
          "Failed to load inspections:",
          error
        );

      })
      .finally(() => {

        setLoading(false);

      });

  }, []);


  async function downloadReport(
    inspection
  ) {

    try {

      setDownloadingId(
        inspection.id
      );


      const response = await fetch(
        `${API_URL}/api/reports/${inspection.id}/pdf`
      );


      if (!response.ok) {

        throw new Error(
          "Failed to generate report"
        );

      }


      const blob =
        await response.blob();


      const url =
        window.URL.createObjectURL(
          blob
        );


      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `inspection_${inspection.id}_report.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(
        "Report download failed:",
        error
      );

      alert(
        "Failed to generate inspection report."
      );

    } finally {

      setDownloadingId(null);

    }

  }


  return (
    <div>

      {/* HEADER */}

      <div className="page-header">

        <div>

          <h1 className="page-title">
            Reports
          </h1>

          <p className="page-description">
            Generate professional inspection reports.
          </p>

        </div>

      </div>


      {/* REPORT TYPES */}

      <div className="three-column">

        <ReportType
          icon={FileText}
          title="Inspection Report"
          description="Complete inspection summary"
        />

        <ReportType
          icon={FileBarChart}
          title="Findings Report"
          description="Detailed findings and risks"
        />

        <ReportType
          icon={ClipboardCheck}
          title="Compliance Report"
          description="Compliance assessment"
        />

      </div>


      {/* GENERATED REPORTS */}

      <div
        className="card"
        style={{
          marginTop: 18,
        }}
      >

        <div className="card-padding">

          <div className="card-title">
            Inspection Reports
          </div>

          <div className="card-subtitle">
            Generate reports from completed inspections.
          </div>


          {loading ? (

            <div className="empty-state">
              Loading inspections...
            </div>

          ) : inspections.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <FileBarChart size={23} />
              </div>

              <strong>
                No inspections available
              </strong>

              <p>
                Create and analyze an inspection
                before generating a report.
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
                      Risk
                    </th>

                    <th>
                      Compliance
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {inspections.map(
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
                            "-"
                          }
                        </td>


                        <td>

                          <span
                            className={`risk-badge ${
                              (
                                inspection.risk_level ||
                                "LOW"
                              ).toLowerCase()
                            }`}
                          >
                            {
                              inspection.risk_level ||
                              "LOW"
                            }
                          </span>

                        </td>


                        <td>

                          <strong>
                            {
                              inspection.compliance_score ??
                              0
                            }%
                          </strong>

                        </td>


                        <td>

                          <span className="badge badge-green">
                            ●{" "}
                            {
                              inspection.status ||
                              "pending"
                            }
                          </span>

                        </td>


                        <td>

                          <button
                            className="btn btn-secondary"
                            onClick={() =>
                              downloadReport(
                                inspection
                              )
                            }
                            disabled={
                              downloadingId ===
                              inspection.id
                            }
                          >

                            <Download
                              size={13}
                            />

                            {downloadingId ===
                            inspection.id
                              ? "Generating..."
                              : "Download"}

                          </button>

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


/* ---------------------------------------
   REPORT TYPE CARD
---------------------------------------- */

function ReportType({
  icon: Icon,
  title,
  description,
}) {

  return (

    <div className="card card-padding">

      <div className="empty-icon">

        <Icon size={20} />

      </div>


      <div className="card-title">

        {title}

      </div>


      <div className="card-subtitle">

        {description}

      </div>

    </div>

  );

}