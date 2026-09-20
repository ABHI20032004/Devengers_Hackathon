import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  SearchCheck,
  ListChecks,
  Image,
  Bot,
  FileBarChart,
  BarChart3,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const mainItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
    {
    name: "Documents",
    path: "/documents",
    icon: FileText,
  },
  {
    name: "Inspections",
    path: "/inspections",
    icon: ClipboardCheck,
  },

  {
    name: "Findings",
    path: "/findings",
    icon: SearchCheck,
  },
  {
    name: "Corrective Actions",
    path: "/actions",
    icon: ListChecks,
  },
  {
    name: "Evidence",
    path: "/evidence",
    icon: Image,
  },

];

const intelligenceItems = [
  {
    name: "AI InSpect",
    path: "/copilot",
    icon: Bot,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileBarChart,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo-area">

        <div className="logo-icon">
          <ShieldCheck size={21} />
        </div>

        <div>
          <div className="logo-title">
            InSpectAI
          </div>

          <div className="logo-subtitle">
            OFFLINE INSPECTION INTELLIGENCE
          </div>
        </div>

      </div>


      <nav className="nav-section">

        <div className="nav-label">
          Workspace
        </div>

        {mainItems.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
          />
        ))}


        <div
          className="nav-label"
          style={{
            marginTop: 24,
          }}
        >
          Intelligence
        </div>

        {intelligenceItems.map((item) => (
          <NavigationItem
            key={item.path}
            item={item}
          />
        ))}


        <div
          className="nav-label"
          style={{
            marginTop: 24,
          }}
        >
          System

            
          <NavigationItem
                  item={{
                    name: "Network Monitor",  
                    path: "/network",
                    icon: ShieldCheck,
                  }}
          />
              

        <NavigationItem
          item={{
            name: "Setting",
            path: "/settings",
            icon: Settings,
          }}
        />
        
      <div className="sidebar-bottom">

        <div className="engine-status">

          <div className="engine-row">
            <span className="online-dot" />
            Local AI Engine
          </div>

          <div className="engine-text">
            Ollama · ChromaDB · SQLite
          </div>
         </div>

        </div>

      </div>

      </nav>




    </aside>
  );
}


function NavigationItem({ item }) {

  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `nav-link ${isActive ? "active" : ""}`
      }
    >

      <span className="nav-icon">
        <Icon size={16} />
      </span>

      {item.name}

    </NavLink>
  );
}