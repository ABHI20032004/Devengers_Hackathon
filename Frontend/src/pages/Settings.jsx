import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  ShieldCheck,
} from "lucide-react";

export default function Settings() {

  return (
    <div>

      <div className="page-header">

        <div>

          <h1 className="page-title">
            Settings
          </h1>

          <p className="page-description">
            Configure your local InspectAI environment.
          </p>

        </div>

      </div>


      <div
        style={{
          display: "grid",
          gap: 15,
        }}
      >

        <Section
          icon={Cpu}
          title="AI Engine"
          description="Local Ollama configuration"
        >

          <Row
            label="AI Runtime"
            value="Ollama"
          />

          <Row
            label="Embedding Model"
            value="nomic-embed-text"
          />

          <Row
            label="Processing"
            value="Local / Offline"
          />

        </Section>


        <Section
          icon={Database}
          title="Data Storage"
          description="Local application storage"
        >

          <Row
            label="Database"
            value="SQLite"
          />

          <Row
            label="Vector Database"
            value="ChromaDB"
          />

          <Row
            label="Storage"
            value="Local filesystem"
          />

        </Section>


        <Section
          icon={ShieldCheck}
          title="Privacy"
          description="Data processing configuration"
        >

          <Row
            label="Cloud AI"
            value="Disabled"
          />

          <Row
            label="Document Upload"
            value="Local"
          />

          <Row
            label="External Processing"
            value="Disabled"
          />

        </Section>

      </div>

    </div>
  );
}


function Section({
  icon: Icon,
  title,
  description,
  children,
}) {

  return (
    <div className="card">

      <div
        className="card-padding"
        style={{
          display: "flex",
          gap: 12,
          borderBottom:
            "1px solid #f1f5f9",
        }}
      >

        <div className="empty-icon">
          <Icon size={19} />
        </div>

        <div>

          <div className="card-title">
            {title}
          </div>

          <div className="card-subtitle">
            {description}
          </div>

        </div>

      </div>


      <div className="card-padding">

        {children}

      </div>

    </div>
  );
}


function Row({
  label,
  value,
}) {

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "11px 0",
        borderBottom:
          "1px solid #f1f5f9",
        fontSize: 12,
      }}
    >

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