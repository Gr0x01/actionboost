import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, required, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-cta ml-1">*</span>}
        </label>

        {hint && <p className="text-sm text-muted">{hint}</p>}

        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`
            w-full rounded-lg border bg-background px-4 py-3 text-foreground
            placeholder:text-muted/60
            border-border
            focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}
            ${className}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
