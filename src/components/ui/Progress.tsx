import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  variant?: "verde" | "muta";
}

const barStyles = {
  verde: "bg-gradient-to-r from-greenPrimary to-greenElectric",
  muta: "bg-gradient-to-r from-textMuted to-white/40",
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, variant = "verde", ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        className={`relative h-2.5 w-full overflow-hidden rounded-full bg-white/5 ${className ?? ""}`}
        {...props}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barStyles[variant]}`}
          style={{ width: `${clampedValue}%` }}
        />
        <div
          className="absolute top-0 h-full opacity-30 animate-pulse rounded-full"
          style={{
            width: `${clampedValue}%`,
            background:
              variant === "verde"
                ? "linear-gradient(to right, #7CFF6B, transparent)"
                : "linear-gradient(to right, rgba(255,255,255,0.3), transparent)",
          }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export default Progress;
