import * as React from "react";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10 ${className ?? ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContainer.displayName = "PageContainer";

export default PageContainer;
