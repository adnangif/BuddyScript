import { ReactNode } from "react";

type AuthInputProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  icon?: ReactNode;
  error?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export function AuthInput({
  label,
  name,
  type = "text",
  value,
  placeholder,
  icon,
  error,
  autoComplete,
  onChange,
}: AuthInputProps) {
  const hasError = Boolean(error);

  return (
    <label className="flex flex-col gap-1 text-white" htmlFor={name}>
      <span className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
        {label}
      </span>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
          hasError
            ? "border-rose-400/60 bg-rose-500/10 shadow-[0_8px_24px_rgba(225,29,72,0.25)]"
            : "border-white/15 bg-white/5 shadow-[0_8px_24px_rgba(5,10,23,0.45)] hover:border-white/30 focus-within:border-white/60 focus-within:bg-white/10"
        }`}
      >
        {icon ? (
          <span className="text-white/60" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 flex-1 border-none bg-transparent text-base text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>
      {error ? (
        <span className="text-xs font-medium text-rose-200">{error}</span>
      ) : null}
    </label>
  );
}

