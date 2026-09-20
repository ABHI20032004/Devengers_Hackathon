import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  getCorrectiveActions,
  updateCorrectiveActionStatus,
} from "../services/api";


export default function Actions() {

  const [actions, setActions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [filter, setFilter] =
    useState("ALL");

  const [updatingId, setUpdatingId] =
    useState(null);


  // =====================================================
  // LOAD ACTIONS
  // =====================================================

  async function loadActions() {

    try {

      setLoading(true);

      const data =
        await getCorrectiveActions();

      setActions(
        data.actions || []
      );

    } catch (error) {

      console.error(
        "Failed to load actions:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadActions();

  }, []);


  // =====================================================
  // STATUS UPDATE
  // =====================================================

  async function handleStatusChange(
    action,
    newStatus
  ) {

    try {

      setUpdatingId(action.id);

      await updateCorrectiveActionStatus(
        action.id,
        newStatus
      );

      setActions((current) =>
        current.map((item) =>
          item.id === action.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

    } catch (error) {

      console.error(
        "Status update failed:",
        error
      );

      alert(
        error.message ||
        "Failed to update status"
      );

    } finally {

      setUpdatingId(null);

    }
  }


  // =====================================================
  // FILTER
  // =====================================================

  const filteredActions =
    filter === "ALL"
      ? actions
      : actions.filter(
          (action) =>
            (
              action.status ||
              "OPEN"
            ).toUpperCase() ===
            filter
        );


  // =====================================================
  // COUNTS
  // =====================================================

  const openCount =
    actions.filter(
      (a) =>
        a.status === "OPEN"
    ).length;

  const progressCount =
    actions.filter(
      (a) =>
        a.status === "IN PROGRESS"
    ).length;

  const resolvedCount =
    actions.filter(
      (a) =>
        a.status === "RESOLVED"
    ).length;


  return (
    <div className="actions-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <div className="page-title">
            Corrective Actions
          </div>

          <div className="page-subtitle">
            Track and manage inspection corrective actions
          </div>

        </div>


        <button
          className="btn btn-secondary"
          onClick={loadActions}
        >
          <RefreshCw size={13} />
          Refresh
        </button>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats-grid">

        <ActionStat
          title="Total Actions"
          value={actions.length}
          icon={ClipboardCheck}
        />

        <ActionStat
          title="Open"
          value={openCount}
          icon={AlertTriangle}
        />

        <ActionStat
          title="In Progress"
          value={progressCount}
          icon={Clock}
        />

        <ActionStat
          title="Resolved"
          value={resolvedCount}
          icon={CheckCircle}
        />

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="card">

        <div className="card-padding">

          <div className="action-filters">

            {[
              "ALL",
              "OPEN",
              "IN PROGRESS",
              "RESOLVED",
            ].map((status) => (

              <button
                key={status}
                className={
                  filter === status
                    ? "action-filter active"
                    : "action-filter"
                }
                onClick={() =>
                  setFilter(status)
                }
              >
                {status === "ALL"
                    ? "All"
                    : status === "IN PROGRESS"
                        ? "In Progress"
                        : status.charAt(0) +
                        status.slice(1).toLowerCase()}
              </button>

            ))}

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          {loading ? (

            <div className="empty-state">
              Loading corrective actions...
            </div>

          ) : filteredActions.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <ClipboardCheck size={22} />
              </div>

              <strong>
                No corrective actions
              </strong>

              <p>
                Create a corrective action
                from a finding.
              </p>

            </div>

          ) : (

            <div className="table-wrapper">

              <table className="data-table">

                <thead>

                  <tr>

                    <th>
                      Action
                    </th>

                    <th>
                      Finding ID
                    </th>

                    <th>
                      Priority
                    </th>

                    <th>
                      Assigned To
                    </th>

                    <th>
                      Due Date
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredActions.map(
                    (action) => (

                      <tr
                        key={
                          action.id
                        }
                      >

                        <td>

                          <strong>
                            {action.title}
                          </strong>

                          {action.notes && (

                            <div className="action-note">
                              {action.notes}
                            </div>

                          )}

                        </td>


                        <td>

                          #{action.finding_id}

                        </td>


                        <td>

                          <PriorityBadge
                            priority={
                              action.priority
                            }
                          />

                        </td>


                        <td>

                          {action.assigned_to ||
                            "Unassigned"}

                        </td>


                        <td>

                          {action.due_date ||
                            "—"}

                        </td>


                        <td>

                          <select
                            className={
                              "action-status-select " +
                              getStatusClass(
                                action.status
                              )
                            }
                            value={
                              action.status ||
                              "OPEN"
                            }
                            disabled={
                              updatingId ===
                              action.id
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                action,
                                event.target.value
                              )
                            }
                          >

                            <option value="OPEN">
                              Open
                            </option>

                            <option value="IN PROGRESS">
                              In Progress
                            </option>

                            <option value="RESOLVED">
                              Resolved
                            </option>

                          </select>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function ActionStat({
  title,
  value,
  icon: Icon,
}) {

  return (
    <div className="stat-card">

      <div>

        <div className="stat-label">
          {title}
        </div>

        <div className="stat-value">
          {value}
        </div>

      </div>

      <Icon size={19} />

    </div>
  );
}


/* =========================================================
   PRIORITY BADGE
========================================================= */

function PriorityBadge({
  priority,
}) {

  const value =
    (
      priority ||
      "MEDIUM"
    ).toUpperCase();

  return (
    <span
      className={
        `action-priority ${value.toLowerCase()}`
      }
    >
      {value}
    </span>
  );
}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
  status
) {

  const value =
    (
      status ||
      "OPEN"
    ).toUpperCase();

  if (value === "RESOLVED") {
    return "resolved";
  }

  if (value === "IN PROGRESS") {
    return "progress";
  }

  return "open";
}