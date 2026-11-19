"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, ClipboardCheck, Download, Droplets, Eye, Leaf, Microscope, ScanLine, ShieldCheck, Sparkles, Sprout, Stethoscope, Sun, Target } from "lucide-react";
import type { PredictionResult } from "./UploadDropzone";

type Tab = "care" | "symptoms" | "prevention";
interface Props { data: PredictionResult }

const care: Record<string, { intro: string; signs: string[]; prevention: string[]; steps: { title: string; detail: string }[]; insight: string }> = {
  "Early Blight": {
    intro: "Brown, ring-shaped spots may develop on older potato leaves. Good field hygiene and early attention can help limit spread.",
    signs: ["Brown lesions with concentric rings", "Yellowing around affected patches", "Older, lower leaves often affected first"],
    prevention: ["Rotate crops away from potatoes and tomatoes", "Avoid wetting leaves when irrigating", "Maintain spacing and balanced nutrition"],
    steps: [
      { title: "Inspect nearby leaves", detail: "Look for brown spots and ring patterns, especially on older foliage." },
      { title: "Remove heavily affected foliage", detail: "Carefully dispose of infected material away from healthy plants." },
      { title: "Improve airflow and watering", detail: "Avoid overhead watering and prolonged leaf wetness." },
      { title: "Ask for local treatment advice", detail: "Consult an agricultural officer about locally registered products if symptoms persist." }
    ],
    insight: "Early blight is often associated with plant stress and warm conditions. Keep monitoring the crop."
  },
  "Late Blight": {
    intro: "Late blight can progress quickly in cool, wet weather. Suspected cases need prompt expert attention.",
    signs: ["Irregular water-soaked patches", "Dark brown or black spreading lesions", "Possible whitish growth under leaves in humid weather"],
    prevention: ["Use disease-free seed tubers", "Reduce prolonged leaf wetness", "Monitor closely during cool, humid weather"],
    steps: [
      { title: "Treat this as time-sensitive", detail: "Check nearby plants and contact local agricultural extension services promptly." },
      { title: "Avoid moving infected material", detail: "Follow local guidance on handling and disposing of suspect foliage." },
      { title: "Reduce leaf wetness", detail: "Avoid overhead irrigation and improve airflow where possible." },
      { title: "Confirm control options", detail: "Use only locally registered potato late blight treatments and follow their labels." }
    ],
    insight: "Late blight is caused by an oomycete and may spread rapidly in favorable weather. A photo is not a confirmed diagnosis."
  },
  Healthy: {
    intro: "The model's top prediction is Healthy. Continue monitoring: early infections or diseases outside its three classes can be missed.",
    signs: ["Generally even green color", "No obvious expanding brown lesions", "Normal visible leaf structure"],
    prevention: ["Scout plants regularly after wet weather", "Use clean seed and remove infected debris", "Maintain balanced nutrition and irrigation"],
    steps: [
      { title: "Keep monitoring", detail: "Inspect leaves regularly for spots or yellowing." },
      { title: "Maintain healthy watering", detail: "Avoid keeping leaves wet for long periods." },
      { title: "Practice field hygiene", detail: "Use clean seed and remove suspicious crop debris." },
      { title: "Check unusual symptoms", detail: "Ask an expert if the plant looks unwell despite this prediction." }
    ],
    insight: "A Healthy prediction does not rule out every possible plant disease."
  }
};

const colors: Record<string, string> = { Healthy: "#6ee7b7", "Early Blight": "#fcd34d", "Late Blight": "#fda4af" };

