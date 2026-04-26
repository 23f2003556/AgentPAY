import { motion } from "framer-motion";

export function BlueprintBackground({ type = "grid" }: { type?: "grid" | "monitor" | "schematic" | "brain" }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-grid-blueprint opacity-[0.1]" />
      
      {type === "monitor" && (
        <>
          <div className="scanline absolute top-0 left-0 opacity-[0.1]" />
          <svg className="absolute bottom-0 left-0 w-full h-32 opacity-[0.03] text-orange-500" preserveAspectRatio="none" viewBox="0 0 1000 100">
            <path d="M0,50 L100,50 L120,20 L140,80 L160,50 L1000,50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
          </svg>
        </>
      )}

      {type === "schematic" && (
        <>
          <div className="absolute top-10 left-10 w-20 h-20 border-l-2 border-t-2 border-slate-200 dark:border-slate-800 opacity-30" />
          <div className="absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 border-slate-200 dark:border-slate-800 opacity-30" />
          <div className="absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 border-slate-200 dark:border-slate-800 opacity-30" />
          <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-slate-200 dark:border-slate-800 opacity-30" />
        </>
      )}

      {type === "brain" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full" />
      )}
    </div>
  );
}
