import { useState, type FormEvent } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../ui/Toasts";

/** The signed-in user's own account: who they are, and a change-password form. */
export default function Account() {
  const { user } = useAuth();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError("The new passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/change-password", { currentPassword: current, newPassword: next });
      toast("Password changed. Other devices have been signed out.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? err.message.replace(/^\w/, (c) => c.toUpperCase()) + "."
          : err instanceof ApiError && err.status === 429
            ? "Too many attempts. Wait a minute and try again."
            : "Something went wrong. Try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-narrow">
      <h1 className="fs-3 mb-3">Account</h1>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">{user?.name ?? user?.email}</div>
              <div className="text-muted small">{user?.email}</div>
            </div>
            <Badge bg="secondary">{user?.role}</Badge>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="fs-5 mb-1">Change password</h2>
          <p className="text-muted small">Pick something at least 8 characters long. Every other signed-in device will be logged out.</p>
          <Form onSubmit={onSubmit} className="mt-3">
            <Form.Group className="mb-3" controlId="acCurrent">
              <Form.Label>Current password</Form.Label>
              <Form.Control type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="acNext">
              <Form.Label>New password</Form.Label>
              <Form.Control type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} autoComplete="new-password" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="acConfirm">
              <Form.Label>Confirm new password</Form.Label>
              <Form.Control type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" />
            </Form.Group>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <Button type="submit" disabled={busy}>
              {busy && <Spinner size="sm" className="me-2" />}
              Update password
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
