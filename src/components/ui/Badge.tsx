import * as React from "react";

type BadgeVariant =
  | "verde"
  | "rosso"
  | "grigio"
  | "elettrico"
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success";

type BadgeSize = "xs" | "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  verde: "bg-greenPrimary/15 text-greenPrimary border border-greenPrimary/30",
  rosso: "bg-danger/15 text-danger border border-danger/30",
  grigio: "bg-white/5 text-textMuted border border-white/10",
  elettrico:
    "bg-greenElectric/20 text-greenElectric border border-greenElectric/40 shadow-lg shadow-greenElectric/10",
  primary:
    "bg-greenPrimary/15 text-greenPrimary border border-greenPrimary/30",
  secondary: "bg-white/5 text-textMuted border border-white/10",
  outline: "bg-transparent text-textPrimary border border-white/15",
  danger: "bg-danger/15 text-danger border border-danger/30",
  success:
    "bg-greenElectric/20 text-greenElectric border border-greenElectric/40 shadow-lg shadow-greenElectric/10",
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: "px-2 py-0.5 text-[10px]",
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3 py-1 text-xs",
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "verde", size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full font-semibold transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ""}`}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export default Badge;
