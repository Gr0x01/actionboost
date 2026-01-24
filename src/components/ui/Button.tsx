import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "rounded-md bg-cta text-white border-b-[3px] border-b-[#B85D10] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:border-b-0",
  secondary:
    "rounded-md bg-surface text-foreground border-2 border-foreground/20 shadow-[4px_4px_0_rgba(44,62,80,0.1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(44,62,80,0.15)] active:translate-y-0.5 active:shadow-none",
  outline:
    "rounded-md bg-transparent text-foreground border-2 border-foreground/30 hover:bg-foreground/5 hover:border-foreground/50",
  ghost:
    "rounded-md text-muted hover:text-foreground hover:bg-surface/50 active:bg-surface",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-10 py-4 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
