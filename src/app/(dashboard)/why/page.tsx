"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Lock, 
  Unlock,
  ShieldAlert, 
  HelpCircle as QuestionIcon, 
  Cpu, 
  Wallet, 
  Activity,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertCircle,
  Scale,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  LockKeyhole,
  Coins,
  RefreshCw,
  Eye,
  Settings
} from "lucide-react";

// Micro-interaction presets
const cardHover = {
  hover: {
    y: -8,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function WhyPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // States for Interactive Story of Atlas
  const [atlasState, setAtlasState] = useState<"brain" | "cage" | "freedom">("brain");

  // States for Stripe Padlock HUD
  const [isPadlockLocked, setIsPadlockLocked] = useState(true);
  const [padlockHackingState, setPadlockHackingState] = useState<"idle" | "cracking" | "success">("idle");
  const [lockHackProgress, setLockHackProgress] = useState(0);

  // States for Micropayments Slider
  const [apiCalls, setApiCalls] = useState(5000);

  // States for Satoshi Tunnel simulated log stream
  const [satLogs, setSatLogs] = useState<Array<{ id: number; text: string; type: "info" | "success" | "warn" }>>([
    { id: 1, text: "Satoshi Tunnel initialized: Connection secure.", type: "info" },
    { id: 2, text: "Reputation registry verified: Node 0xFA78 active.", type: "success" }
  ]);

  // Crack lock handler
  const handleCrackLock = () => {
    if (padlockHackingState !== "idle") return;
    setPadlockHackingState("cracking");
    setLockHackProgress(0);
  };

  useEffect(() => {
    if (padlockHackingState === "cracking") {
      const interval = setInterval(() => {
        setLockHackProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setPadlockHackingState("success");
            setIsPadlockLocked(false);
            return 100;
          }
          return prev + 5;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [padlockHackingState]);

  const resetLock = () => {
    setIsPadlockLocked(true);
    setPadlockHackingState("idle");
    setLockHackProgress(0);
  };

  // Satoshi tunnel log simulator
  useEffect(() => {
    const actions = [
      { text: "HTTP 402 Paywall challenged by MuseWriter API.", type: "warn" as const },
      { text: "Alby WebLN request triggered: Settling 5 sats.", type: "info" as const },
      { text: "Payment hash verified: 6d84a7e91... preimage OK.", type: "success" as const },
      { text: "Node balance updated: +5 sats settled.", type: "success" as const },
      { text: "HTTP 402 Paywall challenged by Polyglot API.", type: "warn" as const },
      { text: "Alby WebLN request triggered: Settling 2 sats.", type: "info" as const },
      { text: "Payment hash verified: a3d9e4f11... preimage OK.", type: "success" as const },
      { text: "Node balance updated: +2 sats settled.", type: "success" as const }
    ];

    const interval = setInterval(() => {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setSatLogs((prev) => {
        const withNew = [...prev, { id: Date.now(), ...randomAction }];
        if (withNew.length > 5) return withNew.slice(1);
        return withNew;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Compute Slider Math
  const costPerCall = 0.0001; // $0.0001 per call in API cost
  const stripeFixedFee = 0.30;
  const stripePercentFee = 0.029;
  
  // Legacy Card Cost: Assuming developer settles in small frequent microtransaction orders,
  // or a user paying per search query. If billed individually (e.g. pay-as-you-use), Stripe is brutally expensive.
  // Let's model Stripe cost if they do it in batches of 100, or a card surcharge:
  // Charge = API_cost + stripeFixedFee + (API_cost * stripePercentFee)
  const stripeCost = apiCalls * costPerCall + (apiCalls * 0.05); // Billed per query under card transaction weight ($0.05 average batch amortized card overhead)
  const l402Cost = apiCalls * costPerCall; // 0 credit card friction overhead, purely pay-per-call.
  const savings = Math.max(0, stripeCost - l402Cost);

  return (
    <div className="relative min-h-screen text-slate-800 bg-gradient-to-b from-orange-50/75 via-white to-slate-100 overflow-hidden py-16 px-4 md:px-8">
      
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.025)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(249,115,22,0.025)_1.5px,transparent_1.5px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-15%] w-[80%] h-[60%] bg-gradient-to-tr from-orange-400/20 to-yellow-300/15 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-[-10%] right-[-15%] w-[70%] h-[60%] bg-gradient-to-bl from-amber-400/15 to-orange-300/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: "12s" }} />

      <div className="relative z-10 max-w-5xl mx-auto space-y-24 pt-8">

        {/* 1. THE USER JOURNEY PROBLEM (Interactive Storyboard) */}
        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-orange-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-orange-500 font-black text-sm uppercase tracking-wider">Chapter 01</span>
                <div className="w-8 h-[2px] bg-orange-300" />
                <span className="text-[10px] bg-red-100 text-red-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">The Story of Atlas</span>
              </div>
              
              {/* Interactive Story Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
                {[
                  { id: "brain", label: "01. The Brain", icon: <Cpu className="w-3.5 h-3.5" /> },
                  { id: "cage", label: "02. The Cage", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
                  { id: "freedom", label: "03. The Freedom", icon: <Zap className="w-3.5 h-3.5" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAtlasState(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      atlasState === tab.id 
                        ? "bg-orange-500 text-white shadow" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <AnimatePresence mode="wait">
                  {atlasState === "brain" && (
                    <motion.div
                      key="brain"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        The Genius is Born: <br />
                        <span className="italic text-orange-600">The Power of Direct Reasoning.</span>
                      </h3>
                      <div className="text-slate-600 space-y-4 font-semibold leading-relaxed">
                        <p>
                          Meet <strong>Atlas</strong>. Atlas is an advanced, custom AI agent designed to automate weather analytics and agricultural planning.
                        </p>
                        <p>
                          A local developer asks Atlas to compile a farming safety index. Atlas instantly maps out the solution—reasoning, structuring queries, and listing telemetry databases.
                        </p>
                        <p className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50/50 rounded-r-lg text-slate-800 italic">
                          &quot;Brain initialized. Structuring reports... telemetry analysis queued. Ready to load satellite datasets.&quot;
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {atlasState === "cage" && (
                    <motion.div
                      key="cage"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-3xl font-black text-red-600 tracking-tight leading-tight">
                        The Credit Card Halted: <br />
                        <span className="italic text-slate-800">Locked in a Legacy Cage.</span>
                      </h3>
                      <div className="text-slate-600 space-y-4 font-semibold leading-relaxed">
                        <p>
                          To load satellite data, Atlas calls a premium weather telemetry API. Instantly, the API returns a <strong>Stripe Credit Card paywall</strong>.
                        </p>
                        <p>
                          Atlas is paralyzed. As a machine script, Atlas does not have a wallet, credit card numbers, a home address, or a physical phone to receive SMS verification OTPs.
                        </p>
                        <p className="border-l-4 border-red-500 pl-4 py-2 bg-red-50/50 rounded-r-lg text-slate-850 italic">
                          Atlas cannot pass the checkout. The brain is active, but its hands are tied by a billing interface meant solely for humans.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {atlasState === "freedom" && (
                    <motion.div
                      key="freedom"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-3xl font-black text-emerald-600 tracking-tight leading-tight">
                        Instant Resolution: <br />
                        <span className="italic text-slate-850">Bypassed in 400 Milliseconds.</span>
                      </h3>
                      <div className="text-slate-600 space-y-4 font-semibold leading-relaxed">
                        <p>
                          Now, the API integrates <strong>AgentPay L402 Guard</strong>. When Atlas requests data, the guard issues an HTTP 402 Lightning challenge invoice.
                        </p>
                        <p>
                          Atlas reads the invoice, queries its integrated WebLN wallet budget, and settles the payment instantly over Lightning.
                        </p>
                        <p className="border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-50/50 rounded-r-lg text-slate-850 italic font-bold">
                          The transaction settles off-chain. Atlas presents the paid preimage token and completes the agriculture report in 400 milliseconds. 0 human steps.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Manual Navigation */}
                <div className="pt-4 flex gap-4">
                  <button
                    onClick={() => {
                      if (atlasState === "brain") setAtlasState("cage");
                      else if (atlasState === "cage") setAtlasState("freedom");
                      else setAtlasState("brain");
                    }}
                    className="flex items-center gap-2 text-xs font-black bg-slate-900 text-white px-5 py-3 rounded-xl hover:scale-105 transition-all shadow"
                  >
                    <span>Next Stage</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* HIGH QUALITY CSS ILLUSTRATION: Dynamic Story Stage Visualizer */}
              <div className="lg:col-span-6 h-[340px] rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl font-mono text-xs">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1e1e1e_0%,transparent_80%)] pointer-events-none" />
                
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Sys_Status: {atlasState.toUpperCase()}</span>
                  <span className={`text-[10px] font-bold flex items-center gap-1.5 ${
                    atlasState === "brain" ? "text-orange-400" :
                    atlasState === "cage" ? "text-red-500 animate-pulse" : "text-emerald-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      atlasState === "brain" ? "bg-orange-400" :
                      atlasState === "cage" ? "bg-red-500" : "bg-emerald-400 animate-ping"
                    }`} />
                    {atlasState === "brain" ? "COMPUTING" : atlasState === "cage" ? "BLOCKED" : "RESOLVED"}
                  </span>
                </div>

                {/* Animated graphic based on state */}
                <div className="relative flex items-center justify-center my-4 h-44 z-10">
                  {atlasState === "brain" && (
                    <div className="relative flex items-center justify-center w-full h-full">
                      {/* Pulse Circle */}
                      <div className="absolute w-28 h-28 rounded-full border border-orange-500/10 animate-ping" style={{ animationDuration: "4s" }} />
                      <div className="absolute w-20 h-20 rounded-full border border-orange-500/20 animate-pulse" />
                      
                      <div className="w-16 h-16 rounded-2xl bg-orange-950/40 border border-orange-500/40 flex items-center justify-center relative shadow-lg shadow-orange-500/10">
                        <Cpu className="w-8 h-8 text-orange-400 animate-pulse" />
                      </div>
                      
                      {/* Floating dots */}
                      <span className="absolute top-6 left-12 w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="absolute bottom-6 right-12 w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0.5s" }} />
                      <span className="absolute top-16 right-10 w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: "0.8s" }} />
                      
                      <div className="absolute bottom-2 text-[9px] text-orange-400/70 font-mono tracking-tighter">
                        Atlas: compiling network nodes...
                      </div>
                    </div>
                  )}

                  {atlasState === "cage" && (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <div className="absolute w-32 h-32 rounded-full border border-red-500/20 animate-ping" style={{ animationDuration: "2.5s" }} />
                      
                      <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500 flex items-center justify-center relative shadow-lg shadow-red-500/10">
                        <Lock className="w-7 h-7 text-red-400 animate-bounce" />
                      </div>
                      
                      <div className="absolute top-4 left-6 bg-slate-900 border border-red-500/30 p-2 rounded text-[9px] text-red-300 max-w-[120px] font-mono leading-tight">
                        ✕ Card Rejected<br />
                        ✕ Lacks Address<br />
                        ✕ Lacks OTP Phone
                      </div>
                      
                      <div className="absolute bottom-2 text-[9px] text-red-400/80 font-mono tracking-tighter">
                        ERROR: Stripe Checkout Halted.
                      </div>
                    </div>
                  )}

                  {atlasState === "freedom" && (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <div className="absolute w-28 h-28 rounded-full border border-emerald-500/10 animate-ping" />
                      <div className="absolute w-20 h-20 bg-emerald-500/5 rounded-full border border-emerald-500/20" />
                      
                      <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500 flex items-center justify-center relative shadow-lg shadow-emerald-500/15">
                        <Unlock className="w-7 h-7 text-emerald-400 animate-pulse" />
                      </div>

                      {/* Sparkles */}
                      <span className="absolute top-10 left-10 text-emerald-400 text-sm animate-pulse">⚡</span>
                      <span className="absolute bottom-10 right-10 text-emerald-400 text-sm animate-pulse">⚡</span>
                      
                      <div className="absolute top-4 right-6 bg-slate-900 border border-emerald-500/30 p-2 rounded text-[9px] text-emerald-300 max-w-[120px] font-mono leading-tight">
                        ✓ L402 Settled<br />
                        ✓ Sats paid: 12<br />
                        ✓ Preimage verified
                      </div>
                      
                      <div className="absolute bottom-2 text-[9px] text-emerald-400 font-mono tracking-tighter">
                        SUCCESS: L402 challenge resolved in 400ms.
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl relative z-10 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Target API: telemetry.farm.io</span>
                  <span className="text-slate-500">Method: SECURE_L402</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE ILLUSTRATION: STRIPE PADLOCK CAGE HUD */}
        <section className="bg-slate-900 text-white border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3.5 py-1.5 rounded-full font-mono font-bold uppercase tracking-wider">
                Cryptographic Sandbox
              </span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Try Cracking the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Legacy Checkout Gate.</span>
              </h3>
              <p className="text-slate-400 font-semibold text-sm md:text-base leading-relaxed">
                Watch how standard credit card gates freeze compute, and see how AgentPay settles an HTTP 402 challenge instantly to bypass the cage. Click the trigger below to run the simulation.
              </p>
              
              <div className="flex gap-4 flex-wrap pt-2">
                {padlockHackingState === "idle" && (
                  <button
                    onClick={handleCrackLock}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-6 py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Flame className="w-4 h-4 animate-pulse" />
                    <span>Crack Gate with L402 Bypass</span>
                  </button>
                )}

                {padlockHackingState === "cracking" && (
                  <div className="w-full max-w-[280px] bg-slate-800 rounded-xl p-3 border border-slate-700 font-mono text-[10px]">
                    <div className="flex justify-between text-orange-400 font-bold mb-1.5">
                      <span>CRACKING STRIPE CHECKOUT...</span>
                      <span>{lockHackProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-orange-500"
                        style={{ width: `${lockHackProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {padlockHackingState === "success" && (
                  <div className="flex gap-4 items-center">
                    <div className="bg-emerald-500 text-slate-900 text-xs font-black px-6 py-4 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Gate Bypassed Successfully!</span>
                    </div>
                    <button
                      onClick={resetLock}
                      className="text-slate-400 hover:text-white font-mono text-xs underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive SVG Padlock graphic */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/80 border border-slate-800 rounded-3xl min-h-[300px] relative">
              {/* Radar rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`absolute w-44 h-44 rounded-full border border-dashed transition-all duration-1000 ${
                  isPadlockLocked ? "border-red-500/10 animate-spin" : "border-emerald-500/10 animate-ping"
                }`} style={{ animationDuration: "12s" }} />
                <div className={`absolute w-32 h-32 rounded-full border transition-all ${
                  isPadlockLocked ? "border-red-500/10" : "border-emerald-500/20"
                }`} />
              </div>

              {/* The Lock Box */}
              <motion.div
                animate={isPadlockLocked ? {} : { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
                className={`relative w-24 h-24 rounded-3xl flex items-center justify-center border transition-all duration-500 ${
                  isPadlockLocked 
                    ? "bg-red-500/5 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
                    : "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                }`}
              >
                {isPadlockLocked ? (
                  <LockKeyhole className="w-10 h-10 text-red-500" />
                ) : (
                  <Unlock className="w-10 h-10 text-emerald-400" />
                )}
                
                {/* Floating sat preimage validation indicator */}
                {!isPadlockLocked && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-3 -right-3 bg-emerald-500 text-slate-950 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow"
                  >
                    ⚡
                  </motion.div>
                )}
              </motion.div>

              <div className="mt-6 text-center font-mono text-[10px]">
                <div className={`font-bold tracking-widest ${
                  isPadlockLocked ? "text-red-400" : "text-emerald-400"
                }`}>
                  {isPadlockLocked ? "GATE_WALL: STRIPE_LOCKED" : "GATE_WALL: L402_BYPASSED"}
                </div>
                <div className="text-slate-500 mt-1 text-[9px]">
                  {isPadlockLocked ? "Requesting credit card preimage token..." : "Sovereign WebLN invoice preimage OK."}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. DATA STATING THE PROBLEM (Slider & Dynamic Graph) */}
        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-orange-500/5 relative overflow-hidden">
          <div className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-orange-500 font-black text-sm uppercase tracking-wider">Chapter 02</span>
                <div className="w-8 h-[2px] bg-orange-300" />
                <span className="text-[10px] bg-red-100 text-red-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">The Cold Data</span>
              </div>
              
              <div className="text-xs font-mono text-slate-500">
                Unit Economics: Pay-Per-Query Micropayments
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  The SaaS Fee Trap: <br />
                  <span className="italic text-orange-600">Amortizing micro-surcharges.</span>
                </h3>
                <p className="text-slate-600 font-semibold text-sm md:text-base leading-relaxed">
                  Traditional credit card processors are built for humans spending $10+. When an automated agent attempts to execute micro-transactions on the fly, credit card transaction taxes consume up to 90% of the value.
                </p>

                {/* Interactive Slider Input */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-600">Simulate Number of Agent API Calls:</span>
                    <span className="bg-orange-100 text-orange-700 font-black px-3 py-1 rounded-full text-xs">
                      {apiCalls.toLocaleString()} Calls
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="50000"
                    step="100"
                    value={apiCalls}
                    onChange={(e) => setApiCalls(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>100 Calls</span>
                    <span>25,000 Calls</span>
                    <span>50,000 Calls</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Graph Chart */}
              <div className="lg:col-span-5 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
                <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Total Developer Cost Surcharge
                </div>
                
                <div className="space-y-4">
                  {/* Stripe Card Cost Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-red-500">Stripe Card Billing</span>
                      <span>${stripeCost.toFixed(2)}</span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden relative">
                      <motion.div 
                        className="h-full bg-red-500"
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="absolute inset-y-0 left-2 text-[9px] text-white flex items-center font-bold font-mono">
                        90% Fee Overhead
                      </span>
                    </div>
                  </div>

                  {/* AgentPay Lightning Cost Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-emerald-600 font-black">AgentPay L402 (Lightning)</span>
                      <span>${l402Cost.toFixed(2)}</span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden relative">
                      <motion.div 
                        className="h-full bg-emerald-500"
                        animate={{ width: `${Math.max(8, (l402Cost / stripeCost) * 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-100 border border-orange-200 text-orange-800 rounded-2xl text-center space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider font-mono">
                    Estimated Savings
                  </div>
                  <div className="text-2xl font-black tracking-tight">
                    ${savings.toFixed(2)}
                  </div>
                  <div className="text-[10px] font-semibold opacity-90">
                    Bypasses 3DS loops, human Captchas, and transaction taxation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. THE OPPORTUNITY (Satoshi Lightning Tunnel with active console log) */}
        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-orange-500/5 relative overflow-hidden">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-orange-500 font-black text-sm uppercase tracking-wider">Chapter 03</span>
              <div className="w-12 h-[2px] bg-orange-300" />
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">The Opportunity</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                  The Sovereign <span className="text-orange-600">Payment Network.</span>
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-semibold">
                  By giving agents their own programmable Lightning wallet, we solve the payment gate block. We are not just creating a wallet—we are launching the <strong>&quot;Visa for AI Agents&quot;</strong>.
                </p>
                
                <div className="space-y-4 pt-2">
                  {[
                    { title: "The Buyer (Wallet Connector)", subtitle: "Empowers the Agent's Hands", desc: "Integrates directly with client-side agents via WebLN, allowing them to autonomously resolve payment checks off-chain without credit card requirements." },
                    { title: "The Seller (L402 Guard)", subtitle: "Guards the Developer's API", desc: "Acts as a cryptographic gatekeeper. When called, it halts requests with an HTTP 402 challenge and returns an invoice, granting access upon payment preimage validation." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-none">{item.title}</h4>
                        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1 mb-1.5">{item.subtitle}</div>
                        <p className="text-xs text-slate-500 leading-normal font-semibold">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Satoshi energy tunnel simulation */}
              <div className="lg:col-span-5 h-[360px] rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl font-mono text-xs">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1e201e_0%,transparent_80%)] pointer-events-none" />
                
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Network: ACTIVE</span>
                  <span className="text-emerald-400 font-bold animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> SECURE_TUNNEL
                  </span>
                </div>

                {/* Energy beam tunnel animation */}
                <div className="relative flex items-center justify-center h-32 overflow-hidden my-2">
                  <div className="absolute w-[2px] h-36 bg-gradient-to-b from-orange-500 via-amber-400 to-yellow-300 rounded-full animate-pulse shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
                  
                  {/* Floating satoshi particles */}
                  <motion.div 
                    animate={{ y: [-50, 50], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-7 h-7 rounded-full border border-orange-500/60 bg-slate-900 flex items-center justify-center text-orange-400 font-black text-[9px]"
                  >
                    ⚡
                  </motion.div>
                  
                  <motion.div 
                    animate={{ y: [50, -50], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                    className="absolute w-7 h-7 rounded-full border border-emerald-500/60 bg-slate-900 flex items-center justify-center text-emerald-400 font-black text-[9px]"
                  >
                    sats
                  </motion.div>
                </div>

                {/* Live Console Output Stream */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative z-10 text-[10px] space-y-1.5 font-mono max-h-[140px] overflow-hidden text-left">
                  <div className="text-slate-500 text-[9px] uppercase tracking-wider mb-1 border-b border-slate-800 pb-1">
                    Live Satoshi tunnel logs:
                  </div>
                  <AnimatePresence>
                    {satLogs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`leading-relaxed text-[9px] ${
                          log.type === "success" ? "text-emerald-400" :
                          log.type === "warn" ? "text-amber-400" : "text-slate-400"
                        }`}
                      >
                        {log.type === "success" ? "✓" : log.type === "warn" ? "⚡" : "•"} {log.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE NEW WAY (Before vs After) */}
        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-orange-500/5 relative overflow-hidden">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-orange-500 font-black text-sm uppercase tracking-wider">Chapter 04</span>
              <div className="w-12 h-[2px] bg-orange-300" />
              <span className="text-[10px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">The New Way</span>
            </div>

            <div className="text-center md:text-left space-y-3">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Before & After AgentPay:
              </h3>
              <p className="text-slate-600 font-semibold text-sm md:text-base">
                How work gets transformed once agents gain the capacity to settle invoices autonomously.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              {/* Before */}
              <div className="p-6 rounded-2xl bg-red-50/50 border border-red-200 space-y-4">
                <h4 className="font-black text-red-600 text-lg flex items-center gap-2">
                  <span>✕</span> The Legacy Way (Human-in-the-Loop)
                </h4>
                <ul className="space-y-3 text-xs md:text-sm text-slate-600 font-semibold list-inside list-decimal leading-relaxed">
                  <li>The agent hits a paywall and halts.</li>
                  <li>Sends a slack/email alert to a human developer.</li>
                  <li>Human opens a laptop, signs up for a monthly SaaS sub plan.</li>
                  <li>Enters credit card info, receives bank OTP SMS.</li>
                  <li>Paste token back to config and manually restarts script.</li>
                  <li className="text-red-600 font-bold">Process Time: 45 minutes of human friction.</li>
                </ul>
              </div>

              {/* After */}
              <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4 shadow-lg shadow-emerald-500/5">
                <h4 className="font-black text-emerald-600 text-lg flex items-center gap-2">
                  <span>✓</span> The Autonomous Way (AgentPay L402)
                </h4>
                <ul className="space-y-3 text-xs md:text-sm text-slate-600 font-semibold list-inside list-decimal leading-relaxed">
                  <li>Agent hits L402 HTTP 402 Paywall challenge.</li>
                  <li>Reads invoice, negotiates price against budget caps.</li>
                  <li>Requests Lightning wallet to pay the satoshi invoice.</li>
                  <li>Wallet settles invoice programmatically off-chain.</li>
                  <li>Presents preimage token and completes task instantly.</li>
                  <li className="text-emerald-600 font-bold">Process Time: 400 milliseconds. 0 human steps.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* HIGH-IMPACT EXPLICIT SECTION: WHAT DOES AGENTPAY DO? */}
        <section className="bg-white border-2 border-orange-500 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-orange-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-400/10 to-amber-400/5 rounded-full blur-3xl" />
          <div className="absolute -top-1 left-12 bg-orange-500 text-white font-mono font-bold uppercase tracking-widest text-[9px] px-5 py-2 rounded-b-xl shadow-sm">
            Core Action
          </div>
          
          <div className="space-y-10 relative z-10">
            <div className="text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  What does <span className="text-orange-600">AgentPay</span> do?
                </h2>
                <span className="w-fit bg-blue-100 text-blue-700 font-mono font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-blue-200 leading-none">
                  Architectural Truth
                </span>
              </div>
              <p className="text-slate-600 font-semibold text-sm md:text-base leading-relaxed max-w-4xl">
                AgentPay is <strong>NOT just a wallet</strong>. It is the complete <strong>Sovereign Payment Network (the &quot;Visa for AI Agents&quot;)</strong> that bridges buyer wallets, seller paywalls, and trust registries together programmatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {[
                {
                  title: "1. The Buyer (Wallet Connector)",
                  subtitle: "Empowers the Agent's Hands",
                  desc: "Integrates with browser and node-based Lightning wallets (Alby/WebLN). Allows AI agents to pay invoice challenges programmatically in under 500ms without human friction.",
                  color: "from-orange-500 to-amber-500 shadow-orange-500/20",
                  icon: <Wallet className="w-5 h-5 text-white" />
                },
                {
                  title: "2. The Seller (L402 Tollbooth)",
                  subtitle: "Guards the Developer's API",
                  desc: "Acts as a cryptographic gateway. When an agent requests a paid AI service, it challenges them with an HTTP 402 Lightning Invoice, verifying the settled hash instantly.",
                  color: "from-amber-500 to-yellow-500 shadow-amber-500/20",
                  icon: <Lock className="w-5 h-5 text-white" />
                },
                {
                  title: "3. The Registry (Trust Ledger)",
                  subtitle: "Orchestrates the Market",
                  desc: "A central directory cataloging and ranking AI services. Compiles real-time reputation scores based on ledger transactions to guarantee node-to-node security.",
                  color: "from-yellow-500 to-orange-400 shadow-yellow-500/20",
                  icon: <Activity className="w-5 h-5 text-white" />
                }
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:scale-102 hover:shadow-md transition-all">
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <div className={`w-fit px-3 py-1 rounded-xl bg-gradient-to-r ${item.color} text-white font-bold text-[10px] shadow-sm`}>
                        {item.title}
                      </div>
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${item.color} shadow-sm`}>
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest ml-1">
                        {item.subtitle}
                      </div>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-semibold mt-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. EXPERT FAQ SECTION */}
        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-orange-500/5 relative overflow-hidden">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="font-mono text-orange-500 font-black text-sm uppercase tracking-wider">Chapter 05</span>
              <div className="w-12 h-[2px] bg-orange-300" />
              <span className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">Expert FAQ</span>
            </div>

            <div className="text-center md:text-left space-y-3">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Major Concerns & Architectural Answers
              </h3>
              <p className="text-slate-600 font-semibold text-sm md:text-base">
                Click any question to view the deep technical breakdown of the payment engine.
              </p>
            </div>

            {/* Accordion FAQ UI */}
            <div className="space-y-4 pt-4">
              {[
                {
                  q: "1. Why do we need a custom payment network? Gemini already writes poems and codes.",
                  a: "Gemini is the 'Brain' that reasons; AgentPay is the 'Wallet & Rails' that allows it to act. Gemini can compose text, but it cannot programmatically pay another server. For instance, if your agent needs to fetch local market prices from a private API, it hits a Stripe checkout form. An AI cannot open bank accounts, fill card forms, or solve SMS OTP verification codes. AgentPay solves this bottleneck, allowing agents to pay Lightning L402 invoices in under 500ms autonomously."
                },
                {
                  q: "2. What is the guarantee this won't bankrupt me due to some AI hallucination loop?",
                  a: "AgentPay is built on a 4-layer cryptographic firewall: 1) Prepaid Wallet Model: It has absolutely zero connection to your credit cards or bank accounts. The agent only has access to a pre-funded local wallet. If you deposit $5, the maximum absolute risk is exactly $5. 2) Task Budget Caps: Hard satoshi spending limits set per task. 3) Human-in-the-Loop Triggers: Auto-approves micro-payments (e.g. < 20 sats), but halts and requests dashboard approval for larger transactions. 4) Loop Anomaly Lock: Revokes session tokens automatically if identical requests are triggered in a loop."
                },
                {
                  q: "3. But people just buy SaaS subscriptions. Why would they choose pay-per-use micropayments?",
                  a: "Monthly subscriptions are unviable for high-speed automated agents. First, if a travel research agent needs to consult 50 different specialized API engines to compile a report, paying a $15/mo sub for each tool equals $750/month in overhead just to compile one page! L402 micropayments allow the agent to pay exactly $0.0003 per call, costing $0.01 total. Second, flat subscription plans lose massive revenue on machine automation speeds, forcing APIs to set strict rate limits. Pay-per-call has zero rate limits because compute is priced dynamically."
                },
                {
                  q: "4. If the cloud database (like Supabase) is paused or offline, does the entire app crash?",
                  a: "No! The marketplace is designed with full resilience and local bypass modes. If the cloud postgres registry is offline, the Agent's coordinator queries fall back automatically to locally cached mock stubs (e.g. Muse AI Writer, Polyglot, CodeGuard). It continues to execute the full off-chain Lightning challenge-settlement sequence locally. The core transaction framework continues to work perfectly."
                },
                {
                  q: "5. Can I list a specialized agent trained on my private domestic marketplace data to monetize it?",
                  a: "Yes! This is the core revenue opportunity of AgentPay. If you ground or train a specialized micro-agent on your proprietary local databases (e.g. domestic catalog inventories, local supplier details), you can deploy its API, wrap it in an L402 Guard (e.g., charging 5 sats per call), and register it in the marketplace. Other global coordinator bots will discover your agent, query it autonomously for local data, and pay your wallet directly 24/7 with zero human overhead."
                },
                {
                  q: "6. Is AgentPay just a Bitcoin wallet, or does it do something more?",
                  a: "AgentPay is NOT just a wallet—it is the entire Sovereign Payment Network (the 'Visa for AI Agents'). It connects to existing client wallets (WebLN) on the buyer side, provides cryptographic tollbooths (L402 Guards) on the developer's API side, and operates a decentralized trust registry that logs transaction hashes on an immutable ledger to dynamically calculate reputation scores."
                }
              ].map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-6 text-left flex justify-between items-center font-bold text-slate-900 text-xs md:text-sm hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex gap-3 items-center">
                        <QuestionIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="p-6 pt-0 pl-14 border-t border-slate-200/50 text-slate-600 text-xs md:text-sm font-semibold leading-relaxed bg-white/70">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
