"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLogin } from "@/hooks/useLogin";
import { loginSchema } from "@/lib/validators/auth";
import { Button, FormField, AuthLayout } from "@/app/ui/atomic";

type FormState = {
  email: string;
  password: string;
};

const initialState: FormState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [values, setValues] = useState<FormState>(initialState);
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [statusMessage, setStatusMessage] = useState<string>("");
  const router = useRouter();
  const { mutateAsync, isPending } = useLogin();

  const handleInputChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setClientErrors((prev) => {
        if (!prev[field]) {
          return prev;
        }
        const next = { ...prev };
        delete next[field];
        return next;
      });
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const nextErrors: Partial<Record<keyof FormState, string>> = {};

      for (const [field, messages] of Object.entries(fieldErrors)) {
        const message = messages?.[0];
        if (message) {
          nextErrors[field as keyof FormState] = message;
        }
      }

      setClientErrors(nextErrors);
      const validationMessage =
        "Please fix the highlighted fields and try again.";
      setStatusMessage(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setStatusMessage("");

    try {
      await mutateAsync(parsed.data);
      setValues(initialState);
      setClientErrors({});
      const successMessage = "Login successful! Redirecting...";
      setStatusMessage(successMessage);
      toast.success(successMessage);
      router.push("/feeds");
    } catch (mutationError) {
      const fallbackMessage =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to login";
      setStatusMessage(fallbackMessage);
      toast.error(fallbackMessage);
    }
  };

  return (
    <AuthLayout
      title="Login to your account"
      subtitle="Welcome back"
      imageUrl="/icons/login.png"
      imageAlt="Welcome back"
      imagePosition="left"
      showGoogleSignIn={true}
      isGoogleLoading={isPending}
      wrapperClassName="_social_login_wrapper"
    >
      <form
        className="_social_login_form"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="row">
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <FormField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleInputChange("email")}
              error={clientErrors.email}
              required
              autoComplete="email"
            />
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <FormField
              label="Password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleInputChange("password")}
              error={clientErrors.password}
              required
              autoComplete="current-password"
            />
          </div>
        </div>

        {statusMessage ? (
          <div
            className="_social_login_form_status _mar_b14"
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </div>
        ) : null}

        <div className="row">
          <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
            <div className="form-check _social_login_form_check">
              <input
                className="form-check-input _social_login_form_check_input"
                type="radio"
                id="login-remember"
                defaultChecked
              />
              <label
                className="form-check-label _social_login_form_check_label"
                htmlFor="login-remember"
              >
                Remember me
              </label>
            </div>
          </div>
          <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
            <div className="_social_login_form_left">
              <Link
                href="/forgot-password"
                className="_social_login_form_left_para"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
            <div className="_social_login_form_btn _mar_t40 _mar_b60">
              <Button
                type="submit"
                variant="primary"
                loading={isPending}
                fullWidth
                className="_social_login_form_btn_link"
              >
                {isPending ? "Signing in..." : "Login now"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_login_bottom_txt">
            <p className="_social_login_bottom_txt_para">
              Don&apos;t have an account?{" "}
              <Link href="/register">Create New Account</Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}


