import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { ArrowLeft, Plus, Trash2, Download, Loader2, Check } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";

const API_URL = "http://localhost:4000/api";

interface ExperienceEntry {
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
}

interface EducationEntry {
  school: string;
  degree: string;
  start: string;
  end: string;
}

interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
}

const BLANK: ResumeData = {
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  experience: [],
  education: [],
  skills: [],
};

export default function Builder() {
  const search = useSearch();
  const resumeId = new URLSearchParams(search).get("resume");
  const { token } = useAuth();

  const [id, setId] = useState<string | null>(resumeId);
  const [title, setTitle] = useState("Untitled resume");
  const [data, setData] = useState<ResumeData>(BLANK);
  const [loading, setLoading] = useState(!!resumeId);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [skillsInput, setSkillsInput] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (!resumeId) return;
    async function load() {
      try {
        const res = await fetch(`${API_URL}/resumes/${resumeId}`, { headers: { Authorization: `Bearer ${token}` } });
        const body = await res.json();
        if (!res.ok) {
          alert("Couldn't load this resume: " + (body.error || "Unknown error"));
          return;
        }
        setTitle(body.resume.title);
        setData({ ...BLANK, ...body.resume.data });
        setSkillsInput((body.resume.data.skills || []).join(", "));
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { title, data: { ...data, skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean) } };

      if (id) {
        const res = await fetch(`${API_URL}/resumes/${id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Save failed");
      } else {
        const res = await fetch(`${API_URL}/resumes`, { method: "POST", headers, body: JSON.stringify(payload) });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Save failed");
        setId(body.resume.id);
        window.history.replaceState(null, "", `/builder?resume=${body.resume.id}`);
      }
      setSavedAt(new Date());
    } catch (err: any) {
      alert("Couldn't save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    if (!id) {
      alert("Save the resume first, then you can export a PDF.");
      return;
    }
    const res = await fetch(`${API_URL}/resumes/${id}/export.pdf`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      alert("Export failed.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.fullName || "resume"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function updateField<K extends keyof ResumeData>(field: K, value: ResumeData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function addExperience() {
    updateField("experience", [...data.experience, { company: "", role: "", start: "", end: "", bullets: [""] }]);
  }

  function updateExperience(index: number, field: keyof ExperienceEntry, value: string | string[]) {
    const next = [...data.experience];
    next[index] = { ...next[index], [field]: value };
    updateField("experience", next);
  }

  function removeExperience(index: number) {
    updateField("experience", data.experience.filter((_, i) => i !== index));
  }

  function addEducation() {
    updateField("education", [...data.education, { school: "", degree: "", start: "", end: "" }]);
  }

  function updateEducation(index: number, field: keyof EducationEntry, value: string) {
    const next = [...data.education];
    next[index] = { ...next[index], [field]: value };
    updateField("education", next);
  }

  function removeEducation(index: number) {
    updateField("education", data.education.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F7F9FC] text-slate-500 gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading resume…
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#F7F9FC] text-slate-900 overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="font-bold hidden md:block shrink-0 text-slate-900">
            Resume<span className="text-blue-600">AI</span>
          </div>
          <div className="h-6 w-px bg-slate-200 hidden md:block mx-2" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-500 text-sm font-medium w-64 px-2 text-slate-900"
          />
          {savedAt && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase text-emerald-600">
              <Check className="w-3 h-3" /> Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="outline"
            className="h-8 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
            Save
          </Button>
          <Button onClick={handleExport} className="h-8 text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-3.5 h-3.5 mr-2" /> Download PDF
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Center Panel: Editor */}
          <Panel defaultSize={55} minSize={30}>
            <div className="h-full overflow-y-auto p-6 md:p-8 bg-[#F7F9FC]">
              <div className="max-w-2xl mx-auto space-y-4">
                <Accordion type="multiple" defaultValue={["personal", "summary", "experience"]} className="space-y-4">

                  <AccordionItem value="personal" className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-lg font-semibold text-slate-900">
                      Personal Info
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label className="text-slate-600">Full name</Label>
                          <Input value={data.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label className="text-slate-600">Title</Label>
                          <Input value={data.title} onChange={(e) => updateField("title", e.target.value)} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label className="text-slate-600">Email</Label>
                          <Input value={data.email} onChange={(e) => updateField("email", e.target.value)} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label className="text-slate-600">Phone</Label>
                          <Input value={data.phone} onChange={(e) => updateField("phone", e.target.value)} className="bg-white border-slate-200" />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label className="text-slate-600">Location</Label>
                          <Input value={data.location} onChange={(e) => updateField("location", e.target.value)} className="bg-white border-slate-200" />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="summary" className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-lg font-semibold text-slate-900">
                      Professional Summary
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-6">
                      <Textarea
                        value={data.summary}
                        onChange={(e) => updateField("summary", e.target.value)}
                        className="min-h-[120px] bg-white border-slate-200 resize-none leading-relaxed text-slate-700"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="experience" className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-lg font-semibold text-slate-900">
                      Work Experience
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-6 space-y-6">
                      {data.experience.map((job, i) => (
                        <div key={i} className="p-4 border border-slate-200 rounded-lg bg-[#FAFBFD] relative">
                          <button
                            onClick={() => removeExperience(i)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                              <Label className="text-slate-600">Job Title</Label>
                              <Input value={job.role} onChange={(e) => updateExperience(i, "role", e.target.value)} className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                              <Label className="text-slate-600">Company</Label>
                              <Input value={job.company} onChange={(e) => updateExperience(i, "company", e.target.value)} className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-600">Start</Label>
                              <Input value={job.start} onChange={(e) => updateExperience(i, "start", e.target.value)} className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-600">End</Label>
                              <Input value={job.end} onChange={(e) => updateExperience(i, "end", e.target.value)} className="bg-white border-slate-200" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-600">Bullet points (one per line)</Label>
                            <Textarea
                              value={job.bullets.join("\n")}
                              onChange={(e) => updateExperience(i, "bullets", e.target.value.split("\n"))}
                              className="min-h-[100px] bg-white border-slate-200 resize-none text-slate-700"
                            />
                          </div>
                        </div>
                      ))}
                      <Button onClick={addExperience} variant="outline" className="w-full border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
                        <Plus className="w-4 h-4 mr-2" /> Add Experience
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="education" className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-lg font-semibold text-slate-900">
                      Education
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-6 space-y-6">
                      {data.education.map((ed, i) => (
                        <div key={i} className="p-4 border border-slate-200 rounded-lg bg-[#FAFBFD] relative">
                          <button
                            onClick={() => removeEducation(i)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                              <Label className="text-slate-600">School</Label>
                              <Input value={ed.school} onChange={(e) => updateEducation(i, "school", e.target.value)} className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                              <Label className="text-slate-600">Degree</Label>
                              <Input value={ed.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-600">Start</Label>
                              <Input value={ed.start} onChange={(e) => updateEducation(i, "start", e.target.value)} className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-600">End</Label>
                              <Input value={ed.end} onChange={(e) => updateEducation(i, "end", e.target.value)} className="bg-white border-slate-200" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button onClick={addEducation} variant="outline" className="w-full border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600">
                        <Plus className="w-4 h-4 mr-2" /> Add Education
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="skills" className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 text-lg font-semibold text-slate-900">
                      Skills
                    </AccordionTrigger>
                    <AccordionContent className="p-6 pt-6">
                      <Label className="text-slate-600 mb-2 block">Comma-separated</Label>
                      <Input
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="Figma, Design Systems, User Research"
                        className="bg-white border-slate-200"
                      />
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-slate-100 hover:bg-blue-300 transition-colors cursor-col-resize hidden lg:block" />

          {/* Right Panel: Live Preview */}
          <Panel defaultSize={45} minSize={30} className="bg-slate-100 border-l border-slate-200 hidden lg:block relative">
            <div className="absolute inset-0 overflow-y-auto p-8 flex justify-center items-start">
              <div className="w-full max-w-[794px] min-h-[1123px] bg-white text-black shadow-2xl origin-top sm:scale-[0.8] xl:scale-[0.9] 2xl:scale-100 transition-transform font-sans">
                <div className="flex flex-col h-full">
                  <header className="px-10 pt-10 pb-6 border-b-2 border-gray-100">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 uppercase">{data.fullName || "Your Name"}</h1>
                    <h2 className="text-xl text-blue-600 font-medium mt-1">{data.title || "Your Title"}</h2>
                    <div className="flex gap-3 mt-3 text-sm text-gray-500 font-medium flex-wrap">
                      {data.email && <span>{data.email}</span>}
                      {data.phone && <span>• {data.phone}</span>}
                      {data.location && <span>• {data.location}</span>}
                    </div>
                  </header>

                  <div className="p-10 space-y-8">
                    {data.summary && (
                      <section>
                        <h3 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-3 border-b border-gray-200 pb-2">Summary</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
                      </section>
                    )}

                    {data.experience.length > 0 && (
                      <section>
                        <h3 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-3 border-b border-gray-200 pb-2">Experience</h3>
                        {data.experience.map((job, i) => (
                          <div key={i} className="mb-5">
                            <div className="flex justify-between items-baseline mb-1">
                              <h4 className="font-bold text-gray-900 text-base">{job.role}</h4>
                              <span className="text-xs font-semibold text-gray-500">{job.start} – {job.end}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-600 mb-2">{job.company}</div>
                            <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                              {job.bullets.filter(Boolean).map((b, bi) => <li key={bi}>{b}</li>)}
                            </ul>
                          </div>
                        ))}
                      </section>
                    )}

                    {data.education.length > 0 && (
                      <section>
                        <h3 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-3 border-b border-gray-200 pb-2">Education</h3>
                        {data.education.map((ed, i) => (
                          <div key={i} className="mb-3">
                            <h4 className="font-bold text-gray-800 text-sm">{ed.school}</h4>
                            <p className="text-xs text-gray-600">{ed.degree} · {ed.start} – {ed.end}</p>
                          </div>
                        ))}
                      </section>
                    )}

                    {skillsInput && (
                      <section>
                        <h3 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-3 border-b border-gray-200 pb-2">Skills</h3>
                        <p className="text-sm text-gray-700">{skillsInput}</p>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}