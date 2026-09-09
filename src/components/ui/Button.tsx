import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimary disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-greenPrimary text-bgPrimary hover:bg-greenPrimary/90 shadow-lg shadow-greenPrimary/25",
  secondary:
    "bg-bgCard border border-white/10 text-textPrimary hover:bg-bgCard/80 hover:border-white/20",
  ghost:
    "bg-transparent text-textPrimary hover:bg-white/5",
  danger:
    "bg-danger text-white hover:bg-danger/90 shadow-lg shadow-danger/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 rounded-lg text-sm",
  md: "h-11 px-5 rounded-xl text-base",
  lg: "h-14 px-7 rounded-2xl text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ""}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
