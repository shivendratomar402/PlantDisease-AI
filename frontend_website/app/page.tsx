"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowDown, ArrowRight, BookOpen, CheckCircle2, ChevronRight, CircleHelp, Clock3, Github, Leaf, Menu, Microscope, ScanLine, ShieldCheck, Sprout, Stethoscope, X } from "lucide-react";
import { UploadDropzone, type PredictionResult } from "./components/UploadDropzone";
import { ResultCard } from "./components/ResultCard";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./components/ThemeProvider";

type HistoryItem = { cls: string; confidence: number; date: string; pathogen: string };

const diseaseGuide = [
  { id:"early", title:"Early blight", pathogen:"Alternaria solani", type:"Fungal disease", tone:"amber", summary:"Often begins on older leaves with brown, dry spots that may show concentric rings (a target-board pattern). Yellowing can develop around lesions.", signs:["Brown to dark-brown circular lesions","Concentric rings in mature spots","Often starts on older, lower leaves"], actions:["Remove heavily affected leaves and crop debris; do not leave infected residues in the field.","Use clean seed tubers and rotate away from potato and other solanaceous crops where practical.","Give plants adequate spacing and avoid prolonged leaf wetness; irrigate near the soil rather than over foliage.","Maintain balanced nutrition and monitor older leaves regularly.","If disease pressure persists, ask a local agricultural officer about a locally registered fungicide and follow its label exactly."], note:"Early blight is favoured by warm conditions and plant stress, including nutrient stress and ageing foliage." },
  { id:"late", title:"Late blight", pathogen:"Phytophthora infestans", type:"Oomycete (water mould)", tone:"rose", summary:"A potentially fast-moving disease. Look for irregular, water-soaked dark green to brown lesions; in humid weather, pale sporulation may appear on leaf undersides.", signs:["Irregular water-soaked patches that turn brown or black","Rapid expansion in cool, wet, humid weather","Whitish growth may appear at lesion margins underneath leaves"], actions:["Treat suspected late blight as urgent: isolate the affected area and seek local agricultural extension advice promptly.","Remove infected plant material carefully and dispose of it according to local guidance; do not move suspect material between fields.","Avoid overhead irrigation and reduce long periods of leaf wetness.","Use certified disease-free seed and locally recommended resistant varieties where available.","Only use products registered for potato late blight in your region; follow label rate, protective equipment, re-entry and pre-harvest intervals."], note:"Late blight is caused by an oomycete, not a true fungus. Outbreaks can spread rapidly under favourable weather." },
  { id:"healthy", title:"Healthy leaf", pathogen:"No disease class detected", type:"Reference condition", tone:"green", summary:"The model did not find a strong visual pattern matching either of its two trained disease classes. Continue routine crop monitoring.", signs:["Mostly even green colour","No obvious expanding necrotic lesions","Normal leaf structure and turgidity"], actions:["Continue regular field scouting, especially after wet weather.","Use clean seed tubers and maintain good field sanitation.","Water consistently and avoid keeping foliage wet for long periods.","Maintain balanced soil fertility based on soil testing where possible.","A healthy prediction does not rule out early infection or diseases outside this model's three classes."], note:"The classifier only distinguishes the three classes it was trained on. It is not a laboratory diagnosis." }
];

