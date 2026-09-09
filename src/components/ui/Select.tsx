import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`flex h-11 w-full appearance-none rounded-lg border border-white/10 bg-bgSecondary px-4 py-2 pr-10 text-base text-textPrimary placeholder:text-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className ?? ""}`}
          {...props}
        >
          {children}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  }
);
Select.displayName = "Select";

export default Select;
