import {
  FileText,
  Trash2,
  MessageSquare,
} from "lucide-react";

export default function DocumentCard({
  document,
  onDelete,
  onChat,
}) {

  return (
    <div className="card card-padding">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
        }}
      >

        <div
          style={{
            display: "flex",
            gap: 11,
            minWidth: 0,
          }}
        >

          <div
            style={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: 10,
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={19} />
          </div>


          <div style={{ minWidth: 0 }}>

            <div
              style={{
                fontWeight: 700,
                fontSize: 12,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={document.filename}
            >
              {document.filename}
            </div>

            <div
              style={{
                color: "#94a3b8",
                fontSize: 10,
                marginTop: 4,
              }}
            >
              Document #{document.id}
            </div>

          </div>

        </div>


        <span
          className={`badge ${
            document.status === "ready"
              ? "badge-green"
              : document.status === "failed"
              ? "badge-red"
              : "badge-yellow"
          }`}
        >
          {document.status}
        </span>

      </div>


      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginTop: 18,
        }}
      >

        <div
          style={{
            background: "#f8fafc",
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div className="stat-label">
            Pages
          </div>

          <strong>
            {document.pages || 0}
          </strong>
        </div>


        <div
          style={{
            background: "#f8fafc",
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div className="stat-label">
            AI Chunks
          </div>

          <strong>
            {document.chunks || 0}
          </strong>
        </div>

      </div>


      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 15,
        }}
      >

        <button
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={() => onChat?.(document)}
        >
          <MessageSquare size={13} />
          Ask AI
        </button>


        <button
          className="btn btn-danger"
          onClick={() =>
            onDelete?.(document)
          }
        >
          <Trash2 size={13} />
        </button>

      </div>

    </div>
  );
}