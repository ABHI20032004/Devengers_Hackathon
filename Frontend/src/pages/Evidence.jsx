import {
  FileText,
  Image,
  File,
  Upload,
  Trash2,
  Search,
  RefreshCw,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  createEvidence,
  deleteEvidence,
} from "../services/api";

const API_URL = "http://127.0.0.1:8000";


export default function Evidence() {

  const [evidence, setEvidence] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [findingId, setFindingId] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [description, setDescription] =
    useState("");

  const [search, setSearch] =
    useState("");


  // =====================================================
  // LOAD ALL EVIDENCE
  // =====================================================

  async function loadEvidence() {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/evidence/`
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to load evidence"
        );

      }

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

      setLoading(false);

    }

  }


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {

    loadEvidence();

  }, []);


  // =====================================================
  // UPLOAD
  // =====================================================

  async function handleUpload() {

    if (!findingId) {

      alert(
        "Please enter a Finding ID."
      );

      return;

    }


    if (!file) {

      alert(
        "Please select a file."
      );

      return;

    }


    try {

      setUploading(true);


      const result =
        await createEvidence(
          Number(findingId),
          file,
          description
        );


      console.log(
        "Evidence uploaded:",
        result
      );


      // Reset form

      setFindingId("");

      setFile(null);

      setDescription("");


      const fileInput =
        document.getElementById(
          "evidence-file"
        );


      if (fileInput) {

        fileInput.value = "";

      }


      // Refresh list

      await loadEvidence();


      alert(
        "Evidence uploaded successfully."
      );


    } catch (error) {

      console.error(
        "Evidence upload failed:",
        error
      );


      alert(
        error.message ||
        "Evidence upload failed"
      );


    } finally {

      setUploading(false);

    }

  }


  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(
    evidenceId
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this evidence?"
      );


    if (!confirmed) {

      return;

    }


    try {

      await deleteEvidence(
        evidenceId
      );


      setEvidence(
        (current) =>
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


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredEvidence =
    evidence.filter(
      (item) => {

        const searchableText = [

          item.file_path,

          item.file_type,

          item.description,

          item.finding_id,

          item.inspection_id,

        ]
          .join(" ")
          .toLowerCase();


        return searchableText.includes(
          search.toLowerCase()
        );

      }
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div>


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <h1 className="page-title">
            Evidence
          </h1>

          <p className="page-description">
            Manage inspection evidence and
            supporting documents.
          </p>

        </div>


        <button
          className="btn btn-secondary"
          onClick={loadEvidence}
          disabled={loading}
        >

          <RefreshCw size={14} />

          Refresh

        </button>

      </div>


      {/* =================================================
          UPLOAD CARD
      ================================================= */}

      <div className="card card-padding">

        <div className="card-title">
          Upload Evidence
        </div>


        <div className="card-subtitle">

          Attach supporting evidence
          to an inspection finding.

        </div>


        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 18,
          }}
        >


          {/* FINDING ID */}

          <div className="form-group">

            <label>
              Finding ID
            </label>

            <input
              type="number"
              placeholder="Enter finding ID"
              value={findingId}
              onChange={(event) =>
                setFindingId(
                  event.target.value
                )
              }
            />

          </div>


          {/* FILE */}

          <div className="form-group">

            <label>
              Evidence File
            </label>


            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >

              <label
                htmlFor="evidence-file"
                className="btn btn-secondary"
                style={{
                  cursor: "pointer",
                }}
              >

                <Upload size={14} />

                Select File

              </label>


              <input
                id="evidence-file"
                type="file"
                accept="
                  image/*
                  ,.pdf
                  ,.doc
                  ,.docx
                "
                style={{
                  display: "none",
                }}
                onChange={(event) =>
                  setFile(
                    event.target.files?.[0] ||
                    null
                  )
                }
              />


              {file && (

                <span
                  style={{
                    fontSize: 13,
                  }}
                >
                  {file.name}
                </span>

              )}

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>


            <textarea
              rows={3}
              placeholder="Describe this evidence..."
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            />

          </div>


          {/* UPLOAD BUTTON */}

          <div>

            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={
                uploading ||
                !file ||
                !findingId
              }
            >

              <Upload size={14} />

              {uploading
                ? "Uploading..."
                : "Upload Evidence"}

            </button>

          </div>


        </div>

      </div>


      {/* =================================================
          EVIDENCE LIBRARY
      ================================================= */}

      <div
        className="card"
        style={{
          marginTop: 18,
        }}
      >


        <div className="card-padding">


          <div className="card-title">
            Evidence Library
          </div>


          <div className="card-subtitle">

            All evidence uploaded to
            inspection findings.

          </div>


          {/* SEARCH */}

          <div
            style={{
              position: "relative",
              marginTop: 16,
            }}
          >

            <Search
              size={15}
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform:
                  "translateY(-50%)",
              }}
            />


            <input
              type="text"
              placeholder="Search evidence..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              style={{
                paddingLeft: 34,
                width: "100%",
              }}
            />

          </div>


        </div>


        {/* LOADING */}

        {loading && (

          <div className="empty-state">

            <RefreshCw
              size={20}
            />

            <strong>
              Loading evidence...
            </strong>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          filteredEvidence.length === 0 && (

            <div className="empty-state">

              <div className="empty-icon">

                <FileText size={22} />

              </div>


              <strong>
                No evidence found
              </strong>


              <p>

                Upload evidence to
                get started.

              </p>

            </div>

          )}


        {/* LIST */}

        {!loading &&
          filteredEvidence.length > 0 && (

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >

              {filteredEvidence.map(
                (item) => (

                  <EvidenceRow
                    key={item.id}
                    item={item}
                    onDelete={
                      handleDelete
                    }
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
   EVIDENCE ROW
===================================================== */

function EvidenceRow({
  item,
  onDelete,
}) {


  const isImage =
    item.file_type?.startsWith(
      "image/"
    );


  const isPDF =
    item.file_type ===
    "application/pdf";


  const filename =
    item.file_path
      ?.split("\\")
      .pop()
      ?.split("/")
      .pop() ||
    "Evidence";


  return (

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 20px",
        borderTop:
          "1px solid #eee",
      }}
    >


      {/* ICON */}

      <div
        className="empty-icon"
        style={{
          width: 38,
          height: 38,
          flexShrink: 0,
        }}
      >

        {isImage ? (

          <Image size={28} />

        ) : isPDF ? (

          <FileText size={28} />

        ) : (

          <File size={28} />

        )}

      </div>


      {/* INFO */}

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >

        <strong
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
          }}
        >
          {filename}
        </strong>


        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 4,
            fontSize: 12,
            opacity: 0.7,
          }}
        >

          <span>
            Finding #{item.finding_id}
          </span>


          {item.inspection_id && (

            <span>
              Inspection #
              {item.inspection_id}
            </span>

          )}


          <span>
            {item.file_type ||
              "Unknown type"}
          </span>

        </div>


        {item.description && (

          <p
            style={{
              margin:
                "6px 0 0",
              fontSize: 13,
            }}
          >
            {item.description}
          </p>

        )}

      </div>


      {/* DELETE */}

      <div
  style={{
    display: "flex",
    gap: 8,
    flexShrink: 0,
  }}
>

  <button
    className="btn btn-secondary"
    onClick={() => {

      window.open(
        `${API_URL}/api/evidence/file/${item.id}`,
        "_blank",
        "noopener,noreferrer"
      );

    }}
  >

    View

  </button>


  <button
    className="btn btn-secondary"
    onClick={() =>
      onDelete(item.id)
    }
    title="Delete evidence"
  >

    <Trash2 size={14} />

  </button>

</div>

    </div>

  );

}

function handleView(item) {

  const url =
    `${API_URL}/api/evidence/file/${item.id}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}