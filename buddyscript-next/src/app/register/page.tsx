"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useRegister } from "@/hooks/useRegister";
import { registerSchema } from "@/lib/validators/auth";
import { Button, FormField, AuthLayout } from "@/app/ui/atomic";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
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
    <AuthLayout
      title="Registration"
      subtitle="Get Started Now"
      imageUrl="/icons/registration.png"
      imageDarkUrl="/icons/registration1.png"
      imageAlt="Registration"
      imagePosition="left"
      showGoogleSignIn={true}
      isGoogleLoading={isPending}
      wrapperClassName="_social_registration_wrapper"
    >
      <form
        className="_social_registration_form"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
            <FormField
              label="First Name"
              name="firstName"
              type="text"
              value={values.firstName}
              onChange={handleInputChange("firstName")}
              error={clientErrors.firstName}
              required
              autoComplete="given-name"
              containerClassName="_social_registration_form_input _mar_b14"
              labelClassName="_social_registration_label _mar_b8"
              inputClassName="form-control _social_registration_input"
              errorClassName="_social_registration_error"
            />
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
            <FormField
              label="Last Name"
              name="lastName"
              type="text"
              value={values.lastName}
              onChange={handleInputChange("lastName")}
              error={clientErrors.lastName}
              required
              autoComplete="family-name"
              containerClassName="_social_registration_form_input _mar_b14"
              labelClassName="_social_registration_label _mar_b8"
              inputClassName="form-control _social_registration_input"
              errorClassName="_social_registration_error"
            />
          </div>
        </div>
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
              containerClassName="_social_registration_form_input _mar_b14"
              labelClassName="_social_registration_label _mar_b8"
              inputClassName="form-control _social_registration_input"
              errorClassName="_social_registration_error"
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
              autoComplete="new-password"
              containerClassName="_social_registration_form_input _mar_b14"
              labelClassName="_social_registration_label _mar_b8"
              inputClassName="form-control _social_registration_input"
              errorClassName="_social_registration_error"
            />
          </div>
          <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <FormField
              label="Repeat Password"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleInputChange("confirmPassword")}
              error={clientErrors.confirmPassword}
              required
              autoComplete="new-password"
              containerClassName="_social_registration_form_input _mar_b14"
              labelClassName="_social_registration_label _mar_b8"
              inputClassName="form-control _social_registration_input"
              errorClassName="_social_registration_error"
            />
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
              <Button
                type="submit"
                variant="primary"
                loading={isPending}
                fullWidth
                className="_social_registration_form_btn_link"
              >
                {isPending ? "Creating..." : "Create account"}
              </Button>
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
    </AuthLayout>
  );
}
