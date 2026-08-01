import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Check } from "lucide-react";

const API_URL = "http://localhost:4000/api";

export default function Settings() {
  const { user, token } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameError("");
    setNameSaved(false);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to save.");

      // Keep the stored session in sync with the new name.
      const stored = JSON.parse(sessionStorage.getItem("user") || "{}");
      sessionStorage.setItem("user", JSON.stringify({ ...stored, name: body.user.name }));
      window.dispatchEvent(new Event("auth-changed"));

      setNameSaved(true);
    } catch (err: any) {
      setNameError(err.message);
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError("");
    setPasswordSaved(false);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to change password.");

      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-[64px] md:ml-[260px] p-6 md:p-8 max-w-[1600px]">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="grid gap-6 max-w-md">
          <GlassCard className="p-6 space-y-4">
            <h2 className="font-semibold">Account</h2>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Email</div>
              <div className="text-sm">{user?.email}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Email can't be changed.</div>
            </div>

            <form onSubmit={saveName} className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-white/5 border-white/10" />
              </div>
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              <Button type="submit" disabled={savingName} className="bg-blue-600 hover:bg-blue-700 text-white">
                {savingName ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : nameSaved ? <Check className="w-4 h-4 mr-2" /> : null}
                Save name
              </Button>
            </form>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h2 className="font-semibold">Change password</h2>
            <form onSubmit={savePassword} className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Current password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 bg-white/5 border-white/10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">New password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} className="mt-1 bg-white/5 border-white/10" />
              </div>
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              {passwordSaved && <p className="text-sm text-emerald-500">Password updated.</p>}
              <Button type="submit" disabled={savingPassword} className="bg-blue-600 hover:bg-blue-700 text-white">
                {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Update password
              </Button>
            </form>
          </GlassCard>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Account type</div>
            <div className="text-sm font-medium capitalize">{user?.role}</div>
          </div>
        </div>
      </main>
    </div>
  );
}