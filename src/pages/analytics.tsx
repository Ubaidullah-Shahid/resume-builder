import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { GlassCard } from "@/components/ui/glass-card";
import { FileText, Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/use-auth";

const API_URL = "http://localhost:4000/api";

interface Resume {
  id: string;
  title: string;
  data: { experience?: any[]; education?: any[] };
  createdAt: string;
}

export default function Analytics() {
  const { token } = useAuth();
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

  const totalExperience = resumes.reduce((sum, r) => sum + (r.data?.experience?.length || 0), 0);
  const totalEducation = resumes.reduce((sum, r) => sum + (r.data?.education?.length || 0), 0);

  const byMonth: Record<string, number> = {};
  resumes.forEach((r) => {
    const key = new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const chartData = Object.entries(byMonth).map(([name, count]) => ({ name, count }));

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 ml-[64px] md:ml-[260px] p-6 md:p-8 max-w-[1600px]">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : resumes.length === 0 ? (
          <GlassCard className="p-10 text-center text-muted-foreground">
            Save a resume first — analytics are based on your real data, so there's nothing to show yet.
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <GlassCard className="p-5 flex items-center gap-4">
                <FileText className="w-8 h-8 text-indigo-400" />
                <div>
                  <div className="text-2xl font-bold">{resumes.length}</div>
                  <div className="text-xs text-muted-foreground">Total resumes</div>
                </div>
              </GlassCard>
              <GlassCard className="p-5 flex items-center gap-4">
                <Briefcase className="w-8 h-8 text-cyan-400" />
                <div>
                  <div className="text-2xl font-bold">{totalExperience}</div>
                  <div className="text-xs text-muted-foreground">Experience entries</div>
                </div>
              </GlassCard>
              <GlassCard className="p-5 flex items-center gap-4">
                <GraduationCap className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-2xl font-bold">{totalEducation}</div>
                  <div className="text-xs text-muted-foreground">Education entries</div>
                </div>
              </GlassCard>
            </div>

            <GlassCard className="p-6 h-[300px]">
              <h2 className="font-semibold mb-4">Resumes created over time</h2>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(15,17,26,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </>
        )}
      </main>
    </div>
  );
}