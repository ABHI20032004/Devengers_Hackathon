import {
  Upload,
  FileText,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock3,
  Database,
  AlertCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import DocumentCard from "../components/DocumentCard";

import {
  getDocuments,
  uploadDocuments,
  deleteDocument,
} from "../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [dragActive, setDragActive] =
    useState(false);

  const inputRef =
    useRef(null);


  // =====================================================
  // LOAD DOCUMENTS
  // =====================================================

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");

      const data = await getDocuments();

      setDocuments(
        data.documents || []
      );

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Unable to load documents."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadDocuments();
  }, []);


  // =====================================================
  // UPLOAD DOCUMENTS
  // =====================================================

  async function processFiles(files) {
    const selectedFiles =
      Array.from(files || []);

    if (!selectedFiles.length) {
      return;
    }


    const pdfs =
      selectedFiles.filter((file) =>
        file.name
          .toLowerCase()
          .endsWith(".pdf")
      );


    if (!pdfs.length) {
      setError(
        "Only PDF files are supported."
      );

      return;
    }


    try {
      setUploading(true);
      setError("");

      const results =
        await uploadDocuments(pdfs);


      const failed =
        results.filter(
          (item) =>
            !item.success
        );


      if (failed.length) {
        setError(
          failed
            .map(
              (item) =>
                `${item.file}: ${item.error}`
            )
            .join("\n")
        );
      }


      await loadDocuments();

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Document upload failed."
      );

    } finally {
      setUploading(false);
    }
  }


  async function handleUpload(event) {
    await processFiles(
      event.target.files
    );

    event.target.value = "";
  }


  // =====================================================
  // DRAG AND DROP
  // =====================================================

  function handleDragOver(event) {
    event.preventDefault();

    if (!uploading) {
      setDragActive(true);
    }
  }


  function handleDragLeave(event) {
    event.preventDefault();

    setDragActive(false);
  }


  async function handleDrop(event) {
    event.preventDefault();

    setDragActive(false);

    if (uploading) {
      return;
    }

    await processFiles(
      event.dataTransfer.files
    );
  }


  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(document) {
    const yes =
      window.confirm(
        `Delete ${document.filename}?`
      );

    if (!yes) {
      return;
    }


    try {
      setError("");

      await deleteDocument(
        document.id
      );


      setDocuments(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              document.id
          )
      );

    } catch (error) {
      console.error(error);

      setError(
        error.message ||
        "Unable to delete document."
      );
    }
  }


  // =====================================================
  // SEARCH
  // =====================================================

  const filteredDocuments =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase();


      if (!value) {
        return documents;
      }


      return documents.filter(
        (document) => {

          const name =
            document.original_filename ||
            document.filename ||
            "";

          return name
            .toLowerCase()
            .includes(value);
        }
      );

    }, [documents, search]);


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalDocuments =
    documents.length;


  const readyDocuments =
    documents.filter(
      (document) =>
        document.status === "ready"
    ).length;


  const processingDocuments =
    documents.filter(
      (document) =>
        document.status === "processing"
    ).length;


  const totalPages =
    documents.reduce(
      (total, document) =>
        total +
        (document.pages || 0),
      0
    );


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="documents-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <div
            style={{
              color: "#2563eb",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1.4,
              marginBottom: 6,
            }}
          >
            KNOWLEDGE BASE
          </div>


          <h1 className="page-title">
            Documents
          </h1>


          <div className="color-gray-600 font-medium">
            Upload, index and manage inspection
            knowledge for your local AI copilot.
          </div>

        </div>


        <div className="actions">

          <button
            className="btn btn-secondary"
            onClick={loadDocuments}
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


          <button
            className="btn btn-primary"
            onClick={() =>
              inputRef.current?.click()
            }
            disabled={uploading}
          >
            <Upload size={14} />

            {uploading
              ? "Processing..."
              : "Upload PDFs"}
          </button>

        </div>


        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".pdf"
          multiple
          onChange={handleUpload}
        />

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="documents-error"
        >

          <AlertCircle
            size={17}
          />

          <div>
            {error}
          </div>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="document-stat-grid">

        <div className="document-stat-card">

          <div className="document-stat-icon blue">
            <FileText size={18} />
          </div>

          <div>

            <div className="document-stat-label">
              TOTAL DOCUMENTS
            </div>

            <div className="document-stat-value">
              {totalDocuments}
            </div>

          </div>

        </div>


        <div className="document-stat-card">

          <div className="document-stat-icon green">
            <CheckCircle2 size={18} />
          </div>

          <div>

            <div className="document-stat-label">
              READY
            </div>

            <div className="document-stat-value">
              {readyDocuments}
            </div>

          </div>

        </div>


        <div className="document-stat-card">

          <div className="document-stat-icon amber">
            <Clock3 size={18} />
          </div>

          <div>

            <div className="document-stat-label">
              PROCESSING
            </div>

            <div className="document-stat-value">
              {processingDocuments}
            </div>

          </div>

        </div>


        <div className="document-stat-card">

          <div className="document-stat-icon purple">
            <Database size={18} />
          </div>

          <div>

            <div className="document-stat-label">
              INDEXED PAGES
            </div>

            <div className="document-stat-value">
              {totalPages}
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          UPLOAD AREA
      ================================================= */}

      <div className="card documents-upload-card">

        <div
          className={`documents-upload-zone ${
            dragActive
              ? "drag-active"
              : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            inputRef.current?.click()
          }
        >

          <div className="documents-upload-icon">
            <Upload size={23} />
          </div>


          <div>

            <strong>
              {uploading
                ? "Processing documents..."
                : "Drop inspection PDFs here"}
            </strong>


            <div className="documents-upload-description">
              Drag and drop multiple PDF files
              or click to browse.
            </div>


            <div className="documents-upload-meta">
              PDF only • Local processing •
              Offline AI
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          DOCUMENT LIBRARY HEADER
      ================================================= */}

      <div className="documents-library-header">

        <div>

          <h2>
            Document Library
          </h2>

          <span>
            {filteredDocuments.length}
            {" "}
            document
            {filteredDocuments.length !== 1
              ? "s"
              : ""}
          </span>

        </div>


        <div className="documents-search">

          <Search size={15} />

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

      </div>


      {/* =================================================
          DOCUMENTS
      ================================================= */}

      {loading ? (

        <div className="card empty-state">

          <RefreshCw
            size={22}
            className="spin"
          />

          <strong>
            Loading documents...
          </strong>

          <p>
            Reading your local document library.
          </p>

        </div>

      ) : filteredDocuments.length === 0 ? (

        <div className="card empty-state">

          <div className="empty-icon">
            <FileText size={22} />
          </div>


          <strong>
            {documents.length === 0
              ? "No documents indexed"
              : "No matching documents"}
          </strong>


          <p>
            {documents.length === 0
              ? "Upload an inspection PDF to build your local knowledge base."
              : "Try a different document name."}
          </p>


          {documents.length === 0 && (

            <button
              className="btn btn-primary"
              onClick={() =>
                inputRef.current?.click()
              }
            >
              <Upload size={14} />
              Upload PDF
            </button>

          )}

        </div>

      ) : (

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 15,
          }}
        >

          {filteredDocuments.map(
            (document) => (

              <DocumentCard
                key={document.id}
                document={document}
                onDelete={handleDelete}
                onChat={() =>
                  window.location.href =
                    "/copilot"
                }
              />

            )
          )}

        </div>

      )}

    </div>
  );
}