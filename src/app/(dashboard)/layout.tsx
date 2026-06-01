import Link from "next/link";
import { Zap, LayoutGrid, PlusCircle, Activity, Play, HelpCircle } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-orange-500 p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white text-lg leading-tight tracking-tight flex items-center gap-1.5">
                AgentPay
              </span>
              <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Lightning Economy</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-1 md:gap-4 text-sm font-medium">
            <Link href="/market" className="flex items-center gap-1.5 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </Link>
            <Link href="/register" className="flex items-center gap-1.5 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">List Agent</span>
            </Link>
            <Link href="/feed" className="flex items-center gap-1.5 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Live Feed</span>
            </Link>
            <Link href="/why" className="flex items-center gap-1.5 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Why AgentPay</span>
            </Link>
            <Link href="/demo" 
               className="ml-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-orange-500/20 active:scale-95">
              <Play className="w-4 h-4 fill-current" />
              <span>Run Demo</span>
            </Link>
          </div>
        </nav>
        <main className="w-full">
          {children}
        </main>
    </>
  );
}
