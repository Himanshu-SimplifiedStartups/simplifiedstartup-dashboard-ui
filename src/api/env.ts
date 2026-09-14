/**
 * Live / Test environment switch (Stripe-style).
 *
 * The dashboard is built once and talks to whichever API the current mode
 * selects at runtime:
 *   - Live  → VITE_API_URL       (production server, what simplifiedstartup.com shows)
 *   - Test  → VITE_API_URL_TEST  (dev server with test data)
 *
 * Live is the default for a fresh browser. The choice is remembered per
 * browser in localStorage; switching reloads the page so no cached data from
 * the other environment lingers. Each API sets its own session cookie, so
 * the two environments keep separate logins.
 *
 * When VITE_API_URL_TEST is not configured (local development against a
 * single server) the toggle is hidden and the dashboard behaves as before.
 */
export type ApiMode = "live" | "test";

const STORAGE_KEY = "ss-dashboard-mode";

const LIVE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const TEST_URL: string | undefined = import.meta.env.VITE_API_URL_TEST || undefined;

/** True when a test server is configured, i.e. the toggle should be shown. */
export const HAS_TEST_ENV = Boolean(TEST_URL);

function readStoredMode(): ApiMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "test" && HAS_TEST_ENV ? "test" : "live";
  } catch {
    return "live";
  }
}

/** Mode for this page load. Fixed until the next reload (see setMode). */
export const MODE: ApiMode = readStoredMode();
export const IS_TEST = MODE === "test";

/** Base URL of the API for the current mode (no trailing slash). */
export const API_URL: string = (IS_TEST && TEST_URL ? TEST_URL : LIVE_URL).replace(/\/+$/, "");

export const API_HOST = (() => {
  try {
    return new URL(API_URL).host;
  } catch {
    return API_URL;
  }
})();

/** Persist the mode and reload so every query, cookie and cache is rebuilt against the other server. */
export function setMode(mode: ApiMode) {
  if (mode === MODE) return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // storage blocked: fall through and reload anyway, the default (live) applies
  }
  window.location.reload();
}
