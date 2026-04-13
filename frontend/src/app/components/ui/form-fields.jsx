import * as React from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// AgroBridge Form Field System
//
// Components:
//   <FormInput />    — labeled text/number/email/etc. input with icon + error
//   <FormSelect />   — custom Headless UI Listbox (no overflow-clip issues)
//   <FormTextarea /> — labeled textarea with error support
//
// All share the same visual language:
//   • bg-input-background / dark:bg-card
//   • border-border → focus:border-primary (green ring)
//   • error → border-red-500 + error message below
//   • Fully full-width, rounded-lg, consistent padding
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared base classes ──────────────────────────────────────────────────────
const fieldBase = [
  "w-full rounded-lg border bg-input-background px-4 py-2.5 text-sm text-foreground",
  "border-border placeholder:text-muted-foreground",
  "transition-all duration-150 outline-none",
  "focus:border-primary focus:ring-2 focus:ring-primary/20",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const fieldError = "border-red-500 focus:border-red-500 focus:ring-red-500/20";

// ── Label ───────────────────────────────────────────────────────────────────
function FieldLabel({ id, label, required }) {
  if (!label) return null;
  return (
    <label
      htmlFor={id}
      className="block text-sm font-medium text-foreground/80 mb-1.5"
    >
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ── Error text ───────────────────────────────────────────────────────────────
function FieldError({ error }) {
  if (!error) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      {error}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FormInput
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {object}  props
 * @param {string}  props.label       — optional field label
 * @param {boolean} props.required    — appends * to label
 * @param {string}  props.error       — error message (shows red state)
 * @param {React.ReactNode} props.icon — optional icon rendered inside left edge
 * @param {string}  props.id          — html id (links label → input)
 * @param {string}  props.className   — extra classes on the outer wrapper
 * All other props forwarded to <input>
 */
const FormInput = React.forwardRef(function FormInput({
  label,
  required,
  error,
  icon,
  id,
  className,
  wrapperClassName,
  type = "text",
  ...props
}, ref) {
  const inputId = id || props.name;
  return (
    <div className={cn("w-full", wrapperClassName)}>
      <FieldLabel id={inputId} label={label} required={required} />
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          aria-invalid={!!error}
          className={cn(
            fieldBase,
            icon && "pl-9",
            error && fieldError,
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// FormSelect  —  Headless UI Listbox (escapes parent overflow-hidden)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {object}        props
 * @param {string}        props.label        — optional field label
 * @param {boolean}       props.required     — appends * to label
 * @param {string}        props.error        — error message
 * @param {Array}         props.options      — [{ label, value }] or string[]
 * @param {string}        props.placeholder  — shown when no value selected
 * @param {string}        props.value        — controlled value
 * @param {Function}      props.onChange     — called with a SyntheticEvent-like { target:{ value } }
 *                                            OR with just the raw value if using RHF Controller.
 *                                            The component auto-detects which style to call.
 *
 * RHF USAGE  — pass {...register("fieldName")} and the component fires onChange
 * correctly through the event shim.
 */
const FormSelect = React.forwardRef(function FormSelect(
  {
    label,
    required,
    error,
    options = [],
    placeholder,
    id,
    className,
    wrapperClassName,
    value,
    onChange,
    name,
    onBlur,
    ...rest
  },
  ref
) {
  const inputId = id || name;

  // Normalise options → [{ label, value }]
  const normalised = React.useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt
      ),
    [options]
  );

  // Resolve what label to display for the currently selected value
  const selectedLabel = React.useMemo(() => {
    const found = normalised.find((o) => o.value === value);
    return found ? found.label : (placeholder ?? "Select…");
  }, [normalised, value, placeholder]);

  // Shim onChange so both e.target.value callers and RHF register() work
  const handleChange = (newVal) => {
    if (typeof onChange === "function") {
      onChange({ target: { name, value: newVal } });
    }
  };

  return (
    <div className={cn("w-full", wrapperClassName)}>
      {label && (
        <label
          id={`${inputId}-label`}
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground/80 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <Listbox value={value ?? ""} onChange={handleChange} name={name}>
        <div className="relative">
          {/* Trigger button */}
          <Listbox.Button
            id={inputId}
            ref={ref}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-labelledby={label ? `${inputId}-label` : undefined}
            className={cn(
              "w-full flex items-center justify-between rounded-lg border bg-input-background px-4 py-2.5 text-sm",
              "border-border transition-all duration-150 outline-none",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "ui-open:border-primary ui-open:ring-2 ui-open:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              error && fieldError,
              className
            )}
          >
            <span
              className={cn(
                "block truncate text-left",
                !value && "text-muted-foreground"
              )}
            >
              {selectedLabel}
            </span>
            <ChevronDown
              className="w-4 h-4 text-muted-foreground shrink-0 ml-2 transition-transform ui-open:rotate-180"
              aria-hidden="true"
            />
          </Listbox.Button>

          {/* Dropdown */}
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
          >
            <Listbox.Options
              className={cn(
                "absolute z-[9999] mt-1 w-full min-w-[160px]",
                "max-h-60 overflow-y-auto rounded-lg",
                "bg-[#0f1724] border border-border",
                "shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
                "focus:outline-none py-1"
              )}
            >
              {normalised.length === 0 ? (
                <li className="px-4 py-2.5 text-sm text-muted-foreground select-none">
                  No options
                </li>
              ) : (
                normalised.map((opt) => (
                  <Listbox.Option
                    key={opt.value}
                    value={opt.value}
                    className={({ active, selected }) =>
                      cn(
                        "relative flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer select-none transition-colors",
                        active
                          ? "bg-primary/20 text-primary"
                          : selected
                          ? "text-primary"
                          : "text-foreground/80 hover:bg-white/5"
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn(
                            "block truncate",
                            selected && "font-medium"
                          )}
                        >
                          {opt.label}
                        </span>
                        {selected && (
                          <Check className="w-3.5 h-3.5 shrink-0 text-primary ml-2" />
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      <FieldError error={error} />
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// FormTextarea
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {object}  props
 * @param {string}  props.label    — optional field label
 * @param {boolean} props.required — appends * to label
 * @param {string}  props.error    — error message
 * @param {number}  props.rows     — textarea rows (default 3)
 * All other props forwarded to <textarea>
 */
const FormTextarea = React.forwardRef(function FormTextarea({
  label,
  required,
  error,
  rows = 3,
  id,
  className,
  wrapperClassName,
  ...props
}, ref) {
  const inputId = id || props.name;
  return (
    <div className={cn("w-full", wrapperClassName)}>
      <FieldLabel id={inputId} label={label} required={required} />
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={!!error}
        className={cn(
          fieldBase,
          "resize-y min-h-[80px]",
          error && fieldError,
          className,
        )}
        ref={ref}
        {...props}
      />
      <FieldError error={error} />
    </div>
  );
});

export { FormInput, FormSelect, FormTextarea, fieldBase, fieldError };
