"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLogin } from "@/hooks/useLogin";
import { loginSchema } from "@/lib/validators/auth";

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

  const getErrorId = (field: keyof FormState) =>
    clientErrors[field] ? `login-${field}-error` : undefined;

  const renderError = (field: keyof FormState) => {
    const message = clientErrors[field];
    if (!message) {
      return null;
    }

    return (
      <p
        id={`login-${field}-error`}
        className="_social_login_error"
        role="alert"
      >
        {message}
      </p>
    );
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
      router.push("/");
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
    <main className="_social_login_wrapper _layout_main_wrapper">
      <div className="_shape_one" aria-hidden="true">
        <img src="/icons/shape1.svg" alt="" className="_shape_img" />
        <img src="/icons/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two" aria-hidden="true">
        <img src="/icons/shape2.svg" alt="" className="_shape_img" />
        <img
          src="/icons/dark_shape1.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three" aria-hidden="true">
        <img src="/icons/shape3.svg" alt="" className="_shape_img" />
        <img
          src="/icons/dark_shape2.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>

      <section className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <img
                    src="/icons/login.png"
                    alt="Welcome back"
                    className="_left_img"
                  />
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  <img
                    src="/icons/logo.svg"
                    alt="BuddyScript"
                    className="_left_logo"
                  />
                </div>
                <p className="_social_login_content_para _mar_b8">
                  Welcome back
                </p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">
                  Login to your account
                </h4>
                <button
                  type="button"
                  className="_social_login_content_btn _mar_b40"
                  disabled={isPending}
                >
                  <img
                    src="/icons/google.svg"
                    alt="Google"
                    className="_google_img"
                  />
                  <span>Or sign-in with google</span>
                </button>
                <div className="_social_login_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <form
                  className="_social_login_form"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label
                          className="_social_login_label _mar_b8"
                          htmlFor="login-email"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="login-email"
                          name="email"
                          className="form-control _social_login_input"
                          value={values.email}
                          onChange={handleInputChange("email")}
                          aria-invalid={Boolean(clientErrors.email)}
                          aria-describedby={getErrorId("email")}
                          autoComplete="email"
                          required
                        />
                        {renderError("email")}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label
                          className="_social_login_label _mar_b8"
                          htmlFor="login-password"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          id="login-password"
                          name="password"
                          className="form-control _social_login_input"
                          value={values.password}
                          onChange={handleInputChange("password")}
                          aria-invalid={Boolean(clientErrors.password)}
                          aria-describedby={getErrorId("password")}
                          autoComplete="current-password"
                          required
                        />
                        {renderError("password")}
                      </div>
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
                        <button
                          type="submit"
                          className="_social_login_form_btn_link _btn1"
                          disabled={isPending}
                        >
                          {isPending ? "Signing in..." : "Login now"}
                        </button>
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


