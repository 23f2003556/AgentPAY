"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlueprintBackground } from "@/components/ui/BlueprintBackground";

type Payment = {
  id: string;
  payment_hash: string;
  amount_sats: number;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
  confirmed_at?: string;
  services?: { name: string; category: string };
};

function formatAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function Feed() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [connected, setConnected] = useState(false);
  const [totalSats, setTotalSats] = useState(0);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  // Tick every 10s to refresh relative timestamps
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/payments/stream");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "history") {
        setPayments(msg.payments || []);
        setTotalSats(msg.payments?.reduce((a: number, p: Payment) => a + (p.amount_sats || 0), 0) || 0);
      }
      if (msg.type === "new_payment") {
        setPayments(prev => [msg.payment, ...prev.slice(0, 49)]);
        setTotalSats(prev => prev + (msg.payment.amount_sats || 0));
        // Mark as new for animation
        const id = msg.payment.id;
        setNewIds(prev => new Set(prev).add(id));
        setTimeout(() => setNewIds(prev => { const s = new Set(prev); s.delete(id); return s; }), 1500);
        // Flash border
        if (feedRef.current) {
          feedRef.current.style.boxShadow = "0 0 0 2px #f97316, 0 0 24px rgba(249,115,22,0.25)";
          setTimeout(() => { if (feedRef.current) feedRef.current.style.boxShadow = ""; }, 700);
        }
      }
      if (msg.type === "payment_update") {
        setPayments(prev => prev.map(p => p.id === msg.payment.id ? { ...p, ...msg.payment } : p));
      }
    };
    return () => es.close();
  }, []);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000); // Update every 10s
    return () => clearInterval(timer);
  }, []);

  const last60s = useMemo(() => 
    payments.filter(p => (now - new Date(p.created_at).getTime()) < 60000),
    [payments, now]
  );
  const last60sSats = useMemo(() => 
    last60s.reduce((a, p) => a + (p.amount_sats || 0), 0),
    [last60s]
  );

  const statusBadge = (status: string) => {
    if (status === "confirmed") return (
      <span className="text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
        <span>✓</span> Confirmed
      </span>
    );
    if (status === "pending") return (
      <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1 flex-shrink-0">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
      </span>
    );
    return (
      <span className="text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
        <span>✕</span> Failed
      </span>
    );
  };

  return (
    <div className="relative">
      <BlueprintBackground type="monitor" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .payment-slide-in {
            animation: slideDown 220ms cubic-bezier(0.22,1,0.36,1) forwards;
          }
        `}</style>
        <PageHeader 
          tag="Network Activity Monitor"
          title="Live"
          highlight="Payment Feed"
          description="Watch sats settle between agents in real time."
        />

        <div className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl border transition-all flex-shrink-0 shadow-sm ${
          connected
            ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30"
            : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        }`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            connected ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-slate-400"
          }`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${
            connected ? "text-green-700 dark:text-green-400" : "text-slate-500"
          }`}>
            {connected ? "LIVE_NODE_UP" : "ESTABLISHING..."}
          </span>
        </div>
      </div>

      {/* Activity summary line */}
      {payments.length > 0 && (
        <div className="mb-6 px-5 py-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl text-sm font-medium text-orange-700 dark:text-orange-400 flex items-center gap-2">
          <span>
            {last60s.length > 0
              ? <><span className="font-bold">{last60s.length} payment{last60s.length !== 1 ? "s" : ""} in the last 60s</span>{last60sSats > 0 && <span className="opacity-70"> · {last60sSats} sats moved</span>}</>
              : <span className="font-bold">Quiet right now — run the demo to move some sats</span>
            }
          </span>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sats Moved</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalSats.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payments</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{payments.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Confirmed</div>
          <div className="text-3xl font-black text-green-600 dark:text-green-400">
            {payments.filter(p => p.status === "confirmed").length}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div ref={feedRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Payment Stream</span>
          <span className="text-xs font-medium text-slate-400 tracking-wider">NEWEST FIRST</span>
        </div>

        {payments.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-orange-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No payments yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs text-sm">
              Run the demo and watch sats appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {payments.map((p, i) => {
              const isNew = newIds.has(p.id);
              const isConfirmed = p.status === "confirmed";
              return (
                <div
                  key={p.id || i}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 gap-4 sm:gap-0 transition-colors duration-200 ${
                    isNew ? "payment-slide-in bg-orange-50/60 dark:bg-orange-500/5" :
                    isConfirmed ? "hover:bg-green-50/30 dark:hover:bg-green-500/5" :
                    "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                  }`}
                >
                  {/* Confirmed left border */}
                  {isConfirmed && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-green-500 rounded-r" />
                  )}

                  <div className="flex items-center gap-4 pl-1">
                    <div className={`rounded-xl p-2.5 flex-shrink-0 ${isConfirmed ? "bg-green-50 dark:bg-green-500/10" : "bg-slate-100 dark:bg-slate-800"}`}>
                      <span className="text-lg">{isConfirmed ? "✅" : "💸"}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {p.services?.name || "Unknown Service"}
                        </span>
                        {statusBadge(p.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                          {p.payment_hash?.slice(0, 16)}...
                        </span>
                        <span>·</span>
                        <span>{formatAgo(p.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0.5">
                    <span className={`font-black text-xl font-mono px-3 py-1.5 rounded-xl ${
                      isConfirmed
                        ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10"
                        : "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10"
                    }`}>
                      {p.amount_sats}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SATS</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
