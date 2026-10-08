import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { api, ApiError } from "../api/client";
import { API_HOST, HAS_TEST_ENV, IS_TEST } from "../api/env";
import { useAuth } from "../auth/AuthContext";
import { EnvToggle } from "../ui/EnvToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/login", { email, password });
      await refresh();
      navigate((location.state as { from?: string } | null)?.from ?? "/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "Wrong email or password." : "Couldn't sign in — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <img className="brand-mark" src="/logo.png" alt="" aria-hidden="true" />
            <span className="fw-bold">Simplified Startup — Dashboard</span>
          </div>
          {HAS_TEST_ENV && (
            <div className={`env-login rounded p-2 mb-3 ${IS_TEST ? "env-login-test" : "env-login-live"}`}>
              <div className="d-flex align-items-center justify-content-between gap-2">
                <span className="small fw-semibold">{IS_TEST ? "Test mode" : "Live mode"}</span>
                <EnvToggle compact />
              </div>
              <div className="small text-muted mt-1">
                {IS_TEST ? `Signing in to the test server (${API_HOST}). Separate login from Live.` : "Signing in to the live server behind simplifiedstartup.com."}
              </div>
            </div>
          )}
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus autoComplete="email" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </Form.Group>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <Button type="submit" className="w-100" disabled={busy}>
              {busy && <Spinner size="sm" className="me-2" />}
              Sign in
            </Button>
          </Form>
          {/* Forgot-password link hidden for now (no outbound mail on prod); the route still exists. */}
          <p className="text-muted small text-center mt-3 mb-0">Access is invite-only — ask an admin for an invitation. To change your password, sign in and open Account.</p>
        </Card.Body>
      </Card>
    </div>
  );
}
