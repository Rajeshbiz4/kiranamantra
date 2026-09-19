import { useState } from "react";
import KeyIcon from "@mui/icons-material/Key";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VerifiedIcon from "@mui/icons-material/Verified";
import EventIcon from "@mui/icons-material/Event";
import "./license.css";

export type LicenseStatus = {
  active: boolean; reason: string; machineId: string;
  plan?: "1m" | "6m" | "1y" | "development";
  customer?: string; issuedAt?: string; expiresAt?: string;
  daysRemaining?: number; message?: string;
};
export type LicenseApi = {
  status: () => Promise<LicenseStatus>;
  activate: (code: string) => Promise<{ success: boolean; license?: LicenseStatus; message?: string }>;
};
const planName = (plan?: string) => ({ "1m": "1 month", "6m": "6 months", "1y": "1 year", development: "Development" })[plan || ""] || "—";

export function ActivationScreen({ status, api, activated }: { status: LicenseStatus; api?: LicenseApi; activated: (license: LicenseStatus) => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!api) return setError("Activation is available in the desktop application.");
    if (!code.trim()) return setError("Enter the activation code.");
    setBusy(true); setError("");
    try {
      const result = await api.activate(code.trim());
      if (result.success && result.license) activated(result.license);
      else setError(result.message || "Activation failed.");
    } finally { setBusy(false); }
  };
  return <div className="activation-page">
    <section className="activation-brand"><img src="/kiranamitra-logo.jpg" alt="KiranaMitra" /><h1>KiranaMitra</h1><p>Offline billing, inventory and GST</p></section>
    <form className="activation-card" onSubmit={activate}>
      <div className="activation-icon"><KeyIcon /></div>
      <h2>{status.reason === "expired" ? "Subscription expired" : "Activate KiranaMitra"}</h2>
      <p>Choose a 1-month, 6-month or 1-year plan and enter the activation code provided by KiranaMitra.</p>
      <label>Machine ID</label>
      <div className="machine-id"><code>{status.machineId}</code><button type="button" title="Copy machine ID" onClick={() => navigator.clipboard.writeText(status.machineId)}><ContentCopyIcon fontSize="small" /></button></div>
      <small>Send this Machine ID to the software provider. The code works only on this computer.</small>
      <label>Activation code</label>
      <textarea rows={5} value={code} onChange={(event) => setCode(event.target.value)} placeholder="Paste activation code here" />
      {(error || status.message) && <div className="activation-error">{error || status.message}</div>}
      <button className="primary activation-submit" disabled={busy}>{busy ? "Activating…" : "Activate application"}</button>
      <div className="plan-list"><span>1 month</span><span>6 months</span><span>1 year</span></div>
    </form>
  </div>;
}

export function LicensePage({ status, api, updated }: { status: LicenseStatus; api?: LicenseApi; updated: (license: LicenseStatus) => void }) {
  const [renew, setRenew] = useState(false);
  if (renew) return <div className="license-inline"><ActivationScreen status={status} api={api} activated={(license) => { updated(license); setRenew(false); }} /></div>;
  return <div className="license-page">
    <div className="page-actions"><div><h2>License & activation</h2><p>View subscription status and renew this computer</p></div><button className="primary" onClick={() => setRenew(true)}><KeyIcon fontSize="small" /> Renew license</button></div>
    <div className="license-summary">
      <div className="panel"><VerifiedIcon /><span>Status</span><b className={status.active ? "license-active" : "danger-text"}>{status.active ? "Active" : "Inactive"}</b></div>
      <div className="panel"><EventIcon /><span>Plan</span><b>{planName(status.plan)}</b></div>
      <div className="panel"><EventIcon /><span>Remaining</span><b>{status.daysRemaining ?? "—"} days</b></div>
    </div>
    <div className="panel license-details"><h3>Activation details</h3><dl><dt>Licensed to</dt><dd>{status.customer || "—"}</dd><dt>Machine ID</dt><dd><code>{status.machineId}</code></dd><dt>Activated plan</dt><dd>{planName(status.plan)}</dd><dt>Expiry date</dt><dd>{status.expiresAt ? new Date(status.expiresAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—"}</dd></dl><p>The license works offline and is locked to this computer. Keep the Windows date and time correct.</p></div>
  </div>;
}
