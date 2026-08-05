"use client";

import { useRef, KeyboardEvent, ClipboardEvent, useId } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const baseId = useId();

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function focarProximo(index: number) {
    inputRefs.current[index + 1]?.focus();
  }

  function focarAnterior(index: number) {
    inputRefs.current[index - 1]?.focus();
  }

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    onChange(newDigits.join(""));

    if (digit && index < length - 1) {
      focarProximo(index);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      } else {
        focarAnterior(index);
      }
    }

    if (e.key === "ArrowLeft") focarAnterior(index);
    if (e.key === "ArrowRight") focarProximo(index);
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    onChange(pasted.padEnd(length, "").slice(0, length));
    const lastIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[lastIndex]?.focus();
  }

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Código de verificação">
      {digits.map((digit, index) => (
        <input
          key={index}
          id={`${baseId}-otp-${index}`}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Dígito ${index + 1} de ${length}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            // layout — bordas 10px conforme design system
            "h-14 w-12 rounded-[10px] text-center text-xl font-semibold",
            // cores base
            "bg-background text-foreground",
            "border border-border",
            // foco — azul petróleo
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            // transição discreta (150–250ms)
            "transition-all duration-200",
            // preenchido
            digit && "border-primary/40",
            // erro
            hasError && "border-destructive focus:ring-destructive/30",
            // disabled
            disabled && "opacity-40 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
}
