import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glpi-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-glpi-dark disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-glpi-primary text-zinc-950 shadow-sm hover:bg-glpi-primary-light active:translate-y-px",
        secondary:
          "border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
        ghost:
          "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
        outline:
          "border border-glpi-primary/40 bg-glpi-primary/10 text-glpi-primary hover:bg-glpi-primary/20",
        destructive:
          "border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300",
      },
      size: {
        default: "h-7 px-3 [&_svg]:size-3.5",
        icon: "h-7 w-7 [&_svg]:size-3.5",
        sm: "h-6 px-2 text-[11px] [&_svg]:size-3",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
