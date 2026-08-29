import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] active:scale-[0.97]",
  {
    variants: {
      variant: {
        /* U.Psy Liquid-Glass Variants */
        primary: "text-[16px] font-medium px-[22px] py-[14px] min-h-[48px] text-[#1A1A1A] hover:opacity-90 hover:shadow-gold hover:brightness-110",
        secondary: "text-[16px] font-medium px-[22px] py-[14px] min-h-[48px] bg-transparent text-u-gold border border-u-gold hover:bg-u-gold/10 hover:shadow-[0_0_20px_rgba(255,179,0,0.15)]",
        tertiary: "text-u-white hover:text-u-gold bg-transparent border-none p-0 h-auto font-medium transition-colors duration-200",

        /* Standard variants */
        default: "bg-primary text-primary-foreground hover:bg-primary/90 text-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground text-sm",
        link: "text-primary underline-offset-4 hover:underline text-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        hero: "h-14 px-8 text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
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
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const computedStyle: React.CSSProperties = {
      borderRadius: '14px',
      ...(variant === "primary" ? { background: 'var(--gradient-gold)' } : {}),
      ...style,
    };
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} style={computedStyle} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
