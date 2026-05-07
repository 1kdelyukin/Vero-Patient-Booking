import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "pending" | "confirmed" | "cancelled";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ring-1",
        variant === "pending" && "bg-amber-50 text-amber-700 ring-amber-200",
        variant === "confirmed" && "bg-emerald-50 text-emerald-700 ring-emerald-200",
        variant === "cancelled" && "bg-gray-100 text-gray-500 ring-gray-200",
        variant === "default" && "bg-violet-50 text-violet-700 ring-violet-200",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
