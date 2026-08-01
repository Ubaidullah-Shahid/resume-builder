import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Bell, Plus, Upload, Linkedin, Wand2, MoreHorizontal, Download, Eye, FileText, Layout, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sidebar } from "@/components/layout/sidebar";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/sign-out-button";
import { useAuth } from "@/hooks/use-auth";

const API_URL = "http://localhost:4000/api";

interface Resume {
  id: string;
  title: string;
  data: { fullName?: string; title?: string };
  createdAt: string;
  updatedAt: string;
}

function getInitials(name?: string) {
  if (!name) return "U";
  return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/resumes`, { headers: { Authorization: `Bearer ${token}` } });
        const body = await res.json();
        if (res.ok) setResumes(body.resumes);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDownload(id: string, name: string) {
    const res = await fetch(`${API_URL}/resumes/${id}/export.pdf`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return alert("Export failed.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "resume"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const byMonth: Record<string, number> = {};
  resumes.forEach((r) => {
    const key = new Date(r.createdAt).toLocaleDateString(undefined, { month: "short" });
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const chartData = Object.entries(byMonth).map(([name, resumes]) => ({ name, resumes }));

  const recent = [...resumes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main className="flex-1 ml-[64px] md:ml-[260px] p-6 md:p-8 max-w-[1600px] overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-['Space_Grotesk'] mb-1">Good morning, {firstName}</h1>
            <p className="text-sm text-muted-foreground">Here's what's happening with your applications today.</p>
          </div>
          <div className="flex items-center gap-4">
            <SignOutButton />
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white">
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Action Row */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/builder">
            <GradientButton className="h-10">
              <Plus className="w-4 h-4 mr-2" /> New Resume
            </GradientButton>
          </Link>
          <Link href="/templates">
            <Button variant="outline" className="h-10 bg-white/5 border-white/10 hover:bg-white/10">
              <Upload className="w-4 h-4 mr-2" /> Browse Templates
            </Button>
          </Link>
          <Link href="/ai-tools">
            <Button variant="outline" className="h-10 bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-400">
              <Wand2 className="w-4 h-4 mr-2" /> AI Review
            </Button>
          </Link>
        </div>

        {/* Stats Row — real, derived from your saved resumes */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <GlassCard className="p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Resumes</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold">{loading ? "—" : resumes.length}</div>
          </GlassCard>
          <GlassCard className="p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">This Month</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold">
              {loading ? "—" : resumes.filter((r) => new Date(r.createdAt).getMonth() === new Date().getMonth()).length}
            </div>
          </GlassCard>
          <GlassCard className="p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
              <Download className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-sm font-bold pt-2">
              {loading ? "—" : recent[0] ? new Date(recent[0].updatedAt).toLocaleDateString() : "No resumes yet"}
            </div>
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">My Resumes</h2>
                <Link href="/my-resumes">
                  <Button variant="link" className="text-cyan-400 hover:text-cyan-300">View All</Button>
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : recent.length === 0 ? (
                <GlassCard className="p-8 text-center text-muted-foreground">
                  No resumes yet. <Link href="/templates"><span className="text-blue-400 cursor-pointer">Browse templates</span></Link> to get started.
                </GlassCard>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {recent.map((resume) => (
                    <motion.div key={resume.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                      <GlassCard className="p-4 flex gap-4 group hover:bg-white/[0.08] transition-colors">
                        <div className="w-16 h-20 bg-white rounded flex-shrink-0 shadow-sm relative overflow-hidden flex flex-col">
                          <div className="h-4 w-full bg-indigo-500 opacity-80" />
                          <div className="flex-1 p-2 space-y-1">
                            <div className="h-1 w-full bg-gray-200 rounded" />
                            <div className="h-1 w-3/4 bg-gray-200 rounded" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-sm truncate text-white mb-1">{resume.title}</h3>
                            <p className="text-xs text-muted-foreground">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center justify-end mt-2 gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-white"
                              onClick={() => handleDownload(resume.id, resume.data?.fullName || resume.title)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <Link href={`/builder?resume=${resume.id}`}>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">Resumes Created</h2>
              <GlassCard className="p-6 h-[300px]">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Nothing to chart yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(15, 17, 26, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="resumes" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </GlassCard>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">Quick Links</h2>
              <GlassCard className="p-6 space-y-3">
                <Link href="/templates"><div className="flex items-center gap-3 text-sm hover:text-blue-400 cursor-pointer"><Layout className="w-4 h-4" /> Browse templates</div></Link>
                <Link href="/ai-tools"><div className="flex items-center gap-3 text-sm hover:text-blue-400 cursor-pointer"><Wand2 className="w-4 h-4" /> AI Tools</div></Link>
                <Link href="/my-resumes"><div className="flex items-center gap-3 text-sm hover:text-blue-400 cursor-pointer"><FileText className="w-4 h-4" /> All resumes</div></Link>
              </GlassCard>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}