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
import { compareISODates, parseISODateParts, todayISODate, toISODate } from "@/lib/dateIso";
import { PortalSelect } from "@/components/ui/PortalSelect";

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface DatePickerFieldProps {
  id?: string;
  value: string;
  onChange: (isoDate: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Classes on the trigger (e.g. `staff-form-input date-pickerTrigger`) */
  triggerClassName?: string;
  minDate?: string;
  maxDate?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`date-picker-chevron ${open ? "date-picker-chevron--open" : ""}`}
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

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

export function DatePickerField({
  id: idProp,
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  triggerClassName = "",
  minDate: minDateProp,
  maxDate: maxDateProp,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: DatePickerFieldProps) {
  const genId = useId();
  const buttonId = idProp ?? `date-picker-${genId}`;
  const menuId = `${buttonId}-calendar`;

  const minDate = minDateProp ?? "1900-01-01";
  const maxDate = maxDateProp ?? todayISODate();

  const bounds = useMemo(() => {
    const minP = parseISODateParts(minDate) ?? { y: 1900, m: 1, d: 1 };
    const maxP = parseISODateParts(maxDate) ?? parseISODateParts(todayISODate())!;
    return {
      minY: minP.y,
      maxY: maxP.y,
      minDate,
      maxDate,
    };
  }, [minDate, maxDate]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = bounds.maxY; y >= bounds.minY; y -= 1) list.push(y);
    return list;
  }, [bounds.maxY, bounds.minY]);

  const monthPortalOptions = useMemo(
    () => MONTH_LABELS.map((name, i) => ({ value: String(i + 1), label: name })),
    []
  );

  const yearPortalOptions = useMemo(
    () => years.map((y) => ({ value: String(y), label: String(y) })),
    [years]
  );

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 280,
  });

  const parsedValue = useMemo(() => parseISODateParts(value), [value]);

  const [viewYear, setViewYear] = useState(() => parsedValue?.y ?? bounds.maxY);
  const [viewMonth, setViewMonth] = useState(() => parsedValue?.m ?? 12);

  useEffect(() => {
    if (open) return;
    if (parsedValue) {
      setViewYear(parsedValue.y);
      setViewMonth(parsedValue.m);
    }
  }, [parsedValue, open]);

  const openCalendar = useCallback(() => {
    if (disabled) return;
    const anchor = parsedValue;
    if (anchor) {
      setViewYear(anchor.y);
      setViewMonth(anchor.m);
    } else {
      const t = parseISODateParts(bounds.maxDate);
      if (t) {
        setViewYear(t.y);
        setViewMonth(t.m);
      }
    }
    setOpen(true);
  }, [disabled, parsedValue, bounds.maxDate]);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 4;
    const wantW = Math.max(280, rect.width);
    let left = rect.left;
    if (left + wantW > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - wantW - 8);
    }
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const calHeight = 340;
    const flip = spaceBelow < calHeight && rect.top > spaceBelow;
    setMenuStyle({
      top: flip ? rect.top - calHeight - gap : rect.bottom + gap,
      left,
      width: wantW,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition, viewYear, viewMonth]);

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
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      if (t instanceof Element && t.closest("[data-portal-select-menu]")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const displayText = useMemo(() => {
    if (!parsedValue) return null;
    const dt = new Date(parsedValue.y, parsedValue.m - 1, parsedValue.d);
    return dt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [parsedValue]);

  const dayGrid = useMemo(() => {
    const first = new Date(viewYear, viewMonth - 1, 1);
    const startPad = first.getDay();
    const total = daysInMonth(viewYear, viewMonth);
    const cells: Array<{ d: number; inMonth: boolean }> = [];
    for (let i = 0; i < startPad; i += 1) cells.push({ d: 0, inMonth: false });
    for (let d = 1; d <= total; d += 1) cells.push({ d, inMonth: true });
    while (cells.length % 7 !== 0) cells.push({ d: 0, inMonth: false });
    return cells;
  }, [viewYear, viewMonth]);

  const isDayDisabled = (d: number): boolean => {
    const iso = toISODate(viewYear, viewMonth, d);
    return compareISODates(iso, bounds.minDate) < 0 || compareISODates(iso, bounds.maxDate) > 0;
  };

  const pickDay = (d: number) => {
    if (d < 1 || isDayDisabled(d)) return;
    onChange(toISODate(viewYear, viewMonth, d));
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) setOpen(false);
      else openCalendar();
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      openCalendar();
    }
  };

  const goPrevMonth = () => {
    if (viewMonth <= 1) {
      if (viewYear > bounds.minY) {
        setViewYear((y) => y - 1);
        setViewMonth(12);
      }
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth >= 12) {
      if (viewYear < bounds.maxY) {
        setViewYear((y) => y + 1);
        setViewMonth(1);
      }
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const menu =
    open && typeof document !== "undefined" ? (
      <div
        ref={menuRef}
        id={menuId}
        className="date-picker-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Choose date"
        style={{
          position: "fixed",
          top: menuStyle.top,
          left: menuStyle.left,
          width: menuStyle.width,
          zIndex: 400,
        }}
      >
        <div className="date-picker-toolbar">
          <button type="button" className="date-picker-nav-btn" onClick={goPrevMonth} aria-label="Previous month">
            ‹
          </button>
          <div className="date-picker-toolbar-selects">
            <PortalSelect
              id={`${menuId}-month`}
              value={String(viewMonth)}
              onChange={(v) => setViewMonth(Number(v))}
              options={monthPortalOptions}
              placeholder="Month"
              triggerClassName="date-picker-portal-select"
              menuZIndex={460}
              menuMaxHeight={280}
              aria-label="Month"
            />
            <PortalSelect
              id={`${menuId}-year`}
              value={String(viewYear)}
              onChange={(v) => setViewYear(Number(v))}
              options={yearPortalOptions}
              placeholder="Year"
              triggerClassName="date-picker-portal-select"
              menuZIndex={460}
              menuMaxHeight={320}
              aria-label="Year"
            />
          </div>
          <button type="button" className="date-picker-nav-btn" onClick={goNextMonth} aria-label="Next month">
            ›
          </button>
        </div>
        <div className="date-picker-weekdays" aria-hidden>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
            <span key={w} className="date-picker-weekday">
              {w}
            </span>
          ))}
        </div>
        <div className="date-picker-grid">
          {dayGrid.map((cell, idx) => {
            if (!cell.inMonth || cell.d === 0) {
              return <div key={`empty-${idx}`} className="date-picker-cell date-picker-cell--empty" />;
            }
            const iso = toISODate(viewYear, viewMonth, cell.d);
            const disabledDay = isDayDisabled(cell.d);
            const selected =
              parsedValue &&
              parsedValue.y === viewYear &&
              parsedValue.m === viewMonth &&
              parsedValue.d === cell.d;
            return (
              <button
                key={iso}
                type="button"
                disabled={disabledDay}
                className={`date-picker-day${selected ? " date-picker-day--selected" : ""}${disabledDay ? " date-picker-day--disabled" : ""}`}
                onClick={() => pickDay(cell.d)}
              >
                {cell.d}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={buttonId}
        disabled={disabled}
        className={`date-picker-trigger ${triggerClassName}`.trim()}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => (open ? setOpen(false) : openCalendar())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={displayText ? "date-picker-trigger-text" : "date-picker-trigger-text date-picker-trigger-text--muted"}>
          {displayText ?? placeholder}
        </span>
        <ChevronDown open={open} />
      </button>
      {menu ? createPortal(menu, document.body) : null}
    </>
  );
}
