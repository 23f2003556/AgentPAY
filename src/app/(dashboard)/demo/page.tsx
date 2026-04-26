"use client";
import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlueprintBackground } from "@/components/ui/BlueprintBackground";

type Step = { label: string; status: "waiting" | "running" | "done" | "error"; detail?: string };

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StepIcon({ status }: { status: Step["status"] }) {
  if (status === "done") return (
    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-sm shadow-green-500/30 flex-shrink-0">
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
  if (status === "running") return (
    <div className="w-7 h-7 rounded-full bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-400 flex items-center justify-center flex-shrink-0">
      <Spinner />
    </div>
  );
  if (status === "error") return (
    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
      <span className="text-red-500 text-xs font-bold">✕</span>
    </div>
  );
  return <div className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-slate-700 flex-shrink-0" />;
}

export default function DemoPage() {
  const [task, setTask] = useState("Summarize https://spiral.xyz and check the current BTC price");
  const [steps, setSteps] = useState<Step[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [displayedSats, setDisplayedSats] = useState(0);
  const [wallet, setWallet] = useState<{ balance_sats: number; lightning_address: string } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const paymentQueue = useRef<number[]>([]);
  const processingQueue = useRef(false);

  useEffect(() => {
    fetch("/api/wallet").then(r => r.json()).then(d => { if (!d.error) setWallet(d); }).catch(() => {});
  }, []);

  function drainQueue() {
    if (processingQueue.current || paymentQueue.current.length === 0) return;
    processingQueue.current = true;
    const amount = paymentQueue.current.shift()!;
    setDisplayedSats(prev => prev + amount);
    setTimeout(() => {
      processingQueue.current = false;
      drainQueue();
    }, 900);
  }

  const updateStep = (index: number, update: Partial<Step>) =>
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, ...update } : s));

  const runDemo = async () => {
    setRunning(true);
    setResult(null);
    setDisplayedSats(0);
    setErrorBanner(null);
    paymentQueue.current = [];
    processingQueue.current = false;

    setSteps([
      { label: "Parsing task intent", status: "running" },
      { label: "Querying L402 marketplace for relevant capabilities", status: "waiting" },
      { label: "Evaluating reputation scores and quoting prices", status: "waiting" },
      { label: "Executing summarization & paying via Lightning", status: "waiting" },
      { label: "Executing oracle lookup & paying via Lightning", status: "waiting" },
      { label: "Synthesizing retrieved context into final response", status: "waiting" },
    ]);

    try {
      const res = await fetch("/api/demo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";
        for (const block of blocks) {
          for (const line of block.split("\n").filter(l => l.startsWith("data: "))) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === "step") {
                if (event.index === -1) setErrorBanner(event.detail);
                else updateStep(event.index, { status: event.status, detail: event.detail });
              }
              if (event.type === "payment") {
                paymentQueue.current.push(event.amount);
                drainQueue();
              }
              if (event.type === "done") { setResult(event.result); setRunning(false); }
            } catch {}
          }
        }
      }
    } catch (e: unknown) {
      setRunning(false);
      setErrorBanner(e instanceof Error ? e.message : "Failed to run demo");
    }
  };

  const hasRun = steps.length > 0;

  return (
    <div className="relative">
      <BlueprintBackground type="brain" />

      <div className="relative z-10 max-w-3xl mx-auto py-8">
        <div className="text-center mb-10">
          <style>{`
            @keyframes countUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            .count-up { animation: countUp 280ms ease-out; }
          `}</style>
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest text-xs px-3 py-1.5 rounded-full mb-4 border border-orange-100 dark:border-orange-500/20">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Live
          </div>
          <PageHeader 
            tag="Autonomous Transaction Demo"
            title="Watch an"
            highlight="Agent Pay"
            description="One agent. Two services. Real Bitcoin. No humans."
          />
        </div>


      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-5">

          {/* Task input card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-r" />
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Task</label>
            <textarea
              title="Agent task"
              value={task}
              onChange={e => setTask(e.target.value)}
              rows={3}
              disabled={running}
              className="w-full bg-transparent text-slate-900 dark:text-white text-base font-medium resize-none focus:outline-none"
            />

            {!hasRun && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 mb-4 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                The agent queries the marketplace, picks the best services, pays each one a Lightning invoice, and returns the result — end to end, no human steps.
              </p>
            )}

            <button
              onClick={runDemo}
              disabled={running || !task.trim()}
              className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {running ? (<><Spinner /> Running...</>) : (<>▶ Run Agent</>)}
            </button>

            {wallet && (
              <div className="flex items-center justify-between text-xs font-mono bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 mt-3">
                <span>Wallet: <strong className="text-slate-900 dark:text-white">{wallet.balance_sats.toLocaleString()} sats</strong></span>
                <span className="text-slate-400">{wallet.lightning_address}</span>
              </div>
            )}
            {errorBanner && (
              <div className="mt-3 p-3 border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
                <span>⚠</span> {errorBanner}
              </div>
            )}
          </div>

          {/* Steps */}
          {hasRun && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Agent Steps</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spent:</span>
                  <span key={displayedSats} className="count-up bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-black px-3 py-1 rounded-full border border-orange-200 dark:border-orange-500/30 font-mono">
                    {displayedSats} SATS
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-1">
                {steps.map((step, i) => (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-300 ${
                    step.status === "running" ? "bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20" :
                    step.status === "waiting" ? "opacity-35" :
                    "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}>
                    <div className="mt-0.5"><StepIcon status={step.status} /></div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${
                        step.status === "running" ? "text-orange-700 dark:text-orange-400" :
                        step.status === "done" ? "text-slate-800 dark:text-slate-200" : "text-slate-400"
                      }`}>{step.label}</div>
                      {step.detail && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg inline-block">
                          {step.detail}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <div className="lg:sticky lg:top-24">
          <div className={`rounded-2xl border overflow-hidden transition-all duration-500 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 min-h-[400px] flex flex-col ${
            result ? "border-green-400/60 shadow-[0_0_40px_rgba(34,197,94,0.12)]" : "border-slate-800"
          }`}>
            <div className="bg-white/5 border-b border-white/10 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${result ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" : running ? "bg-orange-500 animate-pulse" : "bg-slate-600"}`} />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Result</span>
              </div>
              {result && (
                <span className="text-xs bg-green-500/20 text-green-400 font-bold px-3 py-1 rounded-full border border-green-500/30">
                  ✓ Done
                </span>
              )}
            </div>
            <div className="flex-1 p-6">
              {result ? (
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[560px] overflow-y-auto">
                  {result}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-30">
                  {running ? (
                    <><Spinner /><div className="text-xs font-mono text-slate-400 mt-2">Working...</div></>
                  ) : (
                    <div className="text-xs font-mono text-slate-400 max-w-[180px] leading-relaxed">
                      Results appear here after the agent finishes.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
