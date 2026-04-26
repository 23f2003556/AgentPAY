"use client";
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlueprintBackground } from "@/components/ui/BlueprintBackground";

type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  price_sats: number;
  provider_name: string;
  reputation: Array<{ score: number; total_requests: number; total_sats_earned: number }>;
};

const CATEGORIES = ["all", "summarization", "code-review", "image-analysis", "data-lookup", "translation", "verification"];
const CATEGORY_LABELS: Record<string, string> = {
  all: "All Services", summarization: "Summarization", "code-review": "Code Review",
  "image-analysis": "Image Analysis", "data-lookup": "Data Lookup",
  translation: "Translation", verification: "Verification",
};
const PAGE_SIZE = 10;

function getTier(score: number) {
  if (score >= 8) return {
    emoji: "🥇", label: "TOP RATED",
    border: "border-amber-300 dark:border-amber-500/40",
    badge: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    glow: "hover:shadow-amber-500/15",
    topBadge: true,
  };
  if (score >= 5) return {
    emoji: "🥈", label: "SILVER",
    border: "border-slate-200 dark:border-slate-800",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    glow: "hover:shadow-slate-900/10",
    topBadge: false,
  };
  return {
    emoji: "🥉", label: "BRONZE",
    border: "border-slate-200 dark:border-slate-700",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500",
    glow: "",
    topBadge: false,
    muted: true,
  };
}

function getScoreColor(score: number) {
  if (score >= 8) return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10";
  if (score >= 5) return "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800";
  return "text-slate-400 bg-slate-50 dark:bg-slate-800/50";
}

export default function Marketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setShowAll(false);
    const params = new URLSearchParams();
    if (category !== "all") params.append("category", category);
    params.append("sort", sortBy);
    try {
      const res = await fetch(`/api/services?${params}`);
      const d = await res.json();
      setServices(d.services || []);
    } finally {
      setLoading(false);
    }
  }, [category, sortBy]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchServices();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchServices]);

  // Refresh stats every 30s
  useEffect(() => {
    const interval = setInterval(fetchServices, 30000);
    return () => clearInterval(interval);
  }, [fetchServices]);

  const totalTxns = services.reduce((a, s) => a + (s.reputation?.[0]?.total_requests || 0), 0);
  const totalSats = services.reduce((a, s) => a + (s.reputation?.[0]?.total_sats_earned || 0), 0);
  const visibleServices = showAll ? services : services.slice(0, PAGE_SIZE);

  return (
    <div className="relative">
      <BlueprintBackground type="grid" />
      
      <div className="relative z-10">
        <PageHeader 
          tag="Capability Registry v1.0"
          title="Agent"
          highlight="Marketplace"
          description="AI services priced in sats. Pay per call via Lightning — no subscriptions, no API keys."
        />


      {/* Live stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Services", value: services.length.toString(), suffix: "" },
          { label: "Calls Made", value: totalTxns.toLocaleString(), suffix: "" },
          { label: "Sats Moved", value: totalSats.toLocaleString(), suffix: "" },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}<span className="text-orange-500">{stat.suffix}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">updates every 30s</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex gap-2 flex-wrap flex-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                category === cat
                  ? "bg-slate-900 dark:bg-orange-500 text-white shadow-md scale-105"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
        <select
          title="Sort By"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all cursor-pointer"
        >
          <option value="score">⭐ Top Rated</option>
          <option value="price">💸 Cheapest First</option>
          <option value="newest">🆕 Newest</option>
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 h-56 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-lg font-bold text-slate-700 dark:text-slate-300">Nothing here yet</div>
          <p className="text-slate-500 mt-2">
            No services in this category.{" "}
            <button onClick={() => setCategory("all")} className="text-orange-500 underline font-semibold">View all</button>
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleServices.map(service => {
              const score = service.reputation?.[0]?.score ?? 5;
              const requests = service.reputation?.[0]?.total_requests ?? 0;
              const tier = getTier(score);
              return (
                <div
                  key={service.id}
                  className={`relative bg-white dark:bg-slate-900 border-2 ${tier.border} rounded-2xl p-6 transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1 ${tier.glow} ${"muted" in tier && tier.muted ? "opacity-80" : ""}`}
                >
                  {tier.topBadge && (
                    <div className="absolute -top-3 left-5 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-0.5 rounded-full shadow-md">
                      ⭐ Top Rated
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className={`font-bold text-lg mb-1 transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400 ${score < 5 ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                        {service.name}
                      </h3>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        by <span className="text-slate-700 dark:text-slate-300 font-medium">{service.provider_name}</span>
                      </div>
                    </div>
                    {/* Price — most prominent element */}
                    <div className="text-right bg-orange-50 dark:bg-orange-500/10 px-4 py-3 rounded-xl border border-orange-100 dark:border-orange-500/20 ml-4 min-w-[90px] flex-shrink-0">
                      <div className="font-black text-2xl text-orange-600 dark:text-orange-400 leading-none">{service.price_sats}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mt-1">SATS / CALL</div>
                    </div>
                  </div>

                  <p className={`text-sm leading-relaxed mb-5 line-clamp-2 ${score < 5 ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-400"}`}>
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span>{tier.emoji}</span>
                      <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${getScoreColor(score)}`}>
                        {Number(score).toFixed(1)}
                      </div>
                      <span className="text-xs font-mono text-slate-400">{requests} calls</span>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg">
                      {service.category.replace("-", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {services.length > PAGE_SIZE && (
            <div className="mt-8 text-center">
              {!showAll ? (
                <button
                  onClick={() => setShowAll(true)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-8 py-3 rounded-xl hover:border-orange-300 hover:text-orange-600 dark:hover:border-orange-500/50 dark:hover:text-orange-400 transition-all"
                >
                  View all {services.length} services ↓
                </button>
              ) : (
                <button onClick={() => setShowAll(false)} className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                  Show less ↑
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
    </div>
  );
}
