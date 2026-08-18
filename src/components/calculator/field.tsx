'use client';

/**
 * Field primitives for the calculator wizard (Section 3 + Section 22).
 *
 * Conventions enforced here:
 *  - Every numeric input is right-aligned mono tabular-nums (currency, percent, pp, count).
 *  - No native number spinners (hidden globally in globals.css).
 *  - Every field has a <Label htmlFor> + helper text + error text wired through
 *    `aria-describedby`; the error is announced via `aria-live="polite"`.
 *  - Inputs use `rounded-sm`; cards use `rounded-lg` (handled by callers).
 *  - The wrapper handles focus/error ring; the underlying shadcn <Input> is borderless.
 *
 * Form integration: register() returns are spread onto the underlying <Input>.
 * Values stay strings — the resolver in wizard-resolver.ts coerces + transforms
 * percent/pp values to ratios before they hit calculatorInputsSchema.
 */
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FieldShellProps {
  id: string;
  label: string;
  /** Required marker + helper text shown beneath the input. */
  helper?: string;
  /** Inline italic note shown beneath the helper (e.g. margin warning). */
  note?: string;
  /** When set, the field is marked required and error text replaces the helper. */
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  /** Optional className on the outer wrapper. */
  className?: string;
}

/**
 * Wraps a labelled field: <Label>, input, helper text, optional note, error text.
 * Provides aria wiring via context so input components can read describedBy/invalid.
 */
const FieldAriaContext = React.createContext<{
  describedBy?: string;
  invalid: boolean;
}>({ invalid: false });

export function FieldShell({
  id,
  label,
  helper,
  note,
  error,
  required,
  children,
  className,
}: FieldShellProps) {
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy =
    [helper ? helperId : null, error ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <FieldAriaContext.Provider value={{ describedBy, invalid: Boolean(error) }}>
      <div className={cn('space-y-1.5', className)}>
        <Label htmlFor={id} className="text-ink">
          <span>{label}</span>
          {required && (
            <span aria-hidden="true" className="text-dont-build ml-0.5">
              *
            </span>
          )}
        </Label>
        {children}
        {helper && !error && (
          <p
            id={helperId}
            className="text-xs leading-snug text-ink-muted"
          >
            {helper}
          </p>
        )}
        {note && !error && (
          <p className="text-xs leading-snug italic text-ink-faint">{note}</p>
        )}
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs leading-snug text-dont-build"
          >
            {error}
          </p>
        )}
      </div>
    </FieldAriaContext.Provider>
  );
}

/** Hook used by the input components to read describedBy / invalid from FieldShell. */
function useFieldAria() {
  return React.useContext(FieldAriaContext);
}

