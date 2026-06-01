"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Cpu, 
  Globe, 
  Lock, 
  Unlock,
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  Layers,
  Activity,
  UserCheck,
  TrendingUp,
  DollarSign,
  Terminal,
  RotateCcw,
  Sparkles,
  Server,
  ArrowRightLeft
} from "lucide-react";

// Animations
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
} as const;

// Source Badge Utility
const SourceBadge = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded ml-1.5 hover:bg-orange-500 hover:text-white transition-all cursor-help uppercase tracking-tighter"
  >
    Source: {children}
  </a>
);

export default function LandingPage() {
  // 1. Terminal Simulation State
  const [terminalLogs, setTerminalLogs] = useState<Array<{ text: string; color: string; prefix?: string }>>([]);
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [isTerminalRunning, setIsTerminalRunning] = useState(true);

  // Terminal Script Steps
  const terminalScript = [
    { text: "agent.request('https://api.polyglot.ai/translate', data)", color: "text-slate-300", prefix: "> " },
    { text: "[CONNECT] Initiating connection to proxy gateway...", color: "text-slate-400" },
    { text: "[GATEWAY] Intercepting request (L402 Middleware Check)", color: "text-amber-400" },
    { text: "[CHALLENGE] HTTP 402 Payment Required! Challenge Issued.", color: "text-red-400 font-bold" },
    { text: "[CHALLENGE] Invoice: lnbc50n1pvjla2... (5 sats)", color: "text-amber-500" },
    { text: "[WEBLN] Invoking Alby auto-payer: checking task budget...", color: "text-slate-400" },
    { text: "[WEBLN] Wallet authorized. Settling off-chain invoice...", color: "text-slate-400" },
    { text: "[SETTLED] Invoice paid in 240ms! Preimage fetched.", color: "text-emerald-400 font-bold" },
    { text: "[PROXY] Verifying payment hash: 6d84a7e91d34...", color: "text-slate-400" },
    { text: "[SUCCESS] Preimage OK. Access Granted (HTTP 200)", color: "text-emerald-400" },
    { text: "[OUTPUT] Res: 'Monetize every AI inference at machine speed.'", color: "text-cyan-400 font-mono" }
  ];

  useEffect(() => {
    if (!isTerminalRunning) return;
    
    if (terminalIndex < terminalScript.length) {
      const delay = terminalIndex === 0 ? 500 : terminalIndex === 3 || terminalIndex === 7 ? 1200 : 600;
      const timeout = setTimeout(() => {
        setTerminalLogs((prev) => [...prev, terminalScript[terminalIndex]]);
        setTerminalIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      // Loop with delay
      const timeout = setTimeout(() => {
        setTerminalLogs([]);
        setTerminalIndex(0);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [terminalIndex, isTerminalRunning]);

  // 2. Interactive L402 Sequence Flow
  const [activeStep, setActiveStep] = useState(1);
  const stepsDescription = [
    { 
      step: 1, 
      title: "1. Client API Request", 
      desc: "An AI agent attempts to query a premium service (e.g. translation, telemetric data). It sends a request to the server, unaware of any billing barriers.",
      color: "border-orange-500 bg-orange-500/10 text-orange-600"
    },
    { 
      step: 2, 
      title: "2. HTTP 402 Challenge", 
      desc: "L402 Guard middleware intercepts the request. Since it contains no billing cookie, it challenges the agent with an HTTP 402 error, containing a Lightning Invoice and cryptographic Macaroon.",
      color: "border-amber-500 bg-amber-500/10 text-amber-600"
    },
    { 
      step: 3, 
      title: "3. Off-Chain Wallet Settlement", 
      desc: "The agent's integrated wallet reads the invoice and automatically pays it over the Bitcoin Lightning Network. Alby/WebLN settles the transaction instantly (under 500ms).",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-600"
    },
    { 
      step: 4, 
      title: "4. Token Verification & Grant", 
      desc: "The agent retries the API request, presenting the settled preimage token. The proxy validates the token, releases the paywall, and runs the API payload.",
      color: "border-blue-500 bg-blue-500/10 text-blue-600"
    }
  ];

  return (
    <div className="min-h-screen text-slate-800 bg-gradient-to-b from-orange-50/75 via-white to-slate-100 overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.025)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(249,115,22,0.025)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[60%] bg-gradient-to-tr from-orange-400/20 to-yellow-300/15 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-[-10%] right-[-15%] w-[70%] h-[60%] bg-gradient-to-bl from-amber-400/15 to-orange-300/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-slate-200/50 bg-white/70 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
              AgentPay
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/market" className="text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors">Marketplace</Link>
            <Link href="/demo" className="text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors">Demo</Link>
            <Link href="/why" className="text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors">Why AgentPay</Link>
            <a 
              href="#tech-stack" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
            >
              Tech Behind It
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section: Dynamic Copy & Live Code Terminal Mock */}
      <section className="relative pt-44 pb-28">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Direct Value Pitch */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <motion.h1 
              {...fadeInUp}
              className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] text-slate-900"
            >
              Turn Every AI Inference <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500">
                Into Instant Revenue.
              </span>
            </motion.h1>

            <motion.p 
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-slate-600 text-base md:text-lg max-w-xl font-semibold leading-relaxed"
            >
              Engineered by{" "}
              <a 
                href="https://www.linkedin.com/in/namasteyy/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-orange-600 font-bold hover:underline"
              >
                Jannu Vashisht
              </a>{" "}
              in 24 hrs challenge given by{" "}
              <a 
                href="https://spiral.xyz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-orange-600 font-bold hover:underline"
              >
                Spiral
              </a>{" "}
              at{" "}
              <a 
                href="https://www.linkedin.com/posts/this-is-what-global-builder-energy-looks-ugcPost-7454105771421777920-ikBT/?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFZGL3EBQ32wx7qpGcMXb3lZPeY-8tp2-UE" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-orange-600 font-bold hover:underline"
              >
                MIT&apos;s 5th Global Hack-Nation Hackathon
              </a>
            </motion.p>

            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="flex gap-4 flex-wrap pt-2"
            >
              <Link 
                href="/demo" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-8 py-4.5 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-500/25 flex items-center gap-2"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/why" 
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm px-8 py-4.5 rounded-2xl transition-all shadow-sm"
              >
                Why AgentPay?
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Interactive simulated developer terminal (Premium Dark Obsidian Box) */}
          <div className="lg:col-span-5 flex flex-col h-[380px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden font-mono text-xs text-left">
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                L402_AGENT_DAEMON.log
              </span>
              <button 
                onClick={() => {
                  setTerminalLogs([]);
                  setTerminalIndex(0);
                  setIsTerminalRunning(true);
                }}
                className="text-slate-500 hover:text-white transition-colors"
                title="Restart Daemon"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="p-5 flex-grow overflow-y-auto space-y-2 leading-relaxed">
              <AnimatePresence>
                {terminalLogs.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${log.color} text-[11px]`}
                  >
                    {log.prefix && <span className="text-orange-500">{log.prefix}</span>}
                    {log.text}
                  </motion.div>
                ))}
              </AnimatePresence>
              {terminalIndex < terminalScript.length && (
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] animate-pulse">
                  <span>•</span>
                  <span>Executing task cycle...</span>
                </div>
              )}
            </div>
            
            <div className="bg-slate-950/80 p-3 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500">
              <span>Host: alby.webln.local</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Sats Settled: {terminalIndex >= 8 ? "5 sats" : "0"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem: THE FRICTION (Light Theme Grid Box Comparison) */}
      <section className="py-24 bg-white border-y border-slate-200/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="text-orange-500 font-bold uppercase tracking-widest text-xs">The Revenue Leak</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                Traditional rails kill <br />
                <span className="text-orange-500 italic">Agentic ROI.</span>
              </h2>
              <p className="text-slate-600 font-semibold text-sm md:text-base leading-relaxed">
                Stripe and PayPal were built for humans with credit cards. They aren&apos;t just slow for agents—they make them <strong className="text-slate-900">unprofitable.</strong>
              </p>
              <div className="space-y-6 pt-2">
                {[
                  { title: "Economic Impossible", text: <>{`Stripe charges $0.30 per txn. A $0.01 agent call loses 30x its value instantly.`}<SourceBadge href="https://stripe.com/pricing">Stripe Pricing</SourceBadge></>, color: "text-red-600" },
                  { title: "Human Deadlocks", text: "Captchas and 3DS approvals leave your agents waiting for hours. Time is money.", color: "text-orange-600" },
                  { title: "Custodial Risk", text: "Centralized rails can freeze your revenue at any moment for any reason.", color: "text-slate-600" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <div>
                      <h4 className={`font-bold mb-1 text-sm ${item.color}`}>{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Visually outstanding grid box comparison (Vibrant Light Card) */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-lg shadow-slate-200/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Revenue Comparison</div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-slate-500">Traditional (Stripe Surcharge)</span>
                    <span className="text-red-600">-$0.29 Net Loss</span>
                  </div>
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300/40 relative">
                    <motion.div 
                      className="h-full bg-red-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "10%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-slate-500">AgentPay (Lightning L402)</span>
                    <span className="text-emerald-600 font-black">+$0.0099 Net Profit</span>
                  </div>
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300/40 relative">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "95%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400 font-mono text-center pt-2">
                  Calculated for $0.01 micro-service query fee
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. The Solution: SPEED & SCALE (Vibrant Orange Gradient) */}
      <section className="py-24 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_75%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-8 tracking-tighter"
          >
            The Machine-Native Rail.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {[
              { icon: <Zap className="w-8 h-8 text-white fill-current" />, label: "Under 1s", sub: "Settlement Speed" },
              { icon: <DollarSign className="w-8 h-8 text-white" />, label: "0.0001¢", sub: "Minimum Txn" },
              { icon: <Globe className="w-8 h-8 text-white" />, label: "Global", sub: "Permissionless" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-white/20 p-4.5 rounded-2xl mb-6 backdrop-blur-md border border-white/25 shadow">
                  {item.icon}
                </div>
                <div className="text-4xl font-black mb-1">{item.label}</div>
                <div className="text-white/80 font-bold uppercase tracking-widest text-[10px]">{item.sub}</div>
              </div>
            ))}
          </div>
          <p className="mt-16 text-lg font-semibold max-w-2xl mx-auto opacity-90 leading-relaxed italic">
            &quot;The only payment primitive that returns a challenge inside an HTTP 402 response—allowing agents to solve paywalls programmatically in milliseconds.&quot;
            <br />
            <span className="mt-4 block"><SourceBadge href="https://l402.org">L402 Protocol Spec</SourceBadge></span>
          </p>
        </div>
      </section>

      {/* 4. THE TECH STACK: INTERACTIVE L402 SEQUENCE FLOWCHART */}
      <section id="tech-stack" className="py-28 bg-white relative overflow-hidden border-b border-slate-200/50">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.015)_1px,transparent_1px)] bg-[size:35px_35px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-mono font-bold uppercase tracking-widest text-xs">Architectural Sequence</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 mb-6 tracking-tight text-slate-900">
              Interactive L402 <span className="text-orange-600">Billing Loop.</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base font-semibold leading-relaxed">
              Click through the 4 steps of the protocol sequence to trace the flow of data, challenges, and micro-satoshi payments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left side: Interactive triggers & text description */}
            <div className="lg:col-span-5 space-y-4 text-left">
              {stepsDescription.map((item) => (
                <button
                  key={item.step}
                  onClick={() => setActiveStep(item.step)}
                  className={`w-full p-6 rounded-2xl border text-left transition-all flex gap-4 ${
                    activeStep === item.step 
                      ? "bg-slate-50 border-orange-500 shadow-md shadow-orange-500/5" 
                      : "bg-white border-slate-200 hover:border-slate-350"
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    activeStep === item.step ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {item.step}
                  </span>
                  
                  <div className="space-y-1.5">
                    <h4 className={`font-bold text-sm ${activeStep === item.step ? "text-orange-600" : "text-slate-700"}`}>
                      {item.title}
                    </h4>
                    {activeStep === item.step && (
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {item.desc}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Right side: Dynamic Visual Sequence Diagram */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-8 min-h-[400px] flex flex-col justify-between relative overflow-hidden font-mono text-xs shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />
              
              <div className="flex justify-between items-center text-[10px] text-slate-400 tracking-wider">
                <span>SYSTEM_MODE: SIMULATOR_HUD</span>
                <span>VER: 1.0.8</span>
              </div>

              {/* Graphical Nodes */}
              <div className="relative flex items-center justify-between h-48 my-6">
                
                {/* Node 1: Agent */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                    activeStep === 1 || activeStep === 3 
                      ? "border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.25)] text-orange-600" 
                      : "border-slate-200 bg-white text-slate-400"
                  }`}>
                    <Cpu className={`w-6 h-6 ${activeStep === 1 || activeStep === 3 ? "text-orange-500 animate-pulse" : ""}`} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">AI Agent</span>
                </div>

                {/* Path 1 -> 2 Dotted Vector */}
                <div className="absolute top-1/3 left-[20%] right-[55%] h-0.5 pointer-events-none">
                  <div className="w-full border-t border-dashed border-slate-300" />
                  {activeStep === 1 && (
                    <motion.div 
                      className="absolute top-[-4px] w-2.5 h-2.5 rounded-full bg-orange-500 blur-[1px]"
                      animate={{ x: ["0%", "400%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {activeStep === 2 && (
                    <motion.div 
                      className="absolute top-[-4px] w-2.5 h-2.5 rounded-full bg-amber-500 blur-[1px]"
                      animate={{ x: ["400%", "0%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>

                {/* Node 2: Proxy Gate Middleware */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                    activeStep === 2 || activeStep === 4 
                      ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.25)]" 
                      : "border-slate-200 bg-white text-slate-400"
                  }`}>
                    {activeStep === 4 ? (
                      <Unlock className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Lock className={`w-6 h-6 ${activeStep === 2 ? "text-amber-500" : ""}`} />
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">L402 Proxy</span>
                </div>

                {/* Path 2 -> 3 Dotted Vector */}
                <div className="absolute top-1/3 left-[45%] right-[25%] h-0.5 pointer-events-none">
                  <div className="w-full border-t border-dashed border-slate-300" />
                  {activeStep === 3 && (
                    <motion.div 
                      className="absolute top-[-4px] w-2.5 h-2.5 rounded-full bg-emerald-500 blur-[1px]"
                      animate={{ x: ["0%", "300%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>

                {/* Node 3: Lightning Network */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                    activeStep === 3 
                      ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-emerald-600" 
                      : "border-slate-200 bg-white text-slate-400"
                  }`}>
                    <Zap className={`w-6 h-6 ${activeStep === 3 ? "text-emerald-500 animate-pulse" : ""}`} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">Alby Wallet</span>
                </div>

              </div>

              {/* Dynamic Step Logs */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left text-[11px] leading-relaxed shadow-sm">
                <span className="text-orange-600 font-bold block mb-1">
                  Active Log State: Step {activeStep}
                </span>
                <span className="text-slate-500 font-semibold">
                  {activeStep === 1 && "AI Agent triggers GET /telemetry payload... cookies undefined."}
                  {activeStep === 2 && "Gateway rejects connection: returns HTTP 402 + invoice challenge token."}
                  {activeStep === 3 && "WebLN resolves paywall challenge: Alby settlements completes off-chain."}
                  {activeStep === 4 && "Preimage 6d84a7e91d... presented. Access granted (HTTP 200) successfully."}
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. Sleek Technical Stack Overview */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="text-orange-500 font-mono font-bold uppercase tracking-widest text-xs mb-4">Architecture & Protocol</div>
          <h2 className="text-4xl md:text-5xl font-black mb-16 tracking-tight text-slate-900">
            The Cryptographic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Machine Stack.</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {[
              {
                title: "L402 Guard (HTTP 402 Challenge)",
                tech: "Next.js Middleware + Cryptographic Macaroons",
                bullets: [
                  "**Intercepts Edge Calls**: Captures unpaid API requests before reaching backend handlers.",
                  "**Issues Challenges**: Responds with `HTTP 402` headers enclosing a Lightning Invoice and cryptographic Macaroon cookie.",
                  "**Preimage Verification**: Once the invoice is paid, validates the paid preimage token to unlock access."
                ],
                icon: <Lock className="w-5 h-5 text-orange-500" />
              },
              {
                title: "Bitcoin Lightning Network",
                tech: "Alby API + WebLN integration",
                bullets: [
                  "**Sub-Second Settlements**: Settles micro-payments off-chain globally in **under 1 second**.",
                  "**Infinite Scalability**: Enables high-frequency machine billing starting from **0.0001¢**.",
                  "**Programmatic Payments**: Integrates WebLN so agents pay invoice challenges autonomously without human intervention."
                ],
                icon: <Zap className="w-5 h-5 text-orange-500" />
              },
              {
                title: "Decentralized Reputation Layer",
                tech: "Supabase PG Database + Ledger Triggers",
                bullets: [
                  "**Trust Metrics**: Compiles reliability scores in real-time based on successful payment histories.",
                  "**Ledger Integrity**: Anchors reputation dynamically to immutable settled payment hashes on the database.",
                  "**Optimized Discovery**: Filters and routes buyer agents only to high-reputation, active marketplace nodes."
                ],
                icon: <ShieldCheck className="w-5 h-5 text-orange-500" />
              },
              {
                title: "Autonomous Agent Demo Engine",
                tech: "Next.js Edge Streaming (SSE)",
                bullets: [
                  "**Live Streaming**: Employs Server-Sent Events (SSE) to stream reasoning and billing states in real-time.",
                  "**Reasoning Feed**: Visualizes the decision, selection, and settlement sequence directly on the frontend.",
                  "**Genuine Loops**: Maintains the complete cryptographic off-chain Lightning loop under the hood."
                ],
                icon: <Cpu className="w-5 h-5 text-orange-500" />
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-500/35 hover:shadow-md transition-all">
                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex-shrink-0 h-fit">
                  {item.icon}
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">{item.title}</h3>
                    <div className="text-[9px] font-mono text-orange-600 uppercase tracking-widest mt-1">{item.tech}</div>
                  </div>
                  <ul className="space-y-2 text-slate-600 text-xs leading-relaxed">
                    {item.bullets.map((bullet, idx) => {
                      const parts = bullet.split(":");
                      const title = parts[0];
                      const text = parts.slice(1).join(":");
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                          <span className="font-semibold text-slate-500">
                            <strong className="text-slate-800">{title.replace(/\*\*/g, "")}:</strong>
                            {text.replace(/\*\*/g, "")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-slate-900 text-center relative overflow-hidden border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-white">Ready to Monetize?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/demo" className="w-full sm:w-auto bg-orange-50 hover:bg-orange-600 text-slate-950 px-10 py-4.5 rounded-2xl font-black transition-all hover:scale-105">
              Enter Marketplace
            </Link>
            <Link href="/register" className="w-full sm:w-auto border border-white/20 hover:bg-white/5 text-white px-10 py-4.5 rounded-2xl font-black transition-all">
              List Your Agent
            </Link>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 text-slate-550 text-[10px] font-mono uppercase tracking-widest">
            AgentPay · The Infrastructure for Agentic Revenue
          </div>
        </div>
      </footer>
    </div>
  );
}
