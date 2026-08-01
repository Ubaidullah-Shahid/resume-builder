import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const API_URL = "http://localhost:4000/api";

interface Resume {
  id: string;
  title: string;
  data: { fullName?: string; title?: string };
  createdAt: string;
  updatedAt: string;
}

export default function MyResumes() {
  const { token } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/resumes`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load resumes.");
      setResumes(body.resumes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    await fetch(`${API_URL}/resumes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setResumes((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleDownload(id: string, name: string) {
    const res = await fetch(`${API_URL}/resumes/${id}/export.pdf`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      alert("Export failed.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "resume"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-[64px] md:ml-[260px] p-6 md:p-8 max-w-[1600px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Resumes</h1>
          <Link href="/builder">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> New Resume
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading your resumes…
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && resumes.length === 0 && (
          <GlassCard className="p-10 flex flex-col items-center text-center gap-3">
            <FileText className="w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground">You haven't saved any resumes yet.</p>
            <Link href="/templates">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Browse templates</Button>
            </Link>
          </GlassCard>
        )}

        {!loading && !error && resumes.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((r) => (
              <GlassCard key={r.id} className="p-4 flex flex-col gap-3">
                <div>
                  <h3 className="font-semibold text-sm truncate">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.data?.fullName || "No name set"} {r.data?.title ? `· ${r.data.title}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {new Date(r.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link href={`/builder?resume=${r.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 hover:bg-white/10">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                    onClick={() => handleDownload(r.id, r.data?.fullName || r.title)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/5 border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}