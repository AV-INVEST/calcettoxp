import * as React from "react";

type BadgeVariant = "verde" | "rosso" | "grigio" | "elettrico";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  verde: "bg-greenPrimary/15 text-greenPrimary border border-greenPrimary/30",
  rosso: "bg-danger/15 text-danger border border-danger/30",
  grigio: "bg-white/5 text-textMuted border border-white/10",
  elettrico:
    "bg-greenElectric/20 text-greenElectric border border-greenElectric/40 shadow-lg shadow-greenElectric/10",
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "verde", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${variantStyles[variant]} ${className ?? ""}`}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export default Badge;
