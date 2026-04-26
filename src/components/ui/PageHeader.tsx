interface PageHeaderProps {
  tag: string;
  title: string;
  highlight: string;
  description: string;
}

export function PageHeader({ tag, title, highlight, description }: PageHeaderProps) {
  return (
    <div className="mb-10">
      <div className="flex flex-col gap-1 mb-2">
        <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-slate-400 uppercase">
          {tag}
        </span>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          {title} <span className="text-orange-500">{highlight}</span>
        </h1>
      </div>
      <p className="text-lg text-slate-500 dark:text-slate-400 font-medium border-l-2 border-orange-500/20 pl-4 mt-4">
        {description}
      </p>
    </div>
  );
}
