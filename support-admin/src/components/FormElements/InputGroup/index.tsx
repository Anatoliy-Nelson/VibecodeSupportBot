"use client";

import { cn } from "@/lib/utils";
import { type HTMLInputTypeAttribute, useId } from "react";

type InputGroupProps = {
  className?: string;
  label: string;
  placeholder: string;
  type: HTMLInputTypeAttribute;
  required?: boolean;
  disabled?: boolean;
  active?: boolean;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  name?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  height?: "sm" | "default";
  defaultValue?: string;
};

const InputGroup: React.FC<InputGroupProps> = ({
  className,
  label,
  type,
  placeholder,
  required,
  disabled,
  active,
  handleChange,
  icon,
  iconPosition = "left",
  height,
  name,
  value,
  defaultValue,
}) => {
  const id = useId();
  const isRight = iconPosition === "right";

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-body-sm font-medium text-gray-7 dark:text-white"
      >
        {label}
        {required && <span className="ml-1 select-none text-red">*</span>}
      </label>

      <div className="relative mt-3">
        {isRight && icon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}

        <input
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            "w-full rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 data-[active=true]:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:disabled:bg-dark dark:data-[active=true]:border-primary",
            type === "file"
              ? ""
              : "px-4 py-3 text-gray-7 placeholder:text-gray-5 dark:text-white dark:placeholder:text-gray-5",
            !isRight && icon ? "pl-10" : "",
            isRight && icon ? "pr-10" : "",
            height === "sm" && "py-2.5",
          )}
          required={required}
          disabled={disabled}
          data-active={active}
        />

        {!isRight && icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputGroup;
