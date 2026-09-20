import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  ClipboardCheck,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Activity,
} from "lucide-react";

export default function Analytics() {
  // Demo analytics data.
  // Later these values can come from /api/dashboard or a dedicated
  // /api/analytics endpoint.
  const monthlyInspections = [
    { month: "Apr", value: 18 },
    { month: "May", value: 24 },
    { month: "Jun", value: 21 },
    { month: "Jul", value: 29 },
    { month: "Aug", value: 34 },
    { month: "Sep", value: 31 },
  ];

  const riskData = [
    { label: "Critical", value: 8, className: "risk-critical" },
    { label: "High", value: 17, className: "risk-high" },
    { label: "Medium", value: 29, className: "risk-medium" },
    { label: "Low", value: 46, className: "risk-low" },
  ];

  const findingData = [
    { label: "Safety", value: 32 },
    { label: "Equipment", value: 24 },
    { label: "Process", value: 18 },
    { label: "Compliance", value: 15 },
    { label: "Environment", value: 11 },
  ];

  const actionData = [
    {
      label: "Completed",
      value: 54,
      icon: CheckCircle2,
      className: "analytics-success",
    },
    {
      label: "In Progress",
      value: 27,
      icon: Activity,
      className: "analytics-warning",
    },
    {
      label: "Overdue",
      value: 19,
      icon: CircleAlert,
      className: "analytics-danger",
    },
  ];

  return (
    <div className="analytics-page">

      {/* PAGE HEADER */}
      <div className="analytics-heading">
        <div>
          <h2>Inspection Analytics</h2>
          <p>
            Operational intelligence from inspections, findings and
            corrective actions.
          </p>
        </div>

        <div className="analytics-period">
          <BarChart3 size={16} />
          Last 6 Months
        </div>
      </div>


      {/* KPI CARDS */}
      <div className="analytics-kpis">

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-top">
            <div className="analytics-icon">
              <ClipboardCheck size={19} />
            </div>

            <span className="analytics-positive">
              <TrendingUp size={13} />
              12.4%
            </span>
          </div>

          <div className="analytics-kpi-value">157</div>

          <div className="analytics-kpi-label">
            Total Inspections
          </div>

          <div className="analytics-kpi-foot">
            Compared with previous period
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="analytics-kpi-top">
            <div className="analytics-icon analytics-icon-danger">
              <AlertTriangle size={19} />
            </div>

            <span className="analytics-negative">
              <TrendingDown size={13} />
              8.2%
            </span>
          </div>

          <div className="analytics-kpi-value">100</div>

          <div className="analytics-kpi-label">
            Open Findings
          </div>

          <div className="analytics-kpi-foot">
            Across active inspections
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="analytics-kpi-top">
            <div className="analytics-icon analytics-icon-success">
              <ShieldCheck size={19} />
            </div>

            <span className="analytics-positive">
              <TrendingUp size={13} />
              4.8%
            </span>
          </div>

          <div className="analytics-kpi-value">91.6%</div>

          <div className="analytics-kpi-label">
            Compliance Score
          </div>

          <div className="analytics-kpi-foot">
            Average across inspections
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="analytics-kpi-top">
            <div className="analytics-icon analytics-icon-warning">
              <Clock3 size={19} />
            </div>

            <span className="analytics-negative">
              <TrendingUp size={13} />
              3.1%
            </span>
          </div>

          <div className="analytics-kpi-value">19</div>

          <div className="analytics-kpi-label">
            Overdue Actions
          </div>

          <div className="analytics-kpi-foot">
            Require management attention
          </div>
        </div>

      </div>


      {/* MAIN CHART ROW */}
      <div className="analytics-grid analytics-grid-main">

        {/* INSPECTION TREND */}
        <div className="analytics-card analytics-trend-card">

          <div className="analytics-card-header">
            <div>
              <h3>Inspection Trend</h3>
              <p>Monthly inspection activity</p>
            </div>

            <div className="analytics-card-badge">
              157 total
            </div>
          </div>

          <div className="trend-chart">

            <div className="trend-y-axis">
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            <div className="trend-area">

              <div className="trend-grid">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="trend-bars">

                {monthlyInspections.map((item) => (
                  <div
                    className="trend-column"
                    key={item.month}
                  >
                    <div
                      className="trend-bar"
                      style={{
                        height: `${item.value * 2.3}px`,
                      }}
                      title={`${item.value} inspections`}
                    />

                    <span>{item.month}</span>
                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>


        {/* RISK DISTRIBUTION */}
        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h3>Risk Distribution</h3>
              <p>Current inspection risk profile</p>
            </div>
          </div>

          <div className="risk-chart">

            <div className="risk-donut">
              <div className="risk-donut-inner">
                <strong>100</strong>
                <span>Findings</span>
              </div>
            </div>

            <div className="risk-legend">

              {riskData.map((item) => (
                <div
                  className="risk-legend-item"
                  key={item.label}
                >
                  <div className="risk-name">
                    <span
                      className={`risk-dot ${item.className}`}
                    />

                    {item.label}
                  </div>

                  <strong>{item.value}%</strong>
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>


      {/* SECOND ROW */}
      <div className="analytics-grid analytics-grid-secondary">

        {/* FINDINGS BY CATEGORY */}
        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h3>Findings by Category</h3>
              <p>Distribution of identified issues</p>
            </div>
          </div>

          <div className="category-chart">

            {findingData.map((item) => (
              <div
                className="category-row"
                key={item.label}
              >

                <div className="category-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>

                <div className="category-track">
                  <div
                    className="category-fill"
                    style={{
                      width: `${item.value * 2.5}%`,
                    }}
                  />
                </div>

              </div>
            ))}

          </div>

        </div>


        {/* CORRECTIVE ACTIONS */}
        <div className="analytics-card">

          <div className="analytics-card-header">
            <div>
              <h3>Corrective Actions</h3>
              <p>Action resolution performance</p>
            </div>
          </div>

          <div className="action-list">

            {actionData.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="action-analytics-row"
                  key={item.label}
                >

                  <div className={`action-analytics-icon ${item.className}`}>
                    <Icon size={17} />
                  </div>

                  <div className="action-analytics-info">
                    <span>{item.label}</span>

                    <div className="action-progress">
                      <div
                        className={`action-progress-fill ${item.className}`}
                        style={{
                          width: `${item.value}%`,
                        }}
                      />
                    </div>
                  </div>

                  <strong>{item.value}%</strong>

                </div>
              );
            })}

          </div>

        </div>

      </div>


      {/* AI INSIGHTS */}
      <div className="analytics-card analytics-insights">

        <div className="analytics-insight-header">

          <div className="analytics-ai-icon">
            AI
          </div>

          <div>
            <h3>AI Inspection Insights</h3>
            <p>
              Automatically generated from local inspection intelligence
            </p>
          </div>

        </div>


        <div className="insight-grid">

          <div className="insight-item">
            <span className="insight-number">01</span>

            <div>
              <strong>Safety remains the highest-risk category</strong>

              <p>
                Safety-related findings account for the largest share
                of identified inspection issues.
              </p>
            </div>
          </div>


          <div className="insight-item">
            <span className="insight-number">02</span>

            <div>
              <strong>Corrective actions need attention</strong>

              <p>
                A portion of open actions are overdue and may require
                management prioritization.
              </p>
            </div>
          </div>


          <div className="insight-item">
            <span className="insight-number">03</span>

            <div>
              <strong>Compliance performance is improving</strong>

              <p>
                Average compliance remains above 90%, indicating
                positive operational performance.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}