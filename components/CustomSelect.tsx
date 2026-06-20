"use client";

import { ChevronDown, Search } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  disabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  id?: string;
  name?: string;
  className?: string;
  searchable?: boolean;
}

const SEARCH_THRESHOLD = 10;

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  disabled,
  placeholder = "Seleccionar…",
  "aria-label": ariaLabel,
  id,
  name,
  className,
  searchable,
}: CustomSelectProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const showSearch = searchable ?? options.length > SEARCH_THRESHOLD;

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalized) ||
        option.value.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  const selectedOption = options.find((option) => option.value === value);

  function closeMenu() {
    setOpen(false);
    setQuery("");
    setHighlightIndex(0);
    setMenuPosition(null);
  }

  function openMenu() {
    if (disabled) {
      return;
    }

    setOpen(true);
    setHighlightIndex(0);
  }

  function selectValue(nextValue: string) {
    if (disabled) {
      return;
    }

    onChange(nextValue);
    closeMenu();
  }

  function updateMenuPosition() {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.max(rect.width, 160),
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (showSearch) {
      searchRef.current?.focus();
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (containerRef.current?.contains(target)) {
        return;
      }

      if (menuRef.current?.contains(target)) {
        return;
      }

      closeMenu();
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, showSearch]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open ? closeMenu() : openMenu();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openMenu();
      }
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open || filteredOptions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) =>
        index + 1 >= filteredOptions.length ? 0 : index + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) =>
        index - 1 < 0 ? filteredOptions.length - 1 : index - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[highlightIndex];
      if (option) {
        selectValue(option.value);
      }
    }
  }

  const triggerLabel = selectedOption?.label ?? placeholder;

  const menu =
    open && menuPosition ? (
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
        }}
        className="z-[120] overflow-hidden rounded-xl border border-steel-dark/30 bg-[var(--input-bg)] shadow-xl"
        onKeyDown={handleListKeyDown}
      >
        {showSearch ? (
          <div className="border-b border-steel-dark/20 p-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-dark"
                aria-hidden
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlightIndex(0);
                }}
                placeholder="Buscar…"
                className="w-full rounded-lg border border-steel-dark/25 bg-background/60 py-2 pl-9 pr-3 text-sm text-steel-light placeholder:text-steel-dark focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
                aria-label="Buscar opciones"
              />
            </div>
          </div>
        ) : null}

        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel ?? "Opciones"}
          className="max-h-64 overflow-y-auto py-1"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-3 text-sm text-steel-dark">
              No se encontraron opciones.
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightIndex;

              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => selectValue(option.value)}
                    className={`flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors ${
                      isHighlighted || isSelected
                        ? "bg-orange/15 text-steel-light"
                        : "text-steel-mid hover:bg-panel/80 hover:text-steel-light"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    ) : null;

  return (
    <div
      ref={containerRef}
      className={`custom-select relative ${className ?? ""}`}
    >
      {name ? <input type="hidden" name={name} value={value} readOnly /> : null}

      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel ?? triggerLabel}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-steel-dark/25 bg-[var(--input-bg)] px-3 text-sm text-steel-light transition-colors hover:border-steel-mid/50 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={`min-w-0 flex-1 truncate text-left ${selectedOption ? "text-steel-light" : "text-steel-mid"}`}
        >
          {triggerLabel}
        </span>
        <ChevronDown
          className={`custom-select__chevron h-4 w-4 shrink-0 text-steel-mid transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
