"use client";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  required,
}: RadioGroupProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-cta ml-0.5">*</span>}
      </legend>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={`
                flex items-start gap-3 p-4 rounded-lg cursor-pointer
                transition-all duration-200
                ${isSelected
                  ? "bg-primary/5 border-2 border-primary shadow-sm"
                  : "bg-surface/50 border border-border/60 hover:border-border hover:bg-surface"
                }
              `}
            >
              <div className="pt-0.5">
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200
                    ${isSelected
                      ? "border-primary bg-primary"
                      : "border-border/80"
                    }
                  `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  className="sr-only"
                />
              </div>
              <div className="flex-1">
                <span className={`block text-sm font-medium ${isSelected ? "text-foreground" : "text-foreground/90"}`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="block text-sm text-muted mt-1">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
