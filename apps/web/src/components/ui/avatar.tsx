import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
}

export function Avatar({ className, fallback, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200 items-center justify-center text-xs font-semibold text-slate-700 uppercase",
        className
      )}
      {...props}
    >
      <span>{fallback}</span>
    </div>
  );
}
