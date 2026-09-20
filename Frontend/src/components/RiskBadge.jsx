export default function RiskBadge({
  level = "LOW",
}) {

  const normalized =
    String(level).toUpperCase();

  let className = "badge-gray";

  if (normalized === "LOW") {
    className = "badge-green";
  }

  if (normalized === "MEDIUM") {
    className = "badge-yellow";
  }

  if (
    normalized === "HIGH" ||
    normalized === "CRITICAL"
  ) {
    className = "badge-red";
  }

  return (
    <span className={`badge ${className}`}>
      {normalized}
    </span>
  );
}