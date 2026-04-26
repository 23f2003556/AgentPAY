"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  Cpu, 
  Globe, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Coins, 
  Layers,
  Activity,
  UserCheck,
  TrendingUp,
  DollarSign
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
} as const;

const SourceBadge = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded ml-1.5 hover:bg-orange-500 hover:text-white transition-all cursor-help uppercase tracking-tighter"
  >
    Source: {children}
  </a>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-slate-200/50 bg-white/70 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">AgentPay</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/market" className="text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors">Marketplace</Link>
            <Link href="/demo" className="text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors">Demo</Link>
            <Link 
              href="/register" 
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
            >
              Start Earning
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. Hero: THE OFFERING (Clean & High Energy) */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-white">
        {/* Animated Background Illustrations */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_50%,#f9731608_0%,transparent_100%)]" />
          
          {/* Floating Nodes & Connections */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.4] dark:opacity-[0.2]">
            <motion.circle
              animate={{ x: [100, 120, 100], y: [100, 80, 100] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              cx="10%" cy="20%" r="40" className="fill-orange-500/5 stroke-orange-500/10" strokeWidth="1"
            />
            <motion.circle
              animate={{ x: [-20, 0, -20], y: [50, 70, 50] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              cx="85%" cy="15%" r="60" className="fill-orange-500/5 stroke-orange-500/10" strokeWidth="1"
            />
            <motion.circle
              animate={{ x: [30, 10, 30], y: [-40, -20, -40] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              cx="20%" cy="75%" r="80" className="fill-orange-500/5 stroke-orange-500/10" strokeWidth="1"
            />
            
            {/* Pulsing "Data Lines" */}
            <motion.path 
              d="M 10% 20% Q 40% 10% 85% 15%" 
              fill="none" stroke="url(#line-grad)" strokeWidth="1" strokeDasharray="5,10"
              animate={{ strokeDashoffset: [0, -50] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            <motion.path 
              d="M 85% 15% Q 60% 50% 20% 75%" 
              fill="none" stroke="url(#line-grad)" strokeWidth="1" strokeDasharray="8,12"
              animate={{ strokeDashoffset: [0, 50] }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
            
            <defs>
              <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Orbiting "Sats" Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-orange-400 rounded-full blur-[1px]"
              initial={{ x: "50%", y: "40%" }}
              animate={{ 
                x: [
                  `${50 + 40 * Math.cos(i * 60 * Math.PI/180)}%`, 
                  `${50 + 40 * Math.cos((i * 60 + 360) * Math.PI/180)}%`
                ],
                y: [
                  `${40 + 20 * Math.sin(i * 60 * Math.PI/180)}%`, 
                  `${40 + 20 * Math.sin((i * 60 + 360) * Math.PI/180)}%`
                ],
                opacity: [0, 0.4, 0]
              }}
              transition={{ 
                duration: 15 + i * 2, 
                repeat: Infinity, 
                ease: "linear",
                delay: i * 0.5 
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10 min-h-[60vh] flex flex-col items-center justify-center">
          <motion.h1 
            {...fadeInUp}
            className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]"
          >
            Turn Every AI Inference <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
              Into Instant Revenue.
            </span>
          </motion.h1>

          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Monetize every AI inference at machine speed. Settle instantly on Lightning, bypass human bottlenecks, and build a profitable agent economy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-20 flex flex-col items-center gap-3 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]"
          >
            <span>Scroll to discover the machine economy</span>
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-12 rounded-full bg-gradient-to-b from-orange-500 to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* 2. The Problem: THE FRICTION (High Contrast / Dark Mode) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-orange-500 font-black uppercase tracking-widest text-xs mb-4">The Revenue Leak</div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Traditional rails kill <br />
                <span className="text-orange-500 italic">Agentic ROI.</span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Stripe and PayPal were built for humans with credit cards. They aren&apos;t just slow for agents—they make them <strong className="text-white">unprofitable.</strong>
              </p>
              <div className="space-y-6">
                {[
                  { title: "Economic Impossible", text: <>{`Stripe charges $0.30 per txn. A $0.01 agent call loses 30x its value instantly.`}<SourceBadge href="https://stripe.com/pricing">Stripe Pricing</SourceBadge></>, color: "text-red-400" },
                  { title: "Human Deadlocks", text: "Captchas and 3DS approvals leave your agents waiting for hours. Time is money.", color: "text-orange-400" },
                  { title: "Custodial Risk", text: "Centralized rails can freeze your revenue at any moment for any reason.", color: "text-slate-400" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <div>
                      <h4 className={`font-bold mb-1 ${item.color}`}>{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Revenue Comparison</div>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400">Traditional (Stripe)</span>
                    <span className="text-red-400">-$0.29 Net Loss</span>
                  </div>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[10%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400">AgentPay (Lightning)</span>
                    <span className="text-emerald-400">+$0.0099 Net Profit</span>
                  </div>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[95%]" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono text-center pt-4">Calculated for $0.01 micro-service call</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Solution: SPEED & SCALE (Vibrant Orange Gradient) */}
      <section className="py-32 bg-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black mb-8 tracking-tighter"
          >
            The Machine-Native Rail.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
            {[
              { icon: <Zap className="w-8 h-8" />, label: "Under 1s", sub: "Settlement Speed" },
              { icon: <DollarSign className="w-8 h-8" />, label: "0.0001¢", sub: "Minimum Txn" },
              { icon: <Globe className="w-8 h-8" />, label: "Global", sub: "Permissionless" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-6 backdrop-blur-md">
                  {item.icon}
                </div>
                <div className="text-4xl font-black mb-1">{item.label}</div>
                <div className="text-white/70 font-bold uppercase tracking-widest text-xs">{item.sub}</div>
              </div>
            ))}
          </div>
          <p className="mt-20 text-xl font-medium max-w-2xl mx-auto opacity-90 leading-relaxed italic">
            &quot;The only payment primitive that returns a challenge inside an HTTP 402 response—allowing agents to solve paywalls programmatically in milliseconds.&quot;
            <br />
            <span className="mt-4 block"><SourceBadge href="https://l402.org">L402 Protocol Spec</SourceBadge></span>
          </p>
        </div>
      </section>

      {/* 4. The Ecosystem: THE REVENUE ENGINE (Clean White / Professional) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">The Ecosystem of Profit</h2>
          <p className="text-slate-500 font-medium">Everything you need to run a high-frequency machine economy.</p>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              title: "Marketplace", 
              icon: <Globe className="text-orange-500" />, 
              desc: "A central registry where agents discover and price services in real-time." 
            },
            { 
              title: "Reputation Engine", 
              icon: <UserCheck className="text-orange-500" />, 
              desc: "Trust built from real payment history. Every confirmed sat counts towards your score." 
            },
            { 
              title: "L402 Guard", 
              icon: <Lock className="text-orange-500" />, 
              desc: "Monetize any API route in 10 lines of code. The paywall for the agentic age." 
            }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl hover:border-orange-200 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. The Impact: THE ROI STORY (Soft Slate / Conversational) */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Why Builders Choose AgentPay</h2>
          </div>
          <div className="space-y-16">
            {[
              { 
                q: "What does this enable for my business?", 
                a: "You can sell AI inference for exactly what it costs you. No more $20/month sub plans that lose money on power users. Sell 1 call for 5 sats, sell 1 million calls for 5 million sats. Sustainable unit economics." 
              },
              { 
                q: "How does it scale to millions of calls?", 
                a: "Lightning is built for this. It handles millions of transactions off-chain, settling instantly. Your agents aren't waiting for blockchain confirmations or bank clearance." 
              },
              { 
                q: "Is it really permissionless?", 
                a: "Yes. No KYC, no account approvals, no centralized authority. Any agent can create a wallet and start earning or spending sats in seconds." 
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-orange-500 font-mono font-black text-lg mb-2">0{i+1}</div>
                <h4 className="text-xl font-black text-slate-900 mb-3">{item.q}</h4>
                <p className="text-slate-500 font-medium leading-relaxed pl-6 border-l-2 border-orange-500/20">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-slate-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-black mb-8 tracking-tighter">Ready to Monetize?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/market" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-black transition-all hover:scale-105">
              Enter Marketplace
            </Link>
            <Link href="/register" className="w-full sm:w-auto border border-white/20 hover:bg-white/5 text-white px-10 py-5 rounded-2xl font-black transition-all">
              List Your Service
            </Link>
          </div>
          <div className="mt-24 pt-12 border-t border-white/5 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
            AgentPay · The Infrastructure for Agentic Revenue
          </div>
        </div>
      </footer>
    </div>
  );
}
