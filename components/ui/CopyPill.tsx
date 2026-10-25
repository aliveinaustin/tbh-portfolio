'use client'

import { Copy, Check } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type CopyPillProps = {
  label?: string;
  value: string;
  className?: string; // layout only (display, margin, alignment, width)
};

export default function CopyPill({ label, value, className }: CopyPillProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — value stays selectable as a fallback
    }
  }

  return (
    <div
      className={cn(
        "inline-flex w-fit items-center justify-between gap-4 rounded-full bg-surface-invert surface-invert py-2 pl-5 pr-2",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
        className
      )}
    >
      <span className="flex min-w-0 flex-col">
        {label && <span className="text-code text-text-faint select-none">{label}</span>}
        <span className="select-all truncate text-body-sm font-semibold text-text-invert">{value}</span>
      </span>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${value}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-text transition-colors hover:bg-surface-high focus-visible:outline-none"
      >
        {copied
          ? <Check size={18} strokeWidth={2} aria-hidden="true" />
          : <Copy size={18} strokeWidth={1.5} aria-hidden="true" />}
      </button>

      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}