import { useState, useEffect } from "react";
import { Key, Bell, Trash2, LogOut, ShieldAlert, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Mock states for Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Deletion logic
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) setUser(JSON.parse(localUser));
  }, []);

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error("User email not found");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        toast.success("Password reset email sent to " + user.email);
      } else {
        toast.error("Failed to send reset email");
      }
    } catch (err) {
      toast.error("Error sending reset email");
    }
  };

  const handleLogoutAll = () => {
    toast.success("Logged out from all other active sessions safely");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") {
      toast.error("You must type DELETE to confirm.");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Account deleted successfully");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to delete account");
      }
    } catch (err) {
      toast.error("Network error during deletion");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">System Settings</h1>
        <p className="text-muted-foreground">Manage your account security and notification preferences.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Security & Account */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. SECURITY SECTION */}
          <section className="bg-card border border-border rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Key className="w-5 h-5 text-blue-500" /> Security
            </h2>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-semibold">Change Password</p>
                  <p className="text-xs text-muted-foreground mt-1 text-balance">We'll verify it's you by sending a reset link to your registered email.</p>
                </div>
                <Button variant="secondary" onClick={handleResetPassword} className="shrink-0 w-full sm:w-auto">
                  Send Reset Link
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-semibold">Active Sessions</p>
                  <p className="text-xs text-muted-foreground mt-1 text-balance">Revoke access from all other devices logged into your account.</p>
                </div>
                <Button variant="outline" onClick={handleLogoutAll} className="shrink-0 w-full sm:w-auto text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors">
                  Logout All Devices
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-sm font-semibold">Current Session</p>
                  <p className="text-xs text-muted-foreground mt-1 text-balance">Sign out from your current device.</p>
                </div>
                <Button variant="ghost" onClick={handleLogout} className="shrink-0 w-full sm:w-auto text-muted-foreground hover:text-white">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          </section>

          {/* 2. ACCOUNT DELETION */}
          <section className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-red-500/20 pb-4 text-red-500">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </h2>
            
            {!deleteMode ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Delete Account</p>
                  <div className="mt-2 flex gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>Deleting your account automatically clears all submitted verification documents and active listings. This action is absolutely irreversible.</p>
                  </div>
                </div>
                <Button variant="danger" onClick={() => setDeleteMode(true)} className="shrink-0 w-full sm:w-auto border border-red-700/50 bg-red-600 hover:bg-red-700 text-white shadow-red-900/50">
                  Request Deletion
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                 <p className="text-sm font-semibold text-white mb-2">Are you sure?</p>
                 <p className="text-xs text-red-400 mb-4">You will lose all your data permanently. Please type <strong className="text-white">DELETE</strong> to confirm.</p>
                 <div className="flex gap-3">
                   <input 
                     type="text" 
                     value={deleteInput}
                     onChange={(e) => setDeleteInput(e.target.value)}
                     placeholder="Type DELETE" 
                     className="flex-1 h-9 bg-zinc-900 border border-red-500/30 rounded-lg px-3 text-sm text-white placeholder-red-400/50 outline-none focus:border-red-500 transition-colors"
                   />
                   <Button variant="secondary" onClick={() => { setDeleteMode(false); setDeleteInput(""); }} disabled={deleting}>
                     Cancel
                   </Button>
                   <Button variant="danger" onClick={handleDeleteAccount} disabled={deleting || deleteInput !== "DELETE"} className="bg-red-600 hover:bg-red-700 text-white w-24">
                     {deleting ? "Wait..." : "Confirm"}
                   </Button>
                 </div>
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN: Notifications */}
        <div className="space-y-6">
          
          {/* NOTIFICATIONS */}
          <section className="bg-card border border-border rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-border pb-4">
               <Bell className="w-5 h-5 text-orange-400" /> Notifications
            </h2>
            <div className="space-y-5">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium">Email Alerts</p>
                   <p className="text-xs text-muted-foreground">Verification updates sent via email.</p>
                 </div>
                 {/* Toggle Switch UI Mock */}
                 <button 
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className={`w-10 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${emailNotifs ? 'bg-green-500' : 'bg-zinc-700'}`}
                 >
                   <span className={`w-4 h-4 bg-white rounded-full shadow-md absolute transition-transform ${emailNotifs ? 'translate-x-5' : 'translate-x-1'}`}></span>
                 </button>
               </div>

               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium">System Alerts</p>
                   <p className="text-xs text-muted-foreground">In-app banners and sounds.</p>
                 </div>
                 <button 
                  onClick={() => setSystemAlerts(!systemAlerts)}
                  className={`w-10 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${systemAlerts ? 'bg-green-500' : 'bg-zinc-700'}`}
                 >
                   <span className={`w-4 h-4 bg-white rounded-full shadow-md absolute transition-transform ${systemAlerts ? 'translate-x-5' : 'translate-x-1'}`}></span>
                 </button>
               </div>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
