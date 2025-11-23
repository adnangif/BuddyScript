"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useRegister } from "@/hooks/useRegister";
import { registerSchema } from "@/lib/validators/auth";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
};

const initialState: FormState = {
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [values, setValues] = useState<FormState>(initialState);
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [statusMessage, setStatusMessage] = useState<string>("");
  const router = useRouter();
  const { mutateAsync, isPending } = useRegister();

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
    clientErrors[field] ? `registration-${field}-error` : undefined;

  const renderError = (field: keyof FormState) => {
    const message = clientErrors[field];
    if (!message) {
      return null;
    }

    return (
      <p
        id={`registration-${field}-error`}
        className="_social_registration_error"
        role="alert"
      >
        {message}
      </p>
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { confirmPassword, ...registerValues } = values;
    const parsed = registerSchema.safeParse(registerValues);

    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      for (const [field, messages] of Object.entries(fieldErrors)) {
        const message = messages?.[0];
        if (message) {
          nextErrors[field as keyof FormState] = message;
        }
      }
    }

    if (registerValues.password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!parsed.success || registerValues.password !== confirmPassword) {
      setClientErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        const validationMessage = "Please fix the highlighted fields and try again.";
        setStatusMessage(validationMessage);
        toast.error(validationMessage);
      }
      return;
    }

    setStatusMessage("");

    try {
      await mutateAsync(parsed.data);
      setValues(initialState);
      setClientErrors({});
      const successMessage = "Registration successful! Redirecting to login...";
      setStatusMessage(successMessage);
      toast.success(successMessage);
      router.push("/login");
    } catch (mutationError) {
      const fallbackMessage =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to register";
      setStatusMessage(fallbackMessage);
      toast.error(fallbackMessage);
    }
  };

  return (
    <main className="_social_registration_wrapper _layout_main_wrapper">
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

      <section className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src="/icons/registration.png" alt="Registration" />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/icons/registration1.png" alt="Registration" />
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img src="/icons/logo.svg" alt="BuddyScript" className="_right_logo" />
                </div>
                <p className="_social_registration_content_para _mar_b8">
                  Get Started Now
                </p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">
                  Registration
                </h4>
                <button
                  type="button"
                  className="_social_registration_content_btn _mar_b40"
                >
                  <img src="/icons/google.svg" alt="Google" className="_google_img" />
                  <span>Register with google</span>
                </button>
                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <form
                  className="_social_registration_form"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label
                          className="_social_registration_label _mar_b8"
                          htmlFor="registration-email"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="registration-email"
                          name="email"
                          className="form-control _social_registration_input"
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
                      <div className="_social_registration_form_input _mar_b14">
                        <label
                          className="_social_registration_label _mar_b8"
                          htmlFor="registration-password"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          id="registration-password"
                          name="password"
                          className="form-control _social_registration_input"
                          value={values.password}
                          onChange={handleInputChange("password")}
                          aria-invalid={Boolean(clientErrors.password)}
                          aria-describedby={getErrorId("password")}
                          autoComplete="new-password"
                          required
                        />
                        {renderError("password")}
                      </div>
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label
                          className="_social_registration_label _mar_b8"
                          htmlFor="registration-confirm-password"
                        >
                          Repeat Password
                        </label>
                        <input
                          type="password"
                          id="registration-confirm-password"
                          name="confirmPassword"
                          className="form-control _social_registration_input"
                          value={values.confirmPassword}
                          onChange={handleInputChange("confirmPassword")}
                          aria-invalid={Boolean(clientErrors.confirmPassword)}
                          aria-describedby={getErrorId("confirmPassword")}
                          autoComplete="new-password"
                          required
                        />
                        {renderError("confirmPassword")}
                      </div>
                    </div>
                  </div>

                  {statusMessage ? (
                    <div
                      className="_social_registration_form_status _mar_b14"
                      role="status"
                      aria-live="polite"
                    >
                      {statusMessage}
                    </div>
                  ) : null}

                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="radio"
                          id="registration-terms"
                          defaultChecked
                        />
                        <label
                          className="form-check-label _social_registration_form_check_label"
                          htmlFor="registration-terms"
                        >
                          I agree to terms &amp; conditions
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b24">
                        <button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1"
                          disabled={isPending}
                        >
                          {isPending ? "Creating..." : "Create account"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account? <a href="/login">Login Now</a>
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
