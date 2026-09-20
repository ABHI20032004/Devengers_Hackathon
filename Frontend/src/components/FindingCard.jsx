import RiskBadge from "./RiskBadge";

export default function FindingCard({
  finding,
}) {

  return (
    <div className="card card-padding">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
        }}
      >

        <div>
          <div className="card-title">
            {finding.title}
          </div>

          <div className="card-subtitle">
            {finding.category}
          </div>
        </div>

        <RiskBadge
          level={finding.severity}
        />

      </div>


      <p
        style={{
          fontSize: 12,
          lineHeight: 1.6,
          color: "#64748b",
        }}
      >
        {finding.description}
      </p>


      <div
        style={{
          marginTop: 12,
          padding: 10,
          borderRadius: 8,
          background: "#f8fafc",
          fontSize: 11,
        }}
      >
        <strong>
          Recommendation
        </strong>

        <div
          style={{
            color: "#64748b",
            marginTop: 4,
          }}
        >
          {finding.recommendation}
        </div>
      </div>

    </div>
  );
}