"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export interface PortalSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface PortalSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: PortalSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  /** When there are zero options, trigger shows this and the menu stays empty */
  emptyMessage?: string;
  /** Classes applied to the trigger button (e.g. staff-form-select or roles-form-select) */
  triggerClassName?: string;
  /** Portaled menu z-index (use higher when nested, e.g. inside the calendar popover) */
  menuZIndex?: number;
  /** Fixed max height for the dropdown list (scrollable); overrides viewport-based cap when set */
  menuMaxHeight?: number;
  /** Show a checkmark next to the selected option */
  showCheckmark?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

function SelectedCheck() {
  return (
    <svg
      className="portal-select-check"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`portal-select-chevron ${open ? "portal-select-chevron--open" : ""}`}
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function PortalSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  emptyMessage = "No options available",
  triggerClassName = "",
  menuZIndex = 400,
  menuMaxHeight,
  showCheckmark = true,
  id: idProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: PortalSelectProps) {
  const genId = useId();
  const buttonId = idProp ?? `portal-select-${genId}`;
  const listboxId = `${buttonId}-listbox`;

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuBox, setMenuBox] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 240,
  });

  const enabledOptions = useMemo(
    () => options.filter((o) => !o.disabled),
    [options]
  );
  const selectable = !disabled && enabledOptions.length > 0;

  const displayLabel = useMemo(() => {
    const found = options.find((o) => o.value === value && !o.disabled);
    if (found) return found.label;
    return enabledOptions.length === 0 ? emptyMessage : placeholder;
  }, [options, value, enabledOptions.length, emptyMessage, placeholder]);

  const triggerTextMuted = useMemo(() => {
    const found = options.find((o) => o.value === value && !o.disabled);
    return !found;
  }, [options, value]);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 4;
    const maxWant = 280;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    const spaceAbove = rect.top - gap - 12;
    const flip = spaceBelow < 100 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(maxWant, Math.max(72, flip ? spaceAbove : spaceBelow));
    setMenuBox({
      top: flip ? rect.top - maxHeight - gap : rect.bottom + gap,
      left: rect.left,
      width: Math.max(rect.width, 160),
      maxHeight,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition, options.length]);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => updatePosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(
      0,
      enabledOptions.findIndex((o) => o.value === value)
    );
    setHighlight(idx >= 0 ? idx : 0);
  }, [open, value, enabledOptions]);

  const close = () => setOpen(false);

  const commitHighlight = (idx: number) => {
    const o = enabledOptions[idx];
    if (!o) return;
    onChange(o.value);
    close();
    triggerRef.current?.focus();
  };

  const onKeyDownTrigger = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!selectable) return;
      if (!open) {
        setOpen(true);
        return;
      }
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next = Math.min(
        enabledOptions.length - 1,
        Math.max(0, highlight + delta)
      );
      setHighlight(next);
    } else if (e.key === "Enter" || e.key === " ") {
      if (!selectable) return;
      e.preventDefault();
      if (open) commitHighlight(highlight);
      else setOpen(true);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  };

  const onKeyDownMenu = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      triggerRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(enabledOptions.length - 1, h + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commitHighlight(highlight);
    }
  };

  const menu =
    open && typeof document !== "undefined" ? (
      <div
        ref={menuRef}
        id={listboxId}
        role="listbox"
        tabIndex={-1}
        className="portal-select-menu"
        data-portal-select-menu=""
        style={{
          position: "fixed",
          top: menuBox.top,
          left: menuBox.left,
          width: menuBox.width,
          maxHeight: menuMaxHeight ?? menuBox.maxHeight,
          zIndex: menuZIndex,
        }}
        onKeyDown={onKeyDownMenu}
      >
        {enabledOptions.length === 0 ? (
          <div className="portal-select-empty" role="presentation">
            {emptyMessage}
          </div>
        ) : (
          enabledOptions.map((o, i) => (
            <div
              key={o.value}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={value === o.value}
              className={`portal-select-option ${i === highlight ? "portal-select-option--highlight" : ""} ${
                value === o.value ? "portal-select-option--selected" : ""
              }`}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commitHighlight(i)}
            >
              {showCheckmark ? (
                <span className="portal-select-option-check" aria-hidden>
                  {value === o.value ? <SelectedCheck /> : null}
                </span>
              ) : null}
              <span className="portal-select-option-label">{o.label}</span>
            </div>
          ))
        )}
      </div>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={buttonId}
        className={`portal-select-trigger ${triggerClassName}`.trim()}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => {
          if (!selectable) return;
          setOpen((o) => !o);
        }}
        onKeyDown={onKeyDownTrigger}
      >
        <span
          className={`portal-select-trigger-text${triggerTextMuted ? " portal-select-trigger-text--muted" : ""}`}
        >
          {displayLabel}
        </span>
        <ChevronDown open={open} />
      </button>
      {menu ? createPortal(menu, document.body) : null}
    </>
  );
}
