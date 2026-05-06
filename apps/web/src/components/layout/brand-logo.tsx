import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <Link href="/dashboard" className={cn("flex items-center gap-3", className)}>
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
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
      {!compact ? (
        <span className="leading-none">
          <span className="block text-2xl font-extrabold tracking-normal text-foreground">
            ScholarFlow AI
          </span>
          <span className="mt-1 block text-sm font-medium text-muted-foreground">
            Academic Workspace
          </span>
        </span>
      ) : null}
    </Link>
  );
}
