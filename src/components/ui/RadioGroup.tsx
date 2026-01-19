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
    <fieldset className="space-y-3">
      <legend className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-cta ml-1">*</span>}
      </legend>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 p-4 rounded-lg border cursor-pointer
              transition-colors duration-150
              ${
                value === option.value
                  ? "border-primary bg-primary-light/30"
                  : "border-border hover:border-muted"
              }
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 h-4 w-4 text-primary border-border focus:ring-primary"
            />
            <div className="flex-1">
              <span className="block font-medium text-foreground">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-muted mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
