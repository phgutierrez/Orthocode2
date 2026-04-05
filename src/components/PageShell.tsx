import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageShellProps {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  containerClassName?: string;
  mainClassName?: string;
}

export function PageShell({
  header,
  children,
  className,
  headerClassName,
  containerClassName,
  mainClassName,
}: PageShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {header && (
        <header
          className={cn(
            "border-b border-border/60 bg-background/96 backdrop-blur supports-[backdrop-filter]:bg-background/90",
            "safe-area-top",
            headerClassName
          )}
        >
          <div className={cn("mx-auto w-full px-4 sm:px-6 py-6", containerClassName)}>
            {header}
          </div>
        </header>
      )}

      <main className={cn("mx-auto w-full px-4 sm:px-6 py-6", containerClassName, mainClassName)}>
        {children}
      </main>
    </div>
  );
}
