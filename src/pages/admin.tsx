import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trash2, Plus, Users, FileText, LogIn, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { SignOutButton } from "@/components/sign-out-button";

const API_URL = "http://localhost:4000/api";

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  resumeCount: number;
}

interface Template {
  id: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  isActive: boolean;
  content: any;
}

interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  templateName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Stats {
  totalCustomers: number;
  loggedInToday: number;
  totalResumes: number;
}

export default function AdminPortal() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newTemplate, setNewTemplate] = useState({ name: "", price: "", thumbnailUrl: "" });
  const [openContentId, setOpenContentId] = useState<string | null>(null);
  const [contentDrafts, setContentDrafts] = useState<Record<string, string>>({});
  const [contentErrors, setContentErrors] = useState<Record<string, string>>({});

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [statsRes, customersRes, templatesRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/customers`, { headers }),
        fetch(`${API_URL}/admin/templates`, { headers }),
        fetch(`${API_URL}/admin/payments`, { headers }),
      ]);
      if (!statsRes.ok || !customersRes.ok || !templatesRes.ok || !paymentsRes.ok) {
        throw new Error("Failed to load admin data. Confirm your account has admin role.");
      }
      setStats(await statsRes.json());
      setCustomers((await customersRes.json()).customers);
      setTemplates((await templatesRes.json()).templates);
      setPayments((await paymentsRes.json()).payments);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteCustomer(id: string) {
    if (!confirm("Delete this customer and all their resumes? This cannot be undone.")) return;
    await fetch(`${API_URL}/admin/customers/${id}`, { method: "DELETE", headers });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  async function addTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTemplate.name) return;

    try {
      const res = await fetch(`${API_URL}/admin/templates`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: newTemplate.name,
          price: Number(newTemplate.price) || 0,
          thumbnailUrl: newTemplate.thumbnailUrl,
        }),
      });
      const body = await res.json();

      if (!res.ok) {
        alert("Failed to add template: " + (body.error || "Unknown error"));
        return;
      }

      setTemplates((prev) => [body.template, ...prev]);
      setNewTemplate({ name: "", price: "", thumbnailUrl: "" });
    } catch (err: any) {
      alert("Network error: " + err.message);
    }
  }

  async function updateTemplateField(id: string, field: "name" | "price" | "thumbnailUrl", value: string | number) {
    try {
      const res = await fetch(`${API_URL}/admin/templates/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ [field]: value }),
      });
      const body = await res.json();
      if (!res.ok) {
        alert("Failed to update template: " + (body.error || "Unknown error"));
        return;
      }
      setTemplates((prev) => prev.map((t) => (t.id === id ? body.template : t)));
    } catch (err: any) {
      alert("Network error: " + err.message);
    }
  }

  async function toggleTemplateActive(id: string, isActive: boolean) {
    const res = await fetch(`${API_URL}/admin/templates/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ isActive }),
    });
    const body = await res.json();
    setTemplates((prev) => prev.map((t) => (t.id === id ? body.template : t)));
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`${API_URL}/admin/templates/${id}`, { method: "DELETE", headers });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  function openContentEditor(t: Template) {
    setOpenContentId(t.id);
    setContentDrafts((prev) => ({ ...prev, [t.id]: JSON.stringify(t.content, null, 2) }));
    setContentErrors((prev) => ({ ...prev, [t.id]: "" }));
  }

  async function saveContent(id: string) {
    const draft = contentDrafts[id];
    let parsed: any;
    try {
      parsed = JSON.parse(draft);
    } catch {
      setContentErrors((prev) => ({ ...prev, [id]: "That's not valid JSON — check for a missing comma or quote." }));
      return;
    }
    const res = await fetch(`${API_URL}/admin/templates/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ content: parsed }),
    });
    const body = await res.json();
    if (!res.ok) {
      setContentErrors((prev) => ({ ...prev, [id]: body.error || "Failed to save." }));
      return;
    }
    setTemplates((prev) => prev.map((t) => (t.id === id ? body.template : t)));
    setOpenContentId(null);
  }

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Loading admin data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/dashboard"><span className="text-blue-600 cursor-pointer">Back to dashboard</span></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard"><ArrowLeft className="w-5 h-5 cursor-pointer" /></Link>
            <h1 className="font-bold text-lg">Admin Portal</h1>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-10">
        <section className="grid sm:grid-cols-4 gap-4">
          <div className="border border-border rounded-xl p-5 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2"><Users className="w-4 h-4" /> Total customers</div>
            <div className="text-3xl font-bold">{stats?.totalCustomers ?? 0}</div>
          </div>
          <div className="border border-border rounded-xl p-5 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2"><LogIn className="w-4 h-4" /> Logged in today</div>
            <div className="text-3xl font-bold">{stats?.loggedInToday ?? 0}</div>
          </div>
          <div className="border border-border rounded-xl p-5 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2"><FileText className="w-4 h-4" /> Total resumes</div>
            <div className="text-3xl font-bold">{stats?.totalResumes ?? 0}</div>
          </div>
          <div className="border border-border rounded-xl p-5 bg-card">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2"><DollarSign className="w-4 h-4" /> Revenue (paid)</div>
            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Customers</h2>
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Resumes</th>
                  <th className="p-3 font-medium">Last login</th>
                  <th className="p-3 font-medium">Joined</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No customers yet.</td></tr>
                )}
                {customers.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.resumeCount}</td>
                    <td className="p-3">{c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleString() : "Never"}</td>
                    <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button onClick={() => deleteCustomer(c.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Payments</h2>
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Template</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No payments yet.</td></tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3">{p.customerName}</td>
                    <td className="p-3">{p.customerEmail}</td>
                    <td className="p-3">{p.templateName}</td>
                    <td className="p-3 font-medium">${p.amount.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          p.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Templates &amp; pricing</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Click a field to edit name/thumbnail/price. Use "Edit content" to set the
            starter resume content a customer gets when they click "Use this template."
          </p>

          <form onSubmit={addTemplate} className="flex flex-wrap gap-3 mb-5">
            <input
              placeholder="Template name"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate((s) => ({ ...s, name: e.target.value }))}
              className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
            />
            <input
              placeholder="Price"
              type="number"
              value={newTemplate.price}
              onChange={(e) => setNewTemplate((s) => ({ ...s, price: e.target.value }))}
              className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm w-28"
            />
            <input
              placeholder="Thumbnail URL (optional)"
              value={newTemplate.thumbnailUrl}
              onChange={(e) => setNewTemplate((s) => ({ ...s, thumbnailUrl: e.target.value }))}
              className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
            />
            <button type="submit" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Thumbnail URL</th>
                  <th className="p-3 font-medium">Price ($)</th>
                  <th className="p-3 font-medium">Active</th>
                  <th className="p-3 font-medium">Content</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No templates yet — add one above.</td></tr>
                )}
                {templates.map((t) => (
                  <>
                    <tr key={t.id} className="border-t border-border">
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={t.name}
                          onBlur={(e) => {
                            if (e.target.value !== t.name) updateTemplateField(t.id, "name", e.target.value);
                          }}
                          className="border border-border bg-background text-foreground rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          defaultValue={t.thumbnailUrl}
                          placeholder="No thumbnail"
                          onBlur={(e) => {
                            if (e.target.value !== t.thumbnailUrl) updateTemplateField(t.id, "thumbnailUrl", e.target.value);
                          }}
                          className="border border-border bg-background text-foreground rounded px-2 py-1 w-full text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={t.price}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val !== t.price) updateTemplateField(t.id, "price", val);
                          }}
                          className="border border-border bg-background text-foreground rounded px-2 py-1 w-24 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={t.isActive}
                          onChange={(e) => toggleTemplateActive(t.id, e.target.checked)}
                        />
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => (openContentId === t.id ? setOpenContentId(null) : openContentEditor(t))}
                          className="text-blue-500 hover:text-blue-600 text-xs font-medium"
                        >
                          {openContentId === t.id ? "Close" : "Edit content"}
                        </button>
                      </td>
                      <td className="p-3">
                        <button onClick={() => deleteTemplate(t.id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {openContentId === t.id && (
                      <tr className="border-t border-border bg-muted/30">
                        <td colSpan={6} className="p-4">
                          <p className="text-xs text-muted-foreground mb-2">
                            Raw JSON — same shape as a saved resume (fullName, title, summary, experience[], education[], skills[]).
                          </p>
                          <textarea
                            value={contentDrafts[t.id] ?? ""}
                            onChange={(e) => setContentDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))}
                            rows={12}
                            className="w-full font-mono text-xs border border-border bg-background text-foreground rounded-lg p-3"
                          />
                          {contentErrors[t.id] && <p className="text-red-500 text-xs mt-1">{contentErrors[t.id]}</p>}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => saveContent(t.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                            >
                              Save content
                            </button>
                            <button
                              onClick={() => setOpenContentId(null)}
                              className="text-xs font-medium text-muted-foreground px-4 py-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}