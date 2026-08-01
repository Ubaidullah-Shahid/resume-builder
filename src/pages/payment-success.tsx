import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const API_URL = "http://localhost:4000/api";

export default function PaymentSuccess() {
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session_id");
  const templateId = new URLSearchParams(search).get("template");
  const [, navigate] = useLocation();
  const { token } = useAuth();
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "error">("checking");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      const res = await fetch(`${API_URL}/payments/confirm/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();

      if (body.status === "paid") {
        clearInterval(interval);
        setStatus("paid");

        const templateRes = await fetch(`${API_URL}/templates`);
        const templateBody = await templateRes.json();
        const template = templateBody.templates.find((t: any) => t.id === templateId);

        const resumeRes = await fetch(`${API_URL}/resumes`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: template?.name || "New resume", data: template?.content || {} }),
        });
        const resumeBody = await resumeRes.json();
        navigate(`/builder?resume=${resumeBody.resume.id}`);
        return;
      }

      if (attempts > 10) {
        clearInterval(interval);
        setStatus("pending");
      }
    }, 1500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="text-center">
        {status === "checking" && (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
            <p>Confirming your payment…</p>
          </>
        )}
        {status === "pending" && (
          <>
            <Loader2 className="w-10 h-10 mx-auto mb-4 text-amber-500" />
            <p>Still processing — this can take a minute. Check "My Resumes" shortly.</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
            <p>Something went wrong confirming this payment.</p>
          </>
        )}
        {status === "paid" && (
          <>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-emerald-500" />
            <p>Payment confirmed — opening your resume…</p>
          </>
        )}
      </div>
    </div>
  );
}