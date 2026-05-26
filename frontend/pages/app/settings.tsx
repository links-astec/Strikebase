import { useState, useEffect } from "react";
import Head from "next/head";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth";
import { updateProfile, resetPassword } from "@/lib/api";
import PasswordStrength from "@/components/PasswordStrength";
import SkillInput from "@/components/SkillInput";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();

  const [skills, setSkills]       = useState<string[]>([]);
  const [rate, setRate]           = useState("");
  const [exp, setExp]             = useState<"junior" | "mid" | "senior">("mid");
  const [github, setGithub]       = useState("");
  const [bio, setBio]             = useState("");
  const [displayName, setDN]      = useState("");

  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState("");

  // Password change
  const [newPwd, setNewPwd]       = useState("");
  const [cfmPwd, setCfmPwd]       = useState("");
  const [showNew, setShowNew]     = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved, setPwdSaved]   = useState(false);
  const [pwdError, setPwdError]   = useState("");

  useEffect(() => {
    if (!profile) return;
    setSkills(profile.skills || []);
    setRate(profile.hourly_rate ? String(profile.hourly_rate) : "");
    setExp(profile.experience || "mid");
    setGithub(profile.github_url || "");
    setBio(profile.bio || "");
    setDN(profile.display_name || "");
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName || null,
        skills,
        hourly_rate: parseFloat(rate) || 0,
        experience: exp,
        github_url:  github || null,
        bio:         bio    || null,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    if (newPwd.length < 8) { setPwdError("Password must be at least 8 characters"); return; }
    if (newPwd !== cfmPwd) { setPwdError("Passwords do not match"); return; }
    const token = typeof window !== "undefined" ? localStorage.getItem("sb_token") : null;
    if (!token) { setPwdError("Not authenticated — please sign in again"); return; }
    setPwdSaving(true);
    try {
      await resetPassword(token, newPwd);
      setPwdSaved(true);
      setNewPwd(""); setCfmPwd("");
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (e: unknown) {
      setPwdError(e instanceof Error ? e.message : "Password update failed");
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <AuthGuard>
      <Head><title>Settings — Strikebase</title></Head>
      <AppShell>
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 26, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              Settings
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 300 }}>
              Manage your profile, skills and preferences
            </p>
          </div>
        </div>

        <div className="page-body">
          <form onSubmit={handleSave} style={{ maxWidth: 640 }}>
            <div className="stack">
              {/* Profile */}
              <section className="card card-p stack">
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>
                  Profile
                </p>
                <div className="form-group">
                  <label className="input-label">Display name</label>
                  <input type="text" value={displayName} onChange={e => setDN(e.target.value)}
                    placeholder="Your name" className="input" />
                </div>
                <div className="form-group">
                  <label className="input-label">Short bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)}
                    placeholder="e.g. Full-stack dev specializing in SaaS products..."
                    rows={3} className="input" style={{ resize: "vertical" }} />
                </div>
                <div className="form-group">
                  <label className="input-label">GitHub URL</label>
                  <input type="url" value={github} onChange={e => setGithub(e.target.value)}
                    placeholder="https://github.com/yourname" className="input" />
                </div>
              </section>

              {/* Skills */}
              <section className="card card-p stack">
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>
                  Skills <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: 0, color: "var(--text-3)", fontSize: 10 }}>— up to 15</span>
                </p>
                <SkillInput skills={skills} onChange={setSkills} max={15} />
              </section>

              {/* Rate & Level */}
              <section className="card card-p">
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 14 }}>
                  Rate & experience
                </p>
                <div className="col-2">
                  <div className="form-group">
                    <label className="input-label">Hourly rate (USD)</label>
                    <input type="number" value={rate} onChange={e => setRate(e.target.value)}
                      placeholder="45" min="1" max="999" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Experience level</label>
                    <select value={exp} onChange={e => setExp(e.target.value as "junior" | "mid" | "senior")}
                      className="input" style={{ cursor: "pointer" }}>
                      <option value="junior">Junior (0–2 years)</option>
                      <option value="mid">Mid-level (2–5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                    </select>
                  </div>
                </div>
              </section>

              {error && (
                <div style={{ padding: "9px 12px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--danger)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: "flex-start", minWidth: 160, padding: "12px 24px", display: "flex", alignItems: "center", gap: 8 }}>
                {saving
                  ? <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> Saving...</>
                  : saved
                  ? <><CheckCircle size={14} /> Saved</>
                  : "Save changes"}
              </button>
            </div>
          </form>

          {/* Change password — separate form using current session token */}
          <form onSubmit={handlePasswordChange} style={{ maxWidth: 640, marginTop: 8 }}>
            <section className="card card-p stack">
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>
                Change password
              </p>
              <div className="form-group">
                <label className="input-label">New password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPwd} onChange={e => setNewPwd(e.target.value)}
                    placeholder="At least 8 characters" className="input"
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0, display: "flex" }}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrength password={newPwd} />
              </div>
              <div className="form-group">
                <label className="input-label">Confirm new password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showCfm ? "text" : "password"}
                    value={cfmPwd} onChange={e => setCfmPwd(e.target.value)}
                    placeholder="Repeat your new password" className="input"
                    style={{ paddingRight: 40, borderColor: cfmPwd && newPwd !== cfmPwd ? "var(--danger)" : undefined }}
                  />
                  <button type="button" onClick={() => setShowCfm(v => !v)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 0, display: "flex" }}>
                    {showCfm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {cfmPwd && newPwd !== cfmPwd && (
                  <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>Passwords do not match</p>
                )}
              </div>

              {pwdError && (
                <div style={{ padding: "9px 12px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--danger)" }}>
                  {pwdError}
                </div>
              )}

              <button type="submit" disabled={pwdSaving || !newPwd} className="btn btn-primary" style={{ alignSelf: "flex-start", minWidth: 180, padding: "12px 24px", display: "flex", alignItems: "center", gap: 8 }}>
                {pwdSaving
                  ? <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> Updating...</>
                  : pwdSaved
                  ? <><CheckCircle size={14} /> Password updated</>
                  : "Update password"}
              </button>
            </section>
          </form>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
