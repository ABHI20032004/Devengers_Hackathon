export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
}) {

  return (
    <div className="stat-card">

      <div className="stat-top">

        <div>

          <div className="stat-label">
            {title}
          </div>

          <div className="stat-value">
            {value}
          </div>

          {description && (
            <div className="stat-change">
              {description}
            </div>
          )}

        </div>


        <div
          className="stat-icon"
          style={{
            background:
              color === "red"
                ? "#fef2f2"
                : color === "green"
                ? "#f0fdf4"
                : color === "orange"
                ? "#fff7ed"
                : "#eff6ff",

            color:
              color === "red"
                ? "#dc2626"
                : color === "green"
                ? "#16a34a"
                : color === "orange"
                ? "#ea580c"
                : "#2563eb",
          }}
        >
          {Icon && <Icon size={19} />}
        </div>

      </div>

    </div>
  );
}