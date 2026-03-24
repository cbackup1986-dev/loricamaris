export const dynamic = 'force-dynamic';

import { GameCard } from "@/components/home/GameCard";
import { AdSlot } from "@/components/common/AdSlot";
import { 
  Type, 
  Grid3X3, 
  Shapes, 
  Hash, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Gamepad2, 
  Package, 
  BrainCircuit,
  Users,
  FileText,
  Layout,
  BarChart,
  Activity
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GameHeroGrid } from "@/components/home/GameHeroGrid";
import prisma from "@/lib/prisma";

const FEATURED_WORKS = [
  {
    title: "Nodes",
    description: "Connect related topics in this word association challenge.",
    icon: <Shapes className="w-6 h-6" />,
    href: "/works/connections",
    color: "bg-yellow-500",
    difficulty: "Medium" as const,
    isDaily: true,
    type: "APP" as const
  },
  {
    title: "Wordle",
    description: "Guess the hidden word in 6 tries with dynamic hints.",
    icon: <Layout className="w-6 h-6" />,
    href: "/works/wordle",
    color: "bg-indigo-500",
    difficulty: "Medium" as const,
    isDaily: true,
    type: "APP" as const
  },
  {
    title: "Seqnc",
    description: "Find the hidden continuous path through all numbers.",
    icon: <Hash className="w-6 h-6" />,
    href: "/works/numbrix",
    color: "bg-blue-500",
    difficulty: "Medium" as const,
    isDaily: false,
    type: "APP" as const
  },
  {
    title: "Sudoku",
    description: "Classic logic-based number placement puzzle.",
    icon: <BrainCircuit className="w-6 h-6" />,
    href: "/works/sudoku",
    color: "bg-purple-500",
    difficulty: "Hard" as const,
    isDaily: true,
    type: "APP" as const
  }
];

// Helper to map icon names to Lucide icons
const getIcon = (iconName: string | null) => {
  const map: Record<string, any> = {
    Zap: <Zap className="w-6 h-6" />,
    Sparkles: <Sparkles className="w-6 h-6" />,
    Gamepad2: <Gamepad2 className="w-6 h-6" />,
    BrainCircuit: <BrainCircuit className="w-6 h-6" />,
    Shapes: <Shapes className="w-6 h-6" />,
    Package: <Package className="w-6 h-6" />,
    Hash: <Hash className="w-6 h-6" />,
    FileText: <FileText className="w-6 h-6" />,
    BarChart: <BarChart className="w-6 h-6" />,
    Layout: <Layout className="w-6 h-6" />,
  };
  return map[iconName || 'Gamepad2'] || <Layout className="w-6 h-6" />;
};

export default async function Home() {
  // Fetch latest 6 published community works
  // @ts-ignore
  const communityWorks = await prisma.userWork.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { user: { select: { id: true, username: true } } }
  });

  return (
    <div className="flex flex-col gap-12 md:gap-24 pb-12 md:pb-24">
      {/* Play-First Hero Section */}
      <section className="relative w-full h-[420px] md:h-[550px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/premium_hero.png"
            alt="Hero Background"
            fill
            className="object-cover brightness-[0.2] dark:brightness-[0.15] transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/60" />
        </div>
        
        <div className="relative z-10 px-4 md:px-6 container max-w-7xl mx-auto flex flex-col items-center text-center space-y-8 md:space-y-12">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] uppercase">
              Deploy Your Daily <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Intelligence</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-100 max-w-2xl font-bold leading-relaxed opacity-100 mx-auto drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)]">
              Sophisticated logic modules. Clean design, deep strategy, zero distractions.
            </p>
          </div>
          
          {/* Direct Access Game Grid */}
          <GameHeroGrid />

          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/archive" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 transition-all hover:bg-white/20 active:scale-95 text-sm flex items-center justify-center gap-2">
              <Zap size={16} /> Explore All Works
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Sections wrapped in Container */}
      <div className="container max-w-7xl mx-auto px-4 md:px-6 space-y-16 md:space-y-32">
        
        {/* Top Ad Slot inside container */}
        <AdSlot position="top" />

        {/* Featured Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.3em] text-[10px]">
                <TrendingUp size={16} /> Trending Global
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Prime Operations</h2>
            </div>
            <p className="text-muted-foreground text-base font-medium max-w-sm md:text-right leading-relaxed">
              Curated daily logic refreshed every 24 hours at midnight UTC.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {FEATURED_WORKS.filter(g => g.isDaily).map((game) => (
              <GameCard key={game.title} {...game} />
            ))}
          </div>
        </section>

        {/* Community Section - NEW */}
        {communityWorks.length > 0 && (
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                  <Users size={16} /> Autonomous Network
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">Recent Deployments</h2>
              </div>
              <p className="text-muted-foreground text-base font-medium max-w-sm md:text-right leading-relaxed">
                Dynamic modules deployed by our global operative network.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {communityWorks.map((work: any) => (
                <GameCard 
                  key={work.id}
                  title={work.title}
                  description={work.description || ""}
                  href={`/user-works/${work.userId}/${work.slug}`}
                  icon={getIcon(work.icon)}
                  color={work.color || "bg-indigo-500"}
                  difficulty={work.difficulty as any}
                  type={work.type as any}
                />
              ))}
            </div>
          </section>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 py-10 md:py-16 px-4 md:px-8 rounded-2xl md:rounded-[3rem] bg-slate-50 dark:bg-slate-900 shadow-inner border border-slate-200/50 dark:border-slate-800/50">
          {[
            { label: "Active Nodes", value: "2.4M+", icon: <Zap /> },
            { label: "Tasks Executed", value: "850M+", icon: <Zap /> },
            { label: "Logic Score", value: "TOP 1%", icon: <Zap /> },
            { label: "Uptime", value: "99.9%", icon: <Zap /> },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center justify-center gap-2 group">
              <span className="text-2xl md:text-4xl font-black tracking-tighter group-hover:scale-110 transition-transform">{stat.value}</span>
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
          ))}
        </div>

        <AdSlot position="content" />

        {/* Infinite Library Section */}
        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">The Library</h2>
            <Link href="/archive" className="text-sm font-black text-primary hover:text-indigo-600 transition-colors flex items-center gap-2">
              Browse Everything <TrendingUp size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURED_WORKS.map((game) => (
              <GameCard key={game.title} {...game} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

