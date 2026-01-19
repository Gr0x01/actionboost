import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, required, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    const hasLabel = label.length > 0;

    return (
      <div className="space-y-2">
        {hasLabel && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="text-cta ml-0.5">*</span>}
          </label>
        )}

        {hint && <p className="text-sm text-muted -mt-0.5">{hint}</p>}

        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`
            w-full rounded-lg bg-surface/50 px-4 py-3 text-base text-foreground
            placeholder:text-muted/50
            border border-border/60
            transition-all duration-200
            hover:border-border
            focus:bg-background focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}
            ${className}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500 mt-1.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