/** Shared outer wrapper for any input that has a leading prefix / trailing suffix addon. */
function InputGroup({
  prefix,
  suffix,
  invalid,
  className,
  children,
}: {
  prefix?: string;
  suffix?: string;
  invalid?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-invalid={invalid ? '' : undefined}
      className={cn(
        'flex items-stretch h-10 rounded-sm border bg-surface-raised transition-[border-color,box-shadow] duration-panel ease-decelerate',
        invalid
          ? 'border-dont-build ring-1 ring-dont-build/20'
          : 'border-border-strong focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30',
        className,
      )}
    >
      {prefix && (
        <span
          aria-hidden="true"
          className="flex items-center pl-3 text-sm font-mono tnum text-ink-muted select-none"
        >
          {prefix}
        </span>
      )}
      {children}
      {suffix && (
        <span
          aria-hidden="true"
          className="flex items-center pr-3 text-sm font-mono tnum text-ink-muted select-none"
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

/** The bare input element styled to sit inside an InputGroup (borderless, right-aligned). */
function InnerInput({
  id,
  registration,
  placeholder,
  inputMode,
  type,
  describedBy,
  invalid,
  autoComplete,
}: {
  id: string;
  registration: Record<string, unknown>;
  placeholder?: string;
  inputMode?: 'decimal' | 'numeric';
  type?: string;
  describedBy?: string;
  invalid?: boolean;
  autoComplete?: string;
}) {
  return (
    <Input
      id={id}
      type={type ?? 'text'}
      inputMode={inputMode}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className="h-full flex-1 min-w-0 border-0 bg-transparent px-3 py-1 text-right font-mono tnum text-ink shadow-none rounded-none focus-visible:ring-0 focus-visible:border-0"
      {...(registration as Record<string, unknown>)}
    />
  );
}

/** Plain text input (e.g. client name). Left-aligned sans. */
export function TextInput({
  id,
  registration,
  placeholder,
  autoComplete,
}: {
  id: string;
  registration: Record<string, unknown>;
  placeholder?: string;
  autoComplete?: string;
}) {
  const { describedBy, invalid } = useFieldAria();
  return (
    <InputGroup invalid={invalid}>
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className="h-full flex-1 border-0 bg-transparent px-3 py-1 text-left text-ink shadow-none rounded-none focus-visible:ring-0 focus-visible:border-0"
        {...(registration as Record<string, unknown>)}
      />
    </InputGroup>
  );
}

/** Currency input — leading `$`, right-aligned mono. Optional `/mo` suffix etc. */
export function MoneyInput({
  id,
  registration,
  placeholder = '0',
  suffix,
}: {
  id: string;
  registration: Record<string, unknown>;
  placeholder?: string;
  suffix?: string;
}) {
  const { describedBy, invalid } = useFieldAria();
  return (
    <InputGroup prefix="$" suffix={suffix} invalid={invalid}>
      <InnerInput
        id={id}
        registration={registration}
        placeholder={placeholder}
        inputMode="decimal"
        describedBy={describedBy}
        invalid={invalid}
      />
    </InputGroup>
  );
}

/** Integer input — no prefix/suffix, right-aligned mono. */
export function IntegerInput({
  id,
  registration,
  placeholder = '0',
}: {
  id: string;
  registration: Record<string, unknown>;
  placeholder?: string;
}) {
  const { describedBy, invalid } = useFieldAria();
  return (
    <InputGroup invalid={invalid}>
      <InnerInput
        id={id}
        registration={registration}
        placeholder={placeholder}
        inputMode="numeric"
        describedBy={describedBy}
        invalid={invalid}
      />
    </InputGroup>
  );
}

/** Decimal input (e.g. hours/week) — no prefix/suffix, right-aligned mono. */
export function DecimalInput({
  id,
  registration,
  placeholder = '0',
}: {
  id: string;
  registration: Record<string, unknown>;
  placeholder?: string;
}) {
  const { describedBy, invalid } = useFieldAria();
  return (
    <InputGroup invalid={invalid}>
      <InnerInput
        id={id}
        registration={registration}
        placeholder={placeholder}
        inputMode="decimal"
        describedBy={describedBy}
        invalid={invalid}
      />
    </InputGroup>
  );
}

/** Percent input — trailing `%`, right-aligned mono. Form value is percent-form (e.g. "4"). */
export function PercentInput({
  id,
  registration,
  placeholder = '0',
}: {
  id: string;
  registration: Record<string, unknown>;
  placeholder?: string;
}) {
  const { describedBy, invalid } = useFieldAria();
  return (
    <InputGroup suffix="%" invalid={invalid}>
      <InnerInput
        id={id}
        registration={registration}
        placeholder={placeholder}
        inputMode="decimal"
        describedBy={describedBy}
        invalid={invalid}
      />
    </InputGroup>
  );
}

/** Percentage-points input — trailing `pp`, right-aligned mono. Form value is pp-form (e.g. "1.5"). */
export function PpInput({
  id,
  registration,
  placeholder = '0',
}: {
  id: string;
  registration: Record<string, unknown>;
  placeholder?: string;
}) {
  const { describedBy, invalid } = useFieldAria();
  return (
    <InputGroup suffix="pp" invalid={invalid}>
      <InnerInput
        id={id}
        registration={registration}
        placeholder={placeholder}
        inputMode="decimal"
        describedBy={describedBy}
        invalid={invalid}
      />
    </InputGroup>
  );
}
