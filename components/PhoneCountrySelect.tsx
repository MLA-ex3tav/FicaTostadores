"use client";

import { ChevronDown, Search } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { Country } from "react-phone-number-input";
import { getCountryCallingCode } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

interface CountrySelectOption {
  value?: Country;
  label: string;
  divider?: boolean;
}

interface IconComponentProps {
  country: Country;
  label: string;
  aspectRatio?: number;
}

interface PhoneCountrySelectProps {
  value?: Country;
  onChange: (value?: Country) => void;
  options: CountrySelectOption[];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  name?: string;
  tabIndex?: number | string;
  iconComponent?: React.ComponentType<IconComponentProps>;
}

function CountryFlag({
  country,
  label,
  iconComponent: IconComponent,
}: {
  country: Country;
  label: string;
  iconComponent?: React.ComponentType<IconComponentProps>;
}) {
  if (IconComponent) {
    return <IconComponent country={country} label={label} aspectRatio={1.5} />;
  }

  const Flag = flags[country];

  if (Flag) {
    return <Flag title={label} />;
  }

  return (
    <span className="text-[10px] font-semibold uppercase text-steel-mid">
      {country}
    </span>
  );
}

function callingCode(country: Country): string {
  try {
    return `+${getCountryCallingCode(country)}`;
  } catch {
    return "";
  }
}

export default function PhoneCountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  className,
  onFocus,
  onBlur,
  name,
  tabIndex,
  iconComponent,
}: PhoneCountrySelectProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const countryOptions = useMemo(
    () => options.filter((option) => option.value && !option.divider),
    [options],
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return countryOptions;
    }

    return countryOptions.filter((option) => {
      const country = option.value as Country;
      const code = callingCode(country).toLowerCase();

      return (
        option.label.toLowerCase().includes(normalized) ||
        country.toLowerCase().includes(normalized) ||
        code.includes(normalized)
      );
    });
  }, [countryOptions, query]);

  const selectedOption = countryOptions.find((option) => option.value === value);
  const selectedCountry = value ?? countryOptions[0]?.value;
  const isDisabled = disabled || readOnly;

  function closeMenu() {
    setOpen(false);
    setQuery("");
    setHighlightIndex(0);
    onBlur?.();
  }

  function openMenu() {
    if (isDisabled) {
      return;
    }

    setOpen(true);
    setHighlightIndex(0);
    onFocus?.();
  }

  function selectCountry(country?: Country) {
    if (!country || isDisabled) {
      return;
    }

    onChange(country);
    closeMenu();
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    searchRef.current?.focus();

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
        setHighlightIndex(0);
        onBlur?.();
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
        setHighlightIndex(0);
        onBlur?.();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onBlur]);

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
      selectCountry(option?.value);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`phone-country-select relative ${className ?? ""}`}
    >
      {name ? <input type="hidden" name={name} value={value ?? ""} readOnly /> : null}

      <button
        type="button"
        tabIndex={typeof tabIndex === "number" ? tabIndex : undefined}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={
          selectedOption?.label
            ? `País seleccionado: ${selectedOption.label}`
            : "Seleccionar país"
        }
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-steel-dark/25 bg-[var(--input-bg)] px-2.5 text-steel-light transition-colors hover:border-steel-mid/50 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selectedCountry ? (
          <>
            <span className="phone-country-select__flag flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px]">
              <CountryFlag
                country={selectedCountry}
                label={selectedOption?.label ?? selectedCountry}
                iconComponent={iconComponent}
              />
            </span>
            <span className="text-xs font-medium tabular-nums text-steel-light">
              {callingCode(selectedCountry)}
            </span>
          </>
        ) : (
          <span className="text-xs text-steel-mid">País</span>
        )}
        <ChevronDown
          className={`phone-country-select__chevron h-3.5 w-3.5 shrink-0 text-steel-mid transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-steel-dark/30 bg-[var(--input-bg)] shadow-xl"
          onKeyDown={handleListKeyDown}
        >
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
                placeholder="Buscar país..."
                className="w-full rounded-lg border border-steel-dark/25 bg-background/60 py-2 pl-9 pr-3 text-sm text-steel-light placeholder:text-steel-dark focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
                aria-label="Buscar país"
              />
            </div>
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-label="Países"
            className="max-h-64 overflow-y-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-steel-dark">
                No se encontraron países.
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const country = option.value as Country;
                const isSelected = country === value;
                const isHighlighted = index === highlightIndex;

                return (
                  <li key={country} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectCountry(country)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                        isHighlighted || isSelected
                          ? "bg-orange/15 text-steel-light"
                          : "text-steel-mid hover:bg-panel/80 hover:text-steel-light"
                      }`}
                    >
                      <span className="phone-country-select__flag flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px]">
                        <CountryFlag
                          country={country}
                          label={option.label}
                          iconComponent={iconComponent}
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      <span className="shrink-0 text-xs text-steel-dark">
                        {callingCode(country)}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
