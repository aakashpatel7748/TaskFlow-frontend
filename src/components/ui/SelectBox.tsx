import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectBoxProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  options?: SelectOption[];
  containerClassName?: string;
  labelClassName?: string;
}

export const SelectBox = React.forwardRef<HTMLSelectElement, SelectBoxProps>(
  (
    {
      className,
      label,
      required,
      error,
      options,
      children,
      containerClassName,
      labelClassName,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("input-group", containerClassName)}>
        {label && (
          <label htmlFor={selectId} className={cn("input-label", labelClassName)}>
            {label}
            {required && <span className="required">*</span>}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={cn(
            "select",
            error && "is-invalid",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);

SelectBox.displayName = "SelectBox";
