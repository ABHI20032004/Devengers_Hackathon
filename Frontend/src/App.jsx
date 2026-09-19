import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Copilot from "./pages/Copilot";
import Inspections from "./pages/Inspections";
import Findings from "./pages/Findings";
import Actions from "./pages/Actions";
import Evidence from "./pages/Evidence";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import InspectionDetails from "./pages/InspectionDetails";
import NetworkMonitor from "./pages/NetworkMonitor";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";


// =====================================================
// APPLICATION LAYOUT
// =====================================================

function Layout() {
  return (
    <div className="app-shell">

      <Sidebar />

      <div className="main-area">

        <Header />

        <main className="page-container">

          <Routes>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Documents */}
            <Route
              path="/documents"
              element={<Documents />}
            />

            {/* AI Copilot */}
            <Route
              path="/copilot"
              element={<Copilot />}
            />

            {/* Inspections */}
            <Route
              path="/inspections"
              element={<Inspections />}
            />

            {/* Inspection Details */}
            <Route
              path="/inspections/:id"
              element={<InspectionDetails />}
            />

            {/* Findings */}
            <Route
              path="/findings"
              element={<Findings />}
            />

            {/* Corrective Actions */}
            <Route
              path="/actions"
              element={<Actions />}
            />

            {/* Evidence */}
            <Route
              path="/evidence"
              element={<Evidence />}
            />

            {/* Reports */}
            <Route
              path="/reports"
              element={<Reports />}
            />

            {/* Analytics */}
            <Route
              path="/analytics"
              element={<Analytics />}
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={<Settings />}
            />
            <Route
  path="/network"
  element={<NetworkMonitor />}
/>

            {/* Unknown application route */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>

        </main>

      </div>

    </div>
  );
}


// =====================================================
// APP
// =====================================================

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ============================================
            PUBLIC AUTHENTICATION
           ============================================ */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ============================================
            PROTECTED APPLICATION
           ============================================ */}

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}