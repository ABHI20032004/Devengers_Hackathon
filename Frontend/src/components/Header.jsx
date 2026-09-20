import {
  Bell,
  Search,
  Menu,
  LogOut,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const titles = {
  "/dashboard": [
    "Dashboard",
    "Inspection intelligence overview",
  ],

  "/inspections": [
    "Inspections",
    "Manage industrial inspection workflows",
  ],

  "/documents": [
    "Documents",
    "Inspection document intelligence",
  ],

  "/findings": [
    "Findings",
    "Track identified inspection issues",
  ],

  "/actions": [
    "Corrective Actions",
    "Manage remediation activities",
  ],

  "/evidence": [
    "Evidence",
    "Inspection evidence repository",
  ],

  "/copilot": [
    "InSpect AI",
    "Ask your local inspection intelligence",
  ],

  "/reports": [
    "Reports",
    "Generate and manage inspection reports",
  ],

  "/analytics": [
    "Analytics",
    "Operational inspection intelligence",
  ],

  "/settings": [
    "Settings",
    "Configure InspectAI",
  ],
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);

  const current =
    titles[location.pathname] ||
    titles["/dashboard"];

  const handleLogout = () => {
    // Remove JWT token
    localStorage.removeItem("access_token");

    // Close menu
    setShowMenu(false);

    // Redirect to login
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >

        <button
          className="mobile-menu btn btn-secondary"
        >
          <Menu size={16} />
        </button>

        <div>

          <div className="header-title">
            {current[0]}
          </div>

          <div className="header-subtitle">
            {current[1]}
          </div>

        </div>

      </div>


      <div className="header-right">

        <div
          className="search-box"
          style={{ width: 230 }}
        >

          <Search
            size={24}
            color="#08152c"
          />

          <input
            placeholder="Search..."
          />

        </div>


        <div className="header-status">
          <span className="online-dot" />
          Local AI
        </div>


        <Bell
          size={17}
          color="#64748b"
        />


        {/* User Avatar + Logout */}
        <div
          style={{
            position: "relative",
          }}
        >

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="avatar"
            style={{
              border: "none",
              cursor: "pointer",
            }}
          >
            AI
          </button>


          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                right: 0,
                width: "150px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
                padding: "6px",
                zIndex: 1000,
              }}
            >

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "9px 10px",
                  border: "none",
                  background: "transparent",
                  borderRadius: "7px",
                  cursor: "pointer",
                  color: "#dc2626",
                  fontSize: "13px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >

                <LogOut size={15} />

                Logout

              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}