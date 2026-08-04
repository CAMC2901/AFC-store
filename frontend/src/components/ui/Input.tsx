import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('input', error && 'border-red-400 focus:border-red-400 focus:ring-red-200', className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-charcoal/60">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn('input appearance-none cursor-pointer', error && 'border-red-400', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