export function ResultCard({ data }: Props) {
  const { cls, pathogen, confidence, all_scores, imageUrl, treatment } = data;
  const info = care[cls] || care.Healthy;
  const accent = colors[cls] || colors.Healthy;
  const score = Math.min(100, Math.max(0, Number(confidence) || 0));
  const [tab, setTab] = useState<Tab>("care");
  const [done, setDone] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [scoresOpen, setScoresOpen] = useState(false);
  const [scanOverlay, setScanOverlay] = useState(true);
  useEffect(() => { setTab("care"); setDone([]); setExpanded(0); setScoresOpen(false); setScanOverlay(true); }, [cls, imageUrl]);
  const progress = Math.round((done.length / info.steps.length) * 100);

  return (
    <motion.article initial={{ opacity: 0, y: 35, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .65 }} className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-[#081d17] text-white shadow-[0_30px_100px_rgba(0,0,0,.32)]">
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-[90px]" />
      <div className="relative border-b border-white/10 bg-gradient-to-br from-[#123d2e] via-[#0b2920] to-[#081d17] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-emerald-200"><ScanLine size={19} /> PlantGuard Intelligence</span>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold text-emerald-200"><CheckCircle2 size={13} /> Analysis complete</span>
        </div>
        <div className="mt-7 grid items-center gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300/80">Your plant health story</p>
            <h3 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">Meet your leaf's <span className="bg-gradient-to-r from-emerald-300 to-lime-200 bg-clip-text text-transparent">health report.</span></h3>
            <p className="mt-4 text-sm leading-7 text-emerald-100/65">Advanced visual screening with practical, step-by-step crop care guidance.</p>
            <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-emerald-100/75"><Microscope size={14} className="mr-1 inline" /> CNN screening</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-emerald-100/75"><Leaf size={14} className="mr-1 inline" /> Potato leaf</span></div>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem] border border-emerald-200/25 bg-emerald-950/60 shadow-2xl">
              <img src={imageUrl} alt="Uploaded potato leaf" className="h-full w-full object-cover" />
              {scanOverlay && <><div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_48%,rgba(52,211,153,.12)_50%,transparent_52%)] bg-[length:100%_12px]" /><motion.div animate={{ top: ["5%", "95%", "5%"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute left-0 right-0 h-[2px] bg-emerald-300 shadow-[0_0_16px_3px_rgba(110,231,183,.8)]" /></>}
              <span className="absolute bottom-3 left-3 rounded-lg border border-white/20 bg-black/55 px-3 py-1.5 text-[10px] font-bold backdrop-blur-md">{scanOverlay ? "AI scan view" : "Original photo"}</span>
              <div className="pointer-events-none absolute inset-4 rounded-xl border border-emerald-200/20" />
            </div>
            <button type="button" onClick={() => setScanOverlay(v => !v)} className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-200 hover:text-white"><Eye size={14} /> {scanOverlay ? "View original photo" : "Show scan overlay"} <ArrowRight size={13} /></button>
          </div>
        </div>
      </div>

      <div className="relative space-y-7 p-4 sm:p-8">
        <div className="grid gap-4 md:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[.045] p-5 sm:p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-emerald-200/60">Detected condition</p>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: accent }}>{cls}</h4><p className="mt-2 text-sm italic text-emerald-100/60">{pathogen}</p></div><span className="flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold" style={{ color: accent, borderColor: accent + "55", background: accent + "16" }}>{cls === "Healthy" ? <ShieldCheck size={15} /> : <AlertTriangle size={15} />}{cls === "Healthy" ? "Looking good" : cls === "Late Blight" ? "Act promptly" : "Needs attention"}</span></div>
            <p className="mt-5 text-sm leading-7 text-emerald-100/70">{info.intro}</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-white/[.045] p-5">
            <div className="relative flex h-40 w-40 items-center justify-center"><svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true"><circle cx="80" cy="80" r="65" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="10" /><motion.circle cx="80" cy="80" r="65" fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" strokeDasharray={2 * Math.PI * 65} initial={{ strokeDashoffset: 2 * Math.PI * 65 }} animate={{ strokeDashoffset: 2 * Math.PI * 65 * (1 - score / 100) }} transition={{ duration: 1.5 }} /></svg><div className="text-center"><p className="text-3xl font-black tabular-nums">{score.toFixed(1)}<span className="text-base" style={{ color: accent }}>%</span></p><p className="mt-1 text-[10px] uppercase tracking-widest text-emerald-100/60">Confidence</p></div></div>
            <p className="mt-1 text-center text-[11px] text-emerald-100/55">Model score, not diagnostic certainty</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[.035]"><button type="button" onClick={() => setScoresOpen(v => !v)} aria-expanded={scoresOpen} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-white/5"><span className="flex items-center gap-2 text-sm font-bold"><Activity size={17} className="text-emerald-300" /> Explore all AI predictions</span><ChevronDown size={18} className={scoresOpen ? "rotate-180 text-emerald-200" : "text-emerald-200/60"} /></button><AnimatePresence>{scoresOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="space-y-4 border-t border-white/10 px-5 py-5">{Object.entries(all_scores || {}).map(([name, raw]) => { const value = Math.min(100, Math.max(0, Number(raw) || 0)); return <div key={name}><div className="mb-2 flex justify-between text-xs"><span className="text-emerald-100/70">{name}</span><span className="font-bold">{value.toFixed(1)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: value + "%" }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: colors[name] || "#6ee7b7" }} /></div></div>; })}</div></motion.div>}</AnimatePresence></div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-300">Personalized crop care</p><h4 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Your Plant Recovery Hub</h4>
          <div className="mt-5 flex flex-wrap gap-2">{([{ id: "care", label: "Care journey", Icon: ClipboardCheck }, { id: "symptoms", label: "Symptoms", Icon: Stethoscope }, { id: "prevention", label: "Prevention", Icon: ShieldCheck }] as const).map(({ id, label, Icon }) => <button type="button" key={id} onClick={() => setTab(id)} className={"flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition " + (tab === id ? "border-emerald-300/50 bg-emerald-300 text-emerald-950" : "border-white/10 bg-white/5 text-emerald-100/65 hover:text-white")}><Icon size={15} />{label}</button>)}</div>
          <AnimatePresence mode="wait">{tab === "care" ? <motion.div key="care" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[.035] p-4 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-extrabold">Your action checklist</p><p className="mt-1 text-xs text-emerald-100/55">Track steps in this report</p></div><span className="text-2xl font-black text-emerald-300">{progress}%</span></div><div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10"><motion.div animate={{ width: progress + "%" }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-300" /></div><div className="space-y-2">{info.steps.map((step, i) => <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-black/10"><div className="flex items-center gap-3 p-3 sm:p-4"><button type="button" aria-label={"Mark step " + (i + 1) + " complete"} onClick={() => setDone(a => a.includes(i) ? a.filter(x => x !== i) : [...a, i])} className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border " + (done.includes(i) ? "border-emerald-300 bg-emerald-300 text-emerald-950" : "border-white/20 text-emerald-200/60")}>{done.includes(i) ? <Check size={19} /> : <span className="text-xs font-black">{String(i + 1).padStart(2, "0")}</span>}</button><button type="button" onClick={() => setExpanded(expanded === i ? null : i)} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"><span className="text-sm font-bold">{step.title}</span><ChevronDown size={17} className={"shrink-0 text-emerald-200/60 " + (expanded === i ? "rotate-180" : "")} /></button></div>{expanded === i && <p className="px-4 pb-4 pl-16 text-xs leading-6 text-emerald-100/65">{step.detail}</p>}</div>)}</div>{done.length === info.steps.length && <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-300/10 p-3 text-sm font-semibold text-emerald-200"><CheckCircle2 size={18} /> Checklist complete — keep monitoring your crop.</p>}</motion.div> : <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 grid gap-3 sm:grid-cols-3">{(tab === "symptoms" ? info.signs : info.prevention).map((item, i) => { const Icon = tab === "symptoms" ? Target : [Sprout, Droplets, Sun][i]; return <div key={item} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200"><Icon size={19} /></span><p className="mt-4 text-sm font-semibold leading-6">{item}</p></div>; })}</motion.div>}</AnimatePresence>
        </div>

        <div className="rounded-[1.5rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-500/15 to-transparent p-5 sm:p-6"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200"><Sparkles size={18} /></span><p className="text-sm font-extrabold">PlantGuard Insight</p></div><p className="mt-3 text-sm leading-7 text-emerald-50/80">{info.insight}</p>{treatment && <details className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4"><summary className="cursor-pointer text-xs font-bold text-emerald-200">Original prediction service guidance</summary><p className="mt-3 whitespace-pre-line text-xs leading-6 text-emerald-100/70">{treatment}</p></details>}</div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5"><div><p className="text-xs font-semibold text-emerald-100/70">PlantGuard AI · Screening report</p><p className="mt-1 text-[11px] text-emerald-100/40">No login required</p></div><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-5 py-3 text-xs font-black text-emerald-950 hover:bg-lime-200"><Download size={16} /> Print / Save PDF</button></div>
        <p className="text-[11px] leading-6 text-emerald-100/45"><AlertTriangle size={13} className="mr-1 inline" /> AI image screening is not a confirmed diagnosis. The model recognizes only Healthy, Early Blight and Late Blight. Confirm concerning symptoms and treatment decisions with a qualified agricultural professional.</p>
      </div>
    </motion.article>
  );
}
