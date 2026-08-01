import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Sparkles,
  Clock,
  FolderKanban,
  Target,
  Check,
  Star,
} from "lucide-react";
import { ParticleNetworkBg } from "@/components/particle-network-bg";

const img = (id: string, w = 600, h = 750) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const TEMPLATE_PHOTOS = [
  "photo-1560250097-0b93528c311a",
  "photo-1519085360753-af0119f7cbe7",
  "photo-1544725176-7c40e5a71c5e",
];

const TESTIMONIALS = [
  {
    photo: "photo-1472099645785-5658abf4ff4e",
    quote:
      "I hadn't touched my resume in four years. The templates made it easy to look current again, and I heard back from three companies in the first week.",
    name: "Stephan H.",
    role: "Junior Sales Manager · 3 years experience · Texas",
  },
  {
    photo: "photo-1494790108377-be9c29b29330",
    quote:
      "Applying for jobs takes a lot of time. This helped me manage one resume and tailor new versions per role in minutes instead of hours.",
    name: "Erica Jane",
    role: "PR & Communications · 16 years experience · Boston",
  },
  {
    photo: "photo-1438761681033-6461ffad8d80",
    quote:
      "I'd genuinely never built a resume before. The step-by-step process meant I didn't have to guess what belonged where.",
    name: "Peter S.",
    role: "Senior Logistics Manager · 21 years experience · Amsterdam",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Grab attention",
    body: "Choose from professionally designed templates built to stand out to a hiring manager in seconds, not minutes.",
  },
  {
    icon: Clock,
    title: "Save time",
    body: "Answer a few guided questions and the layout, spacing, and formatting are handled for you.",
  },
  {
    icon: FolderKanban,
    title: "Manage resumes",
    body: "Keep every version in one place. Duplicate and retarget a resume for a new role in seconds.",
  },
  {
    icon: Target,
    title: "Get results",
    body: "Every template is formatted to be read cleanly by the applicant tracking systems recruiters actually use.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us who you are",
    body: "Name, contact details, and the role you're aiming for. Nothing here is ever made public.",
  },
  {
    n: "02",
    title: "Add your experience",
    body: "Education, work history, and skills — reorder sections and add as much or as little detail as you want.",
  },
  {
    n: "03",
    title: "Download and apply",
    body: "Pick a template, preview it live, and export a clean PDF ready to send.",
  },
];

/* Subtle hover-lift, not a full 3D tilt — matches a lighter SaaS feel */
function LiftCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

function TiltPhoto({ id, className = "" }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setStyle({
      transform: `perspective(800px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg) translateY(-4px)`,
    });
  }

  function onLeave() {
    setStyle({ transform: "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ...style, transition: "transform 0.15s ease-out" }}
      className={className}
    >
      <img src={img(id, 500, 640)} alt="" className="w-full h-full object-cover" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ---------------- Nav ---------------- */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur z-30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg text-slate-900">
            Resume<span className="text-blue-600">AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/templates"><span className="hover:text-blue-600 cursor-pointer transition-colors">Templates</span></Link>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <span className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer transition-colors">
                Sign in
              </span>
            </Link>
            <Link href="/builder">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
                Create my resume
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      {/* ---------------- Hero ---------------- */}
<section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 to-white">
  <ParticleNetworkBg color="#2563eb" particleCount={90} maxDistance={8} />
  <div className="container mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-14 items-center relative z-10">
      
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Star size={12} fill="currentColor" /> Trusted by job seekers worldwide
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1] mb-5 text-slate-900">
              Build your resume<br />in minutes.
            </h1>
            <p className="text-lg text-slate-600 max-w-md mb-8 leading-relaxed">
              Answer a few simple questions and get a professional, ATS-friendly
              resume — formatted, proofread, and ready to send.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link href="/builder">
                <button className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-full transition-colors">
                  Create my resume
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/templates">
                <button className="font-semibold px-7 py-3.5 rounded-full border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                  Browse templates
                </button>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {TESTIMONIALS.map((t) => (
                  <div key={t.name} className="w-7 h-7 rounded-full overflow-hidden border-2 border-white">
                    <img src={img(t.photo, 60, 60)} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span>Joined by 1M+ people building their resume today</span>
            </div>
          </div>

          {/* Fanned template preview cards */}
          <div className="relative h-[420px] hidden lg:block">
            {TEMPLATE_PHOTOS.map((id, i) => (
              <div
                key={id}
                className="absolute left-1/2 top-8"
                style={{
                  transform: `translateX(-50%) translateX(${(i - 1) * 130}px) rotate(${(i - 1) * 6}deg)`,
                  zIndex: i === 1 ? 3 : 1,
                }}
              >
                <TiltPhoto
                  id={id}
                  className="w-[220px] aspect-[3/4] rounded-xl overflow-hidden shadow-xl border border-slate-100 bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <section className="border-y border-slate-100 py-8">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs font-semibold tracking-wide text-slate-400 uppercase mb-6">
            Trusted by people who went on to work at
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-slate-300 font-bold text-xl">
            <span>Nimbus</span>
            <span>Veridian</span>
            <span>Northfield</span>
            <span>Arcadia Labs</span>
            <span>Coastline Co.</span>
          </div>
        </div>
      </section>

      {/* ---------------- Why use it ---------------- */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Why use ResumeAI for your next resume?</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <LiftCard key={f.title}>
              <div className="h-full border border-slate-100 rounded-2xl p-6 bg-white">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.body}</p>
              </div>
            </LiftCard>
          ))}
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how-it-works" className="bg-slate-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How does ResumeAI work?</h2>
            <p className="text-slate-600">Three steps, and a finished resume at the end of it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {STEPS.map((s) => (
              <div key={s.n} className="relative bg-white border border-slate-100 rounded-2xl p-7">
                <div className="text-4xl font-extrabold text-blue-100 mb-3">{s.n}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section id="testimonials" className="container mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">What our customers say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <LiftCard key={t.name}>
              <div className="h-full border border-slate-100 rounded-2xl p-7 bg-white">
                <div className="flex gap-0.5 text-amber-400 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden">
                    <img src={img(t.photo, 80, 80)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            </LiftCard>
          ))}
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="bg-blue-600">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to build a resume that gets read?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Free to start. No credit card. Download your first resume today.
          </p>
          <Link href="/builder">
            <button className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-7 py-3.5 rounded-full hover:bg-blue-50 transition-colors">
              <Check size={16} /> Create my resume
            </button>
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-100">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>© {new Date().getFullYear()} ResumeAI</div>
          <div>Templates crafted for real hiring formats.</div>
        </div>
      </footer>
    </div>
  );
}
