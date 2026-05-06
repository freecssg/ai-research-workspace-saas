import {
  ArrowRight,
  BrainCircuit,
  FileText,
  Lightbulb,
  LockKeyhole,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { BrandLogo } from "@/components/layout/brand-logo";

const knowledgeNodes = [
  { angle: -128, icon: FileText },
  { angle: -92, icon: FileText },
  { angle: -52, icon: MessageSquare },
  { angle: -10, icon: FileText },
  { angle: 36, icon: FileText },
  { angle: 78, icon: FileText },
  { angle: 122, icon: Sparkles },
  { angle: 174, icon: FileText },
];

const valueTiles = [
  {
    title: "Organize",
    description: "Centralize knowledge across sources",
    icon: FileText,
  },
  {
    title: "Analyze",
    description: "Discover connections and patterns",
    icon: BrainCircuit,
  },
  {
    title: "Generate",
    description: "Create insights with confidence",
    icon: Lightbulb,
  },
];

function KnowledgeInsightDiagram() {
  return (
    <div className="mt-7 rounded-lg border border-border/90 bg-white/[0.46] p-5 shadow-soft backdrop-blur-sm">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-7">
        <div className="text-center">
          <span className="rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase text-primary">
            Stage 1
          </span>
          <p className="mt-3 text-base font-semibold">Knowledge Base</p>
          <div className="relative mx-auto mt-5 h-48 w-48">
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_12px_34px_rgba(0,95,214,0.18)] ring-[14px] ring-blue-100/70">
              <div className="flex h-full items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-white text-primary">
                <FileText className="h-8 w-8" />
              </div>
            </div>
            {knowledgeNodes.map((node) => {
              const Icon = node.icon;
              return (
                <div
                  key={node.angle}
                  className="absolute left-1/2 top-1/2 h-px w-[74px] origin-left bg-gradient-to-r from-primary/55 to-primary/5"
                  style={{ transform: `rotate(${node.angle}deg)` }}
                >
                  <span className="absolute right-[-18px] top-[-18px] flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-primary shadow-soft">
                    <Icon
                      className="h-4 w-4"
                      style={{ transform: `rotate(${-node.angle}deg)` }}
                    />
                  </span>
                </div>
              );
            })}
            <span className="absolute left-6 top-8 h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="absolute bottom-7 right-9 h-1.5 w-1.5 rounded-full bg-sky-500" />
          </div>
        </div>

        <div className="flex min-w-32 items-center gap-3 text-primary">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-foreground shadow-soft">
            <ArrowRight className="h-7 w-7" />
          </span>
          <span className="h-px w-16 bg-gradient-to-r from-primary/50 to-transparent" />
        </div>

        <div className="text-center">
          <span className="rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase text-primary">
            Stage 2
          </span>
          <p className="mt-3 text-base font-semibold">Research Insight</p>
          <div className="relative mx-auto mt-8 flex h-40 w-40 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-primary/25" />
            <span className="absolute inset-4 rounded-full border border-dashed border-primary/25" />
            <span className="absolute left-3 top-6 h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="absolute bottom-8 right-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
            <div className="h-24 w-24 rotate-45 bg-gradient-to-br from-primary via-sky-400 to-teal-300 shadow-[0_16px_34px_rgba(0,95,214,0.2)] [clip-path:polygon(50%_0,100%_28%,86%_100%,13%_100%,0_28%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniLogoMark() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-gradient-to-b from-white to-accent shadow-soft">
      <span aria-hidden="true" className="relative flex h-12 w-12 scale-90">
        <span className="absolute left-1.5 top-1.5 h-9 w-5 rounded-[4px] bg-gradient-to-br from-sky-500 to-primary-dark [clip-path:polygon(0_0,100%_18%,100%_100%,0_78%)]" />
        <span className="absolute right-1.5 top-1.5 h-9 w-5 rounded-[4px] bg-gradient-to-br from-primary-dark to-primary [clip-path:polygon(0_18%,100%_0,100%_78%,0_100%)]" />
        <span className="absolute left-5 top-5 h-3 w-3 rounded-full bg-white" />
        <span className="absolute left-7 top-4 h-0.5 w-4 rotate-[-22deg] rounded bg-sky-500" />
        <span className="absolute left-7 top-6 h-0.5 w-4 rounded bg-primary" />
        <span className="absolute left-7 top-8 h-0.5 w-4 rotate-[22deg] rounded bg-blue-500" />
        <span className="absolute right-0 top-2.5 h-2.5 w-2.5 rounded-full bg-cyan-500" />
        <span className="absolute right-0 top-5 h-2.5 w-2.5 rounded-full bg-primary" />
        <span className="absolute right-0 top-[30px] h-2.5 w-2.5 rounded-full bg-blue-500" />
      </span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbff] text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(0,95,214,0.08),transparent_26rem),linear-gradient(90deg,#f4f9ff_0%,#f8fbff_54%,#ffffff_54%,#f7faff_100%)]" />
      <div className="absolute left-[35%] top-0 h-[520px] w-[620px] rounded-full border border-primary/5 opacity-70 [background:repeating-radial-gradient(ellipse_at_center,rgba(0,95,214,0.06)_0_1px,transparent_1px_19px)]" />
      <div className="absolute bottom-[-120px] left-20 h-[360px] w-[640px] rounded-full border border-primary/5 opacity-45 [background:repeating-radial-gradient(ellipse_at_center,rgba(0,95,214,0.06)_0_1px,transparent_1px_18px)]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[56%_44%]">
        <section className="hidden min-h-screen flex-col px-20 py-16 lg:flex xl:px-24">
          <BrandLogo className="[&>span:first-child]:h-20 [&>span:first-child]:w-20 [&_span.block:first-child]:text-4xl [&_span.block:last-child]:text-xl" />

          <div className="mt-24 max-w-[690px]">
            <h1 className="max-w-[520px] text-5xl font-extrabold leading-tight tracking-normal text-foreground">
              From knowledge to research insight
            </h1>
            <p className="mt-5 max-w-[520px] text-xl leading-8 text-muted-foreground">
              ScholarFlow AI helps you organize knowledge, connect ideas, and
              generate research insights with the power of AI.
            </p>

            <KnowledgeInsightDiagram />

            <div className="mt-9 grid grid-cols-3 gap-6">
              {valueTiles.map((tile, index) => {
                const Icon = tile.icon;
                return (
                  <div
                    key={tile.title}
                    className="flex items-start gap-4 border-r border-border pr-5 last:border-r-0"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block text-base font-bold text-foreground">
                        {tile.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                        {tile.description}
                      </span>
                    </span>
                    <span className="sr-only">Step {index + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-auto text-sm text-muted-foreground">
            &copy; 2026 University of Guelph. All rights reserved.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[535px]">
            <div className="rounded-[1.35rem] border border-white/90 bg-white/[0.88] px-12 py-14 shadow-[0_24px_70px_rgba(12,38,80,0.14)] backdrop-blur-md sm:px-14 sm:py-16">
              <div className="flex flex-col items-center text-center">
                <MiniLogoMark />
                <h2 className="mt-7 text-4xl font-extrabold tracking-normal text-foreground">
                  Welcome
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Sign in to your academic workspace
                </p>
              </div>
              <LoginForm />
            </div>

            <div className="mt-12 flex items-center justify-center gap-3 text-base font-medium text-muted-foreground">
              <LockKeyhole className="h-5 w-5" />
              <span>Secure and private. Your data is protected.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
