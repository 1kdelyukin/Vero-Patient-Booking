import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variant === "default" &&
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200 hover:shadow-violet-300 hover:from-violet-700 hover:to-indigo-700",
        variant === "outline" &&
          "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
        variant === "ghost" && "text-gray-700 hover:bg-gray-100",
        variant === "destructive" &&
          "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        variant === "secondary" &&
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        size === "default" && "h-10 px-4 py-2 text-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "lg" && "h-11 px-6 text-sm",
        size === "icon" && "h-9 w-9",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
