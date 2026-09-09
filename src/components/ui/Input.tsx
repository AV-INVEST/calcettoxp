import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={`flex h-11 w-full rounded-lg border border-white/10 bg-bgSecondary px-4 py-2 text-base text-textPrimary placeholder:text-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className ?? ""}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export default Input;
