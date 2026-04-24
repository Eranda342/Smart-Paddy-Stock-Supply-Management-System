import { useState } from 'react';
import { getCurrentUser } from '@/utils/getCurrentUser';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Shield, Calendar, Lock, LogOut,
  Send, CheckCircle, Loader2, KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/api/api';

// ─── Helpers ──────────────────────────────────────────────────────
const user = getCurrentUser();

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD';

// ─── Sub-components ───────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#22C55E]" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono text-xs' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function AdminProfile() {
  const navigate = useNavigate();
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // ── Send password reset link ──────────────────────────────────
  const handleSendResetLink = async () => {
    if (!user.email) {
      toast.error('No email address found for this account.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send reset link');
      }
      setResetSent(true);
      toast.success('Password reset link sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setResetLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="max-w-[860px] mx-auto">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-1">Admin Profile</h1>
        <p className="text-muted-foreground">View your account details and manage security settings.</p>
      </div>

      {/* ── Identity Card ── */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 flex items-center gap-5">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-[#0F1115] shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          {initials(user.fullName)}
        </div>

        {/* Name + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-semibold truncate">{user.fullName || 'Administrator'}</h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
            >
              Super Admin
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{user.email}</p>
        </div>

        {/* Online indicator */}
        <div className="flex items-center gap-1.5 text-xs text-[#22C55E] font-medium shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          Active Session
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── A. Profile Info ── */}
        <SectionCard title="Account Information" icon={User}>
          <InfoRow label="Full Name" value={user.fullName} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value="Administrator" />
          <InfoRow label="Account Created" value={formatDate(user.createdAt)} />
        </SectionCard>

        {/* ── B. Security ── */}
        <SectionCard title="Security" icon={Shield}>

          {/* Change Password */}
          <div>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive a reset link at <span className="text-foreground">{user.email}</span>
                </p>
              </div>
              <KeyRound className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            </div>

            {resetSent ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl px-4 py-2.5">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Reset link sent — check your inbox.
              </div>
            ) : (
              <button
                onClick={handleSendResetLink}
                disabled={resetLoading}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-muted hover:bg-muted/70 border border-border rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Reset Link</>
                }
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Current session */}
          <div>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Logs you out of this device immediately.
                </p>
              </div>
              <LogOut className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Logout all devices — backend not implemented */}
          <div>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Logout All Devices</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Invalidates all active sessions. (Coming soon)
                </p>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
            </div>
            <button
              disabled
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground/40 bg-muted/30 border border-border/50 rounded-xl cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              Not Available
            </button>
          </div>

        </SectionCard>

        {/* ── C. Session Meta ── */}
        <SectionCard title="Session Details" icon={Calendar}>
          <InfoRow label="Logged in as" value={user.email} mono />
          <InfoRow label="Role" value="ADMIN" mono />
          <InfoRow
            label="Token expires"
            value="End of session"
          />
        </SectionCard>

        {/* ── D. Notifications (UI only) ── */}
        <SectionCard title="Notification Preferences" icon={Mail}>
          {[
            { label: 'KYC Verification Alerts', defaultOn: true },
            { label: 'New Dispute Raised',       defaultOn: true },
            { label: 'Platform Activity Summary', defaultOn: false },
          ].map(({ label, defaultOn }) => (
            <NotifToggle key={label} label={label} defaultOn={defaultOn} />
          ))}
          <p className="text-[11px] text-muted-foreground/60 pt-1">
            These preferences are stored locally and do not affect backend delivery.
          </p>
        </SectionCard>

      </div>
    </div>
  );
}

// ── Notification toggle (UI-only, no backend) ────────────────────
function NotifToggle({ label, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm">{label}</span>
      <button
        onClick={() => setOn(v => !v)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-[#22C55E]' : 'bg-muted'}`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
