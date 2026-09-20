import {
  ShieldCheck,
  Globe,
  Server,
  Activity,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function NetworkMonitor() {
  const [status, setStatus] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNetworkData = async () => {
    try {
      setLoading(true);

      const [statusResponse, connectionsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/network/status`),
          fetch(`${API_URL}/api/network/connections`),
        ]);

      const statusData = await statusResponse.json();
      const connectionsData = await connectionsResponse.json();

      setStatus(statusData);
      setConnections(connectionsData.connections || []);

    } catch (error) {
      console.error("Network monitor error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();

    const interval = setInterval(
      loadNetworkData,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="network-page">

      <div className="network-heading">

        <div>
          <h2>Network Sovereignty Monitor</h2>

          <p>
            Monitor network activity and verify local AI
            communication.
          </p>
        </div>

        <button
          className="network-refresh"
          onClick={loadNetworkData}
        >
          <RefreshCw
            size={15}
            className={loading ? "spin" : ""}
          />

          Refresh
        </button>

      </div>


      {/* SECURITY STATUS */}

      <div className="network-security-card">

        <div className="network-security-icon">
          <ShieldCheck size={28} />
        </div>

        <div className="network-security-info">

          <span>NETWORK SECURITY STATUS</span>

          <strong>
            {status?.external_detected
              ? "External Connection Detected ??"
              : "Local Network Only"}
          </strong>

          <p>
            {status?.external_detected
              ? "An external network connection is currently visible. Review the connection below."
              : "No external connections are currently detected by the application monitor."}
          </p>

        </div>

        <div
          className={
            status?.external_detected
              ? "network-status-badge warning"
              : "network-status-badge safe"
          }
        >
          {status?.external_detected
            ? "REVIEW"
            : "LOCAL"}
        </div>

      </div>


      {/* STAT CARDS */}

      <div className="network-stats">

        <div className="network-stat-card">

          <div className="network-stat-icon">
            <Server size={19} />
          </div>

          <strong>
            {status?.local_connections ?? 0}
          </strong>

          <span>
            Local Connections
          </span>

        </div>


        <div className="network-stat-card">

          <div className="network-stat-icon">
            <Globe size={19} />
          </div>

          <strong>
            {status?.external_connections ?? 0}
          </strong>

          <span>
            External Connections
          </span>

        </div>


        <div className="network-stat-card">

          <div className="network-stat-icon">
            <Activity size={19} />
          </div>

          <strong>
            {connections.length}
          </strong>

          <span>
            Active Connections
          </span>

        </div>

      </div>


      {/* CONNECTION TABLE */}

      <div className="network-card">

        <div className="network-card-header">

          <div>
            <h3>Live Network Connections</h3>

            <p>
              Current connections observed by NSpectAI
            </p>
          </div>

          <span className="live-indicator">
            <span />
            LIVE
          </span>

        </div>


        <div className="network-table-wrapper">

          <table className="network-table">

            <thead>
              <tr>
                <th>Scope</th>
                <th>Local Endpoint</th>
                <th>Remote Endpoint</th>
                <th>Port</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {connections.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="network-empty"
                  >
                    No active connections detected
                  </td>
                </tr>

              ) : (

                connections.map((connection, index) => (

                  <tr key={index}>

                    <td>
                      <span
                        className={
                          connection.scope === "LOCAL"
                            ? "scope-badge local"
                            : "scope-badge external"
                        }
                      >
                        {connection.scope}
                      </span>
                    </td>

                    <td>
                      {connection.local_ip}
                      {connection.local_port
                        ? `:${connection.local_port}`
                        : ""}
                    </td>

                    <td>
                      {connection.remote_ip}
                    </td>

                    <td>
                      {connection.remote_port}
                    </td>

                    <td>

                      {connection.scope === "LOCAL" ? (

                        <span className="connection-safe">
                          <ShieldCheck size={13} />
                          SAFE
                        </span>

                      ) : (

                        <span className="connection-warning">
                          <AlertTriangle size={13} />
                          REVIEW
                        </span>

                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* LOCAL ARCHITECTURE */}

      <div className="network-card">

        <div className="network-card-header">

          <div>
            <h3>Local AI Communication</h3>

            <p>
              Expected communication path for NSpectAI
            </p>
          </div>

        </div>


        <div className="network-flow">

          <div className="network-node">
            <strong>React</strong>
            <span>5173</span>
          </div>

          <div className="network-arrow">
            →
          </div>

          <div className="network-node">
            <strong>FastAPI</strong>
            <span>8000</span>
          </div>

          <div className="network-arrow">
            →
          </div>

          <div className="network-node">
            <strong>Ollama</strong>
            <span>11434</span>
          </div>

          <div className="network-arrow">
            →
          </div>

          <div className="network-node">
            <strong>Local Model</strong>
            <span>On-Premise</span>
          </div>

        </div>

      </div>

    </div>
  );
}