export default function HomePage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeGuide, setActiveGuide] = useState("early");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("plantguard_scan_history") || "[]")); }
    catch { setHistory([]); }
  }, []);
  useEffect(() => {
    if (!result) return;
    const item = { cls: result.cls, confidence: result.confidence, pathogen: result.pathogen, date: new Date().toISOString() };
    setHistory(prev => {
      const next = [item, ...prev].slice(0, 20);
      localStorage.setItem("plantguard_scan_history", JSON.stringify(next));
      return next;
    });
  }, [result]);

  const guide = useMemo(() => diseaseGuide.find(d => d.id === activeGuide) || diseaseGuide[0], [activeGuide]);
  const text = dark ? "text-white" : "text-slate-900";
  const muted = dark ? "text-slate-400" : "text-slate-600";
  const panel = dark ? "border-white/10 bg-white/[0.045]" : "border-emerald-950/10 bg-white/85 shadow-[0_20px_70px_rgba(16,75,47,.07)]";

  function onPrediction(data: PredictionResult) { setResult(data); }

  return <main className={`min-h-screen overflow-hidden ${text}`}>
    <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_8%,rgba(16,185,129,.17),transparent_32%),radial-gradient(ellipse_at_88%_18%,rgba(132,204,22,.10),transparent_28%)]" />
    <header className={`sticky top-0 z-40 border-b backdrop-blur-2xl ${dark?"border-white/10 bg-slate-950/75":"border-emerald-950/10 bg-[#f7fbf6]/85"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-700/25"><Leaf size={21}/></span>
          <span><span className="block text-[17px] font-black tracking-tight">PlantGuard <span className="text-emerald-500">AI</span></span><span className={`block text-[9px] font-bold uppercase tracking-[.24em] ${muted}`}>Plant health intelligence</span></span>
        </a>
        <nav className={`hidden items-center gap-8 text-sm font-semibold ${muted} md:flex`}>
          <a className="hover:text-emerald-500" href="#how">How it works</a><a className="hover:text-emerald-500" href="#diseases">Disease library</a><a className="hover:text-emerald-500" href="#about">About</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle/>
          <button onClick={()=>setShowHistory(!showHistory)} className={`rounded-full border px-3 py-2 text-xs font-bold ${panel}`}>Scan history ({history.length})</button>
          <button className="rounded-xl p-2 md:hidden" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu?<X/>:<Menu/>}</button>
        </div>
      </div>
      {mobileMenu && <div className="border-t border-emerald-500/10 px-5 py-4 md:hidden"><div className="flex flex-col gap-4 text-sm font-semibold"><a href="#how" onClick={()=>setMobileMenu(false)}>How it works</a><a href="#diseases" onClick={()=>setMobileMenu(false)}>Disease library</a><a href="#about" onClick={()=>setMobileMenu(false)}>About</a><button className="text-left" onClick={()=>{setShowHistory(true);setMobileMenu(false)}}>Scan history ({history.length})</button></div></div>}
    </header>

    {showHistory && <div className="mx-auto max-w-7xl px-5 pt-5 lg:px-8"><div className={`rounded-2xl border p-5 ${panel}`}><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Your recent scans</h3><button onClick={()=>setShowHistory(false)} className={muted}><X size={18}/></button></div>{history.length? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{history.map((h,i)=><div key={h.date+i} className={`rounded-xl p-3 ${dark?"bg-white/5":"bg-emerald-50"}`}><p className="font-bold">{h.cls} · {h.confidence.toFixed(1)}%</p><p className={`mt-1 text-xs ${muted}`}>{h.pathogen} · {new Date(h.date).toLocaleString()}</p></div>)}</div>:<p className={`text-sm ${muted}`}>No scans saved yet. Analyze a leaf to build your local history.</p>}<p className={`mt-3 text-[11px] ${muted}`}>History is stored in this browser on this device; it is not synced across devices.</p></div></div>}

    <section id="home" className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24 lg:pt-24">
      <div className="relative z-10">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-emerald-500"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"/> AI-powered crop health screening</motion.div>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.08,duration:.7}} className="max-w-3xl text-5xl font-black leading-[1.04] tracking-[-.055em] sm:text-6xl lg:text-[4.65rem]">A healthier harvest <span className="text-emerald-500">starts with a leaf.</span></motion.h1>
        <p className={`mt-6 max-w-xl text-base leading-8 sm:text-lg ${muted}`}>Screen potato leaves for early blight, late blight and healthy foliage with a CNN model. Get a clear result and practical crop-care guidance in one place.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3"><a href="#scanner" className="rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-800/20 transition hover:-translate-y-0.5 hover:bg-emerald-800">Analyze a leaf <ArrowRight size={16} className="ml-2 inline"/></a><a href="#diseases" className={`rounded-full border px-6 py-3.5 text-sm font-bold transition hover:border-emerald-500/50 ${panel}`}>Explore disease guide</a></div>
        <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-emerald-500/15 pt-6"><div><p className="text-2xl font-black text-emerald-500">03</p><p className={`mt-1 text-[11px] font-semibold ${muted}`}>Detection classes</p></div><div><p className="text-2xl font-black text-emerald-500">256²</p><p className={`mt-1 text-[11px] font-semibold ${muted}`}>Model input pixels</p></div><div><p className="text-2xl font-black text-emerald-500">CNN</p><p className={`mt-1 text-[11px] font-semibold ${muted}`}>AI architecture</p></div></div>
      </div>
      <motion.div initial={{opacity:0,scale:.94}} animate={{opacity:1,scale:1}} transition={{delay:.18,duration:.8}} className="relative mx-auto w-full max-w-xl">
        <div className="absolute -inset-5 rounded-[3rem] bg-emerald-500/10 blur-3xl"/><div className={`relative overflow-hidden rounded-[2.3rem] border p-3 shadow-2xl ${panel}`}>
          <div className="relative min-h-[390px] overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-[#0b422e] via-[#126443] to-[#9bbd75] p-7 text-white sm:p-9">
            <div className="absolute -right-16 -top-12 h-72 w-72 rounded-full border border-white/15"/><div className="absolute -right-5 top-8 h-52 w-52 rounded-full border border-white/15"/><div className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-black/30 to-transparent"/>
            <div className="relative z-10 flex items-center justify-between"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em]">Field intelligence</span><Sprout size={22} className="text-lime-200"/></div>
            <div className="relative z-10 mt-14"><p className="text-sm font-medium text-emerald-100">Observe · Understand · Protect</p><p className="mt-3 max-w-xs text-4xl font-black leading-tight tracking-tight">Small signs.<br/>Smarter decisions.</p><p className="mt-4 max-w-xs text-sm leading-6 text-emerald-50/80">A visual screening assistant for potato crop health.</p></div>
            <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-300 text-emerald-950"><ScanLine size={20}/></span><div><p className="text-sm font-bold">Leaf scan ready</p><p className="text-[11px] text-emerald-100/75">CNN image classification</p></div></div><CheckCircle2 className="text-lime-200"/></div>
          </div>
        </div>
        <div className={`absolute -bottom-5 -left-3 rounded-2xl border p-4 shadow-xl sm:-left-8 ${panel}`}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500"><ShieldCheck size={19}/></span><div><p className="text-xs font-black">Evidence-led guidance</p><p className={`mt-0.5 text-[10px] ${muted}`}>Not a substitute for field diagnosis</p></div></div></div>
      </motion.div>
    </section>

    <section id="scanner" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 lg:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.22em] text-emerald-500">01 / AI leaf scanner</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Start with a photo</h2><p className={`mt-2 max-w-xl text-sm leading-6 ${muted}`}>Use a clear, well-lit photo of one potato leaf. The image is sent to the project's existing prediction API for classification.</p></div><div className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${panel}`}><Activity size={14} className="text-emerald-500"/> CNN inference</div></div>
      <div className={`rounded-[2rem] border p-4 sm:p-7 ${panel}`}><UploadDropzone onResult={onPrediction} onLoading={setAnalyzing}/>{analyzing&&<p className="mt-4 text-center text-sm font-semibold text-emerald-500">Analyzing image with the CNN model…</p>}</div>
      <AnimatePresence>{result&&!analyzing&&<motion.div initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mt-8"><div className="mb-5"><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-500">Analysis report</p><h3 className="mt-1 text-2xl font-black">Your screening result</h3></div><ResultCard data={result}/></motion.div>}</AnimatePresence>
    </section>

    <section id="how" className={`scroll-mt-24 border-y py-16 ${dark?"border-white/5 bg-white/[.02]":"border-emerald-950/5 bg-emerald-50/55"}`}><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="text-xs font-black uppercase tracking-[.22em] text-emerald-500">02 / Simple workflow</p><h2 className="mt-2 text-3xl font-black tracking-tight">From leaf photo to insight</h2><div className="mt-9 grid gap-4 md:grid-cols-3">{[{n:"01",icon:<ScanLine/>,title:"Upload a leaf",desc:"Choose a clear JPG, PNG or WebP image of a potato leaf."},{n:"02",icon:<Microscope/>,title:"CNN analyzes",desc:"The FastAPI service resizes and normalizes the image before model inference."},{n:"03",icon:<BookOpen/>,title:"Review guidance",desc:"See the predicted class, model scores and practical disease-management notes."}].map(x=><div key={x.n} className={`rounded-3xl border p-6 ${panel}`}><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500">{x.icon}</span><span className="text-sm font-black text-emerald-500">{x.n}</span></div><h3 className="mt-6 text-lg font-black">{x.title}</h3><p className={`mt-2 text-sm leading-7 ${muted}`}>{x.desc}</p></div>)}</div></div></section>

    <section id="diseases" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.22em] text-emerald-500">03 / Potato disease library</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Know what to look for</h2><p className={`mt-3 text-sm leading-7 ${muted}`}>Learn the common visual signs and integrated management steps for the three classes supported by this classifier.</p></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[.72fr_1.28fr]"><div className="flex flex-col gap-3">{diseaseGuide.map(d=><button key={d.id} onClick={()=>setActiveGuide(d.id)} className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${activeGuide===d.id?"border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-900/5":panel}`}><span><span className="block text-sm font-black">{d.title}</span><span className={`mt-1 block text-xs ${muted}`}>{d.pathogen}</span></span><ChevronRight size={18} className={activeGuide===d.id?"text-emerald-500":"opacity-40"}/></button>)}</div>
      <AnimatePresence mode="wait"><motion.article key={guide.id} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}} className={`rounded-[2rem] border p-6 sm:p-8 ${panel}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-emerald-500">{guide.type}</span><h3 className="mt-4 text-2xl font-black">{guide.title}</h3><p className={`mt-1 text-sm italic ${muted}`}>{guide.pathogen}</p></div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-500"><Leaf size={23}/></span></div><p className={`mt-5 text-sm leading-7 ${muted}`}>{guide.summary}</p><div className="mt-6 grid gap-6 sm:grid-cols-2"><div><h4 className="flex items-center gap-2 text-sm font-black"><CircleHelp size={16} className="text-emerald-500"/> Signs to observe</h4><ul className={`mt-3 space-y-2 text-sm leading-6 ${muted}`}>{guide.signs.map(s=><li key={s} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"/>{s}</li>)}</ul></div><div><h4 className="flex items-center gap-2 text-sm font-black"><Stethoscope size={16} className="text-emerald-500"/> Management & prevention</h4><ul className={`mt-3 space-y-2 text-sm leading-6 ${muted}`}>{guide.actions.map(s=><li key={s} className="flex gap-2"><CheckCircle2 size={15} className="mt-1 shrink-0 text-emerald-500"/>{s}</li>)}</ul></div></div><div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[.07] p-4"><p className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-300">Important field note</p><p className={`mt-1 text-sm leading-6 ${muted}`}>{guide.note}</p></div></motion.article></AnimatePresence></div>
    </section>

    <section id="about" className={`scroll-mt-24 border-y py-16 ${dark?"border-white/5 bg-white/[.02]":"border-emerald-950/5 bg-emerald-50/55"}`}><div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8"><div><p className="text-xs font-black uppercase tracking-[.22em] text-emerald-500">04 / About the project</p><h2 className="mt-2 text-3xl font-black tracking-tight">Biotechnology meets machine learning.</h2><p className={`mt-4 text-sm leading-7 ${muted}`}>PlantGuard AI is a potato leaf image-screening mini-project. Its frontend uses Next.js, the prediction service uses FastAPI, and a trained convolutional neural network classifies images into Early Blight, Late Blight or Healthy.</p></div><div className="grid grid-cols-2 gap-3">{[{t:"Frontend",v:"Next.js 14 · TypeScript"},{t:"API",v:"FastAPI · Python"},{t:"AI model",v:"Convolutional Neural Network"},{t:"Input",v:"RGB leaf image · 256 × 256"}].map(x=><div key={x.t} className={`rounded-2xl border p-4 ${panel}`}><p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-500">{x.t}</p><p className="mt-2 text-sm font-bold">{x.v}</p></div>)}</div></div></section>

    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs sm:flex-row sm:items-center sm:justify-between lg:px-8"><div className="flex items-center gap-2 font-bold"><Leaf size={16} className="text-emerald-500"/> PlantGuard AI <span className={muted}>· Biotechnology mini-project</span></div><p className={`max-w-2xl leading-5 ${muted}`}>AI screening is not a confirmed diagnosis. Image quality, lighting and diseases outside the model's training classes can affect results. Confirm suspected disease with a qualified agricultural expert.</p></footer>
  </main>;
}
