import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "framer-motion";
import { Check, Loader2, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const API_URL = "http://localhost:4000/api";

interface DbTemplate {
  id: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  isActive: boolean;
  content: any;
}

export default function Templates() {
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/templates`);
        if (!res.ok) throw new Error("Could not load templates.");
        const body = await res.json();
        setTemplates(body.templates);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function useTemplate(t: DbTemplate) {
    setBusyId(t.id);
    try {
      if (t.price > 0) {
        const checkRes = await fetch(`${API_URL}/payments/check/${t.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const checkBody = await checkRes.json();

        if (!checkBody.purchased) {
          const checkoutRes = await fetch(`${API_URL}/payments/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ templateId: t.id }),
          });
          const checkoutBody = await checkoutRes.json();
          if (!checkoutRes.ok) {
            alert("Couldn't start checkout: " + (checkoutBody.error || "Unknown error"));
            return;
          }
          window.location.href = checkoutBody.url;
          return;
        }
      }

      const res = await fetch(`${API_URL}/resumes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: t.name, data: t.content }),
      });
      const body = await res.json();
      if (!res.ok) {
        alert("Couldn't create your resume: " + (body.error || "Unknown error"));
        return;
      }
      navigate(`/builder?resume=${body.resume.id}`);
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main className="flex-1 ml-[64px] md:ml-[260px] p-6 md:p-12 max-w-[1600px]">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] mb-3">Choose Your Template</h1>
          <p className="text-muted-foreground text-lg">Start with a professionally designed layout, then customize it to match your personal brand.</p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading templates…
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && templates.length === 0 && (
          <p className="text-muted-foreground">No templates available yet — check back soon.</p>
        )}

        {!loading && !error && templates.length > 0 && (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group relative"
              >
                <div className="aspect-[1/1.4] bg-white rounded-xl mb-4 overflow-hidden relative shadow-lg border border-white/10">
                  {template.thumbnailUrl ? (
                    <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
                      No preview
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <GradientButton
                      className="h-9 text-xs"
                      onClick={() => useTemplate(template)}
                      disabled={busyId === template.id}
                    >
                      {busyId === template.id ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : template.price > 0 ? (
                        <Lock className="w-3.5 h-3.5 mr-1.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {template.price > 0 ? "Unlock & use" : "Use this template"}
                    </GradientButton>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-semibold text-sm">{template.name}</h3>
                  <span className={`text-sm font-bold ${template.price > 0 ? "text-primary" : "text-emerald-400"}`}>
                    {template.price > 0 ? `$${template.price.toFixed(2)}` : "Free"}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}