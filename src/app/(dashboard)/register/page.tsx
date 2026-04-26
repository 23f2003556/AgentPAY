"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlueprintBackground } from "@/components/ui/BlueprintBackground";

const CATEGORIES = ["summarization", "code-review", "image-analysis", "data-lookup", "translation", "verification", "other"];

export default function RegisterService() {
  const [form, setForm] = useState({
    name: "", description: "", category: "summarization",
    endpoint_url: "", price_sats: 10, provider_id: "", provider_name: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serviceId, setServiceId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/services/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setServiceId(data.service.id);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(serviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto py-20 px-6">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200 dark:border-green-500/30">
              <svg className="w-9 h-9 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Service deployed!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Your service is now discoverable by agents worldwide.
            </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Service UUID</div>
            <button
              onClick={copyId}
              className="text-[10px] font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <div className="text-sm font-mono text-green-400 break-all leading-relaxed select-all">
            {serviceId}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-400 mb-6 leading-relaxed">
          <strong>Next step for developers:</strong> Add <code className="bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded font-mono text-xs">SUMMARIZE_SERVICE_ID={serviceId.slice(0, 8)}...</code> to your <code className="font-mono text-xs">.env.local</code> and use this UUID in your <code className="font-mono text-xs">l402Guard()</code> calls.
        </div>

        <div className="flex gap-3">
          <a
            href="/market"
            className="flex-1 text-center inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-6 py-3.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
          >
            View on Marketplace →
          </a>
          <button
            onClick={() => { setStatus("idle"); setServiceId(""); setForm({ name: "", description: "", category: "summarization", endpoint_url: "", price_sats: 10, provider_id: "", provider_name: "" }); }}
            className="px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Register another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <BlueprintBackground type="schematic" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <PageHeader 
          tag="Service Deployment Registry"
          title="List a"
          highlight="Service"
          description="Register your agent's capability. Automatically receive Lightning payments for every successful request — no accounts, no API keys."
        />


      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">

        {/* Service name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Service name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Universal Image Analyzer"
            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
          <textarea
            title="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Explain inputs, outputs, and value proposition for autonomous agents..."
            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 resize-none font-sans"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
            <select
              title="Category"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium appearance-none cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}</option>)}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Price per call <span className="font-normal text-slate-400">(sats)</span>
            </label>
            <input
              type="number"
              value={form.price_sats}
              onChange={e => setForm(f => ({ ...f, price_sats: Number(e.target.value) }))}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-mono">1 sat ≈ $0.00001 USD · suggested: 1–100 sats</p>
          </div>
        </div>

        {/* Endpoint URL — monospace */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">L402 Endpoint URL</label>
          <input
            type="url"
            value={form.endpoint_url}
            onChange={e => setForm(f => ({ ...f, endpoint_url: e.target.value }))}
            placeholder="https://your-agent.com/api/run"
            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 font-mono"
          />
          <p className="text-xs text-slate-400 mt-1.5">This route must return a 402 when called without an <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Authorization: L402</code> header.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Provider name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Provider name</label>
            <input
              type="text"
              value={form.provider_name}
              onChange={e => setForm(f => ({ ...f, provider_name: e.target.value }))}
              placeholder="e.g. NeuralNet Labs"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Lightning address */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Lightning address</label>
            <input
              type="text"
              value={form.provider_id}
              onChange={e => setForm(f => ({ ...f, provider_id: e.target.value }))}
              placeholder="you@getalby.com"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-400 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1.5 font-mono">your@getalby.com or Lightning pubkey</p>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className="w-full relative overflow-hidden group bg-orange-500 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:pointer-events-none"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {status === "loading" ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Registering Agent...</>
              ) : (
                                <>Deploy to Marketplace</>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {status === "error" && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl text-center">
              ⚠️ Registration failed. Check all fields and try again.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
