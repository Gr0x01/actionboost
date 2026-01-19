import { forwardRef } from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      showCount = false,
      maxLength,
      className = "",
      id,
      required,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-1">
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-cta ml-1">*</span>}
        </label>

        {hint && <p className="text-sm text-muted">{hint}</p>}

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          value={value}
          maxLength={maxLength}
          className={`
            w-full rounded-lg border bg-background px-4 py-3 text-foreground
            placeholder:text-muted/60
            border-border
            focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light
            disabled:cursor-not-allowed disabled:opacity-50
            resize-y min-h-[120px]
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}
            ${className}
          `}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />

        <div className="flex justify-between items-center">
          {error ? (
            <p id={`${textareaId}-error`} className="text-sm text-red-500">
              {error}
            </p>
          ) : (
            <span />
          )}

          {showCount && maxLength && (
            <span
              className={`text-sm ${
                charCount > maxLength * 0.9 ? "text-cta" : "text-muted"
              }`}
            >
              {charCount.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
