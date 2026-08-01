import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Send, Sparkles, Lock, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

const API_URL = "http://localhost:4000/api";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const QUICK_ACTIONS = [
  { label: "Generate Summary", prompt: "Write a professional 3-sentence resume summary for a software engineer with 5 years of experience." },
  { label: "Improve Skills", prompt: "Suggest 8 relevant technical skills to list on a software engineer resume in 2026." },
  { label: "Write Cover Letter", prompt: "Write a short, compelling cover letter opening paragraph for a Senior Product Manager role." },
  { label: "Fix Grammar", prompt: "Fix the grammar in this sentence: 'Managed a team of developers and launched a new app feature.'" },
];

export default function AiTools() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your AI Resume Assistant. Ask me to write summaries, improve bullet points, or generate a cover letter." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/ai/credits`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((body) => setCredits(body.aiCredits))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      });
      const body = await res.json();

      if (res.status === 402) {
        setCredits(0);
        window.dispatchEvent(new Event("credits-changed"));
        return;
      }
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${body.error || "Something went wrong."}` }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", text: body.reply }]);
      setCredits(body.aiCredits);
      window.dispatchEvent(new Event("credits-changed"));
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Network error: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  const outOfCredits = credits === 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main className="flex-1 ml-[64px] md:ml-[260px] p-6 md:p-8 flex flex-col h-screen">
        <header className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">ResumeAI Assistant</h1>
          </div>
          <div className="text-sm font-medium bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            Credits: {credits ?? "…"}/50
          </div>
        </header>

        {outOfCredits ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <Lock className="w-10 h-10 text-muted-foreground" />
            <h2 className="text-xl font-bold">You're out of AI credits</h2>
            <p className="text-muted-foreground max-w-sm">
              You've used all 50 of your AI credits. Upgrade your plan to keep using the assistant.
            </p>
            <Link href="/settings">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Update your plan</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-lg ${m.role === "user" ? "ml-auto" : ""}`}>
                  <div className="text-xs text-muted-foreground mb-1">{m.role === "user" ? "You" : "ResumeAI"}</div>
                  <div
                    className={`p-4 rounded-xl text-sm whitespace-pre-wrap ${
                      m.role === "user" ? "bg-blue-600 text-white" : "bg-white/5 border border-white/10"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="max-w-lg">
                  <div className="text-xs text-muted-foreground mb-1">ResumeAI</div>
                  <div className="inline-flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="relative w-9 h-9 shrink-0">
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      <div className="relative w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary animate-[wiggle_1.2s_ease-in-out_infinite]" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">Thinking</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="flex flex-wrap gap-2 mb-3 shrink-0">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => send(a.prompt)}
                  disabled={sending}
                  className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/10 disabled:opacity-50"
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask AI to write, improve, or review…"
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm"
              />
              <Button
                size="icon"
                onClick={() => send(input)}
                disabled={sending}
                className="rounded-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              AI can make mistakes. Consider verifying important information.
            </p>
          </>
        )}
      </main>
    </div>
  );
}