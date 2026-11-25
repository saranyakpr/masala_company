import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, required, children }: FieldShellProps) {
  return (
    <div className="group/field flex flex-col gap-2">
      <label htmlFor={id} className="eyebrow flex items-center gap-1 text-ink-soft/80">
        {label}
        {required ? (
          <span className="text-spice" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="font-medium normal-case tracking-normal text-ink-soft/50">(optional)</span>
        )}
      </label>
      {children}
      <div className="min-h-5 text-sm">
        {/* Errors mount immediately (no waiting on a hint's exit) so they're announced at once. */}
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-spice"
          >
            <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-ink-soft/55">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const controlClass = (error?: string) =>
  cn(
    'w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-base text-ink placeholder:text-ink-soft/35 transition-colors duration-300 focus:outline-none focus-visible:outline-none',
    error ? 'border-spice focus:border-spice' : 'border-ink/20 hover:border-ink/40 focus:border-gold',
  );

interface CommonProps {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, CommonProps & InputHTMLAttributes<HTMLInputElement>>(
  function InputField({ label, error, hint, required, id: idProp, className, ...rest }, ref) {
    const autoId = useId();
    const id = idProp ?? autoId;
    return (
      <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(controlClass(error), className)}
          {...rest}
        />
      </FieldShell>
    );
  },
);

export const TextAreaField = forwardRef<HTMLTextAreaElement, CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextAreaField({ label, error, hint, required, id: idProp, className, ...rest }, ref) {
    const autoId = useId();
    const id = idProp ?? autoId;
    return (
      <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
        <textarea
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(controlClass(error), 'min-h-36 resize-y', className)}
          {...rest}
        />
      </FieldShell>
    );
  },
);

export const SelectField = forwardRef<
  HTMLSelectElement,
  CommonProps & SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; placeholder?: string }
>(function SelectField({ label, error, hint, required, id: idProp, className, options, placeholder, ...rest }, ref) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlClass(error), 'cursor-pointer appearance-none bg-[length:12px] bg-[right_4px_center] bg-no-repeat', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' fill='none' stroke='%233a2a21' stroke-width='1.5'/></svg>\")",
        }}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});
