import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
}

export const InputBox = React.forwardRef<HTMLInputElement, InputBoxProps>(
  (
    {
      className,
      type = "text",
      label,
      required,
      error,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("input-group", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className={cn("input-label", labelClassName)}>
            {label}
            {required && <span className="required">*</span>}
          </label>
        )}

        <div
          className={cn(
            "input-icon-wrapper",
            leftIcon && "has-icon-left",
            rightIcon && "has-icon-right"
          )}
        >
          {leftIcon && <span className="input-icon-left">{leftIcon}</span>}

          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "input-box",
              error && "is-invalid",
              className
            )}
            {...props}
          />

          {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
        </div>

        {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);

InputBox.displayName = "InputBox";
