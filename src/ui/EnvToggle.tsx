import { API_HOST, HAS_TEST_ENV, IS_TEST, setMode } from "../api/env";

/**
 * Live / Test switch, shown wherever the user can act on data (sidebar,
 * mobile top bar, login card). Hidden when no test server is configured.
 */
export function EnvToggle({ compact = false }: { compact?: boolean }) {
  if (!HAS_TEST_ENV) return null;
  return (
    <div
      className={`env-toggle btn-group ${compact ? "btn-group-sm" : ""}`}
      role="group"
      aria-label="Environment"
      title={IS_TEST ? `Test mode — ${API_HOST}` : `Live mode — ${API_HOST}`}
    >
      <button
        type="button"
        className={`btn ${IS_TEST ? "btn-outline-light" : "btn-success"}`}
        aria-pressed={!IS_TEST}
        onClick={() => setMode("live")}
      >
        <i className="bi bi-broadcast me-1" aria-hidden="true"></i>Live
      </button>
      <button
        type="button"
        className={`btn ${IS_TEST ? "btn-warning" : "btn-outline-light"}`}
        aria-pressed={IS_TEST}
        onClick={() => setMode("test")}
      >
        <i className="bi bi-flask me-1" aria-hidden="true"></i>Test
      </button>
    </div>
  );
}

/**
 * Persistent banner across the top of the shell while in Test mode, so nobody
 * mistakes test data for the live site.
 */
export function TestModeBanner() {
  if (!IS_TEST) return null;
  return (
    <div className="env-banner d-flex align-items-center justify-content-center gap-2 px-3 py-1 small" role="status">
      <i className="bi bi-flask" aria-hidden="true"></i>
      <span>
        <b>Test mode.</b> You are working on the test server ({API_HOST}). Nothing here changes simplifiedstartup.com.
      </span>
      <button type="button" className="btn btn-link btn-sm p-0 ms-2 fw-semibold env-banner-link" onClick={() => setMode("live")}>
        Switch to Live
      </button>
    </div>
  );
}
