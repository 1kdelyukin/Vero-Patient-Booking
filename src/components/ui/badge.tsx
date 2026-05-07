import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "pending" | "confirmed" | "cancelled";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "pending" && "bg-amber-100 text-amber-800",
        variant === "confirmed" && "bg-green-100 text-green-800",
        variant === "cancelled" && "bg-gray-100 text-gray-600",
        variant === "default" && "bg-blue-100 text-blue-800",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
