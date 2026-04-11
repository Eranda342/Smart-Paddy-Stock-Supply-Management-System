import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// AgroBridge Global Button Component
// Variants:  primary | secondary | danger | ghost | outline | link
//            (+ legacy shadcn aliases: default, destructive)
// Sizes:     sm | md | lg | icon
// ─────────────────────────────────────────────────────────────────────────────
const buttonVariants = cva(
  // ── Base ────────────────────────────────────────────────────────────────────
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-sm font-semibold",
    "transition-all duration-200 ease-out",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-[#22C55E]/60",
    "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Project-specific ────────────────────────────────────────────────
        /** Primary action — Create, Save, Submit, Approve */
        primary:
          "bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-[#0F1115] font-semibold " +
          "hover:from-[#4ADE80] hover:to-[#22C55E] hover:shadow-[0_4px_18px_rgba(34,197,94,0.35)] " +
          "shadow-[0_2px_8px_rgba(34,197,94,0.2)]",

        /** Secondary / neutral — Cancel, Refresh, Back */
        secondary:
          "bg-muted text-foreground border border-border " +
          "hover:bg-muted/70 hover:border-border/80",

        /** Danger — Delete, Reject, Logout confirm */
        danger:
          "bg-red-500 text-white " +
          "hover:bg-red-600 hover:shadow-[0_4px_14px_rgba(239,68,68,0.35)] " +
          "focus-visible:ring-red-500/50",

        /** Ghost — icon-only buttons, sidebar logout, minimal actions */
        ghost:
          "bg-transparent text-foreground " +
          "hover:bg-muted/60",

        // ── Logout-ghost — ghost but with red hover ──────────────────────
        "ghost-danger":
          "bg-transparent text-sidebar-foreground border border-transparent " +
          "hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 " +
          "focus-visible:ring-red-500/50",

        // ── Legacy shadcn aliases (keep for backward compat) ─────────────
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 " +
          "focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground " +
          "dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        link: "text-primary underline-offset-4 hover:underline !shadow-none !active:scale-100",
      },

      size: {
        sm:   "h-8 px-3 py-1.5 text-xs gap-1.5",
        md:   "h-9 px-4 py-2 text-sm",
        lg:   "h-11 px-6 py-2.5 text-sm",
        icon: "size-9 rounded-lg p-0",
        // Legacy shadcn size aliases
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

