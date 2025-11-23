"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import { AuthInput } from "./AuthInput";
import { useRegister } from "@/hooks/useRegister";
import { registerSchema } from "@/lib/validators/auth";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export function RegisterForm() {
  const [values, setValues] = useState<FormState>(initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { mutateAsync, isPending, isSuccess, error } = useRegister();

  const statusMessage = useMemo(() => {
    if (isSuccess) {
      return "Registration successful! Redirecting to login...";
    }

    if (error?.message) {
      return error.message;
    }

    return "";
  }, [error, isSuccess]);

  const handleChange =
    (field: keyof FormState) =>
    (value: string): void => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setClientErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = registerSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setClientErrors(
        Object.keys(fieldErrors).reduce<Record<string, string>>(
          (acc, key) => ({
            ...acc,
            [key]: fieldErrors[key as keyof typeof fieldErrors]?.[0] ?? "",
          }),
          {},
        ),
      );
      return;
    }

    try {
      await mutateAsync(parsed.data);
      router.push("/login");
    } catch {
      // errors handled via mutation state
    }
  };

  return (
    <form
      className="space-y-6 rounded-[32px] border border-white/10 bg-[#0A112A]/80 p-6 text-white shadow-[0_30px_80px_rgba(2,6,23,0.8)] backdrop-blur-3xl sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2 text-center lg:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#FFC680]">
          Registration
        </p>
        <h2 className="text-3xl font-semibold text-white">Get started now</h2>
        <p className="text-sm text-white/70">
          Sign up to create posts, share photos, and keep memories safe.
        </p>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
      >
        <Image
          src="/icons/google.svg"
          alt=""
          width={18}
          height={18}
          className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
        />
        Register with Google
      </button>

      <div className="flex items-center gap-4 text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-white/40">
        <span className="h-px flex-1 bg-white/10" />
        Or
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput
          label="First name"
          name="firstName"
          value={values.firstName}
          placeholder="Jane"
          icon={<UserIcon aria-hidden className="h-5 w-5 text-white/60" />}
          error={clientErrors.firstName}
          autoComplete="given-name"
          onChange={handleChange("firstName")}
        />
        <AuthInput
          label="Last name"
          name="lastName"
          value={values.lastName}
          placeholder="Doe"
          icon={<UserIcon aria-hidden className="h-5 w-5 text-white/60" />}
          error={clientErrors.lastName}
          autoComplete="family-name"
          onChange={handleChange("lastName")}
        />
      </div>
      <AuthInput
        label="Email"
        name="email"
        value={values.email}
        placeholder="name@company.com"
        icon={<EnvelopeIcon aria-hidden className="h-5 w-5 text-white/60" />}
        error={clientErrors.email}
        autoComplete="email"
        onChange={handleChange("email")}
      />
      <AuthInput
        label="Password"
        name="password"
        type="password"
        value={values.password}
        placeholder="••••••••"
        icon={
          <LockClosedIcon aria-hidden className="h-5 w-5 text-white/60" />
        }
        error={clientErrors.password}
        autoComplete="new-password"
        onChange={handleChange("password")}
      />

      {statusMessage ? (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            isSuccess
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
              : error
                ? "border-rose-400/40 bg-rose-500/10 text-rose-100"
                : "border-white/10 bg-white/5 text-white/80"
          }`}
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}

      <label className="flex items-start gap-3 text-xs text-white/70">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-white/40 bg-transparent text-[#FF8A4F] focus:ring-[#FF8A4F] focus:ring-offset-0"
          defaultChecked
          required
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-white hover:text-[#FFC680]">
            terms &amp; conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white hover:text-[#FFC680]">
            privacy policy
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF8A4F] via-[#FF5F6D] to-[#7C3AED] px-6 py-4 text-base font-semibold shadow-[0_20px_60px_rgba(255,110,86,0.4)] transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
      >
        <span className="relative z-10">
          {isPending ? "Creating account..." : "Create account"}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-40" />
      </button>

      <p className="text-center text-sm text-white/70">
        Already have an account?{" "}
        <Link href="/login" className="text-white hover:text-[#FFC680]">
          Log in
        </Link>
      </p>
    </form>
  );
}

