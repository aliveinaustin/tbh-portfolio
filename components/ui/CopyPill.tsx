'use client'

import { Copy, Check } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
type CopyPillProps = {
  label: string;
  value: string;
};

export default function CopyPill({ label, value }: CopyPillProps) {
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
    <div className="inline-flex w-fit items-center justify-between gap-4 rounded-full bg-surface-invert surface-invert py-2 pl-5 pr-2">
      <span className="flex flex-col gap-1">
        <span className="text-code text-text-faint select-none">{label}</span>
        <span className="select-all text-body-sm font-semibold text-text-invert">{value}</span>
      </span>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${value}`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-text transition-colors hover:bg-surface-high"
      >
        {copied ? <Check size={18} strokeWidth={2} /> : <Copy size={18} strokeWidth={1.5} />}
      </button>

      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}