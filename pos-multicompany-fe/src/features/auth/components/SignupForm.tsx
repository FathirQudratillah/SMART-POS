import { signup } from "../api/signup";
import type { ApiErrorResponse } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import type { SignupFormProps, SignupFormRequest } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { useAlert } from "@/context/AlertContext";


const initialForm: SignupFormRequest = {
  name: "",
  email: "",
  password: "",
  phone: "",
  acceptTerms: false,
  acceptEmail: false,
  company: {
    name: "",
    code: "",
    legal_name: "",
    tax_number: "",
    email: "",
    phone: "",
    address: "",
  },
  branch: {
    name: "",
    code: "",
    phone: "",
    address: "",
  },
};

export default function SignupForm({setErrorMessage, onOpenChange}: SignupFormProps) {
  const { showMessage } = useAlert();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormRequest>({
    defaultValues: initialForm,
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<SignupFormRequest> = async (data) => {
    setErrorMessage("");

    try {
      const message = await signup(data);

      showMessage({
        variant: "success",
        title: "Registration successful!",
        description: message || "Please check your email.",
      });

      reset(initialForm);
      onOpenChange(false);
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;

      if (apiError.errors) {
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          if (field === "email" || field === "company.code") {
            setError(field, {
              type: "server",
              message: messages[0],
            });
          }
        });
      } else {
        setErrorMessage(apiError.message);
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Account Information */}
      <section className="space-y-4">
        <div>
          <h3 className="font-semibold text-xl">Account Information</h3>
          <p className="text-sm text-muted-foreground text-gray-600">
            Your account details for signing in.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name *</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              placeholder="Your full name"
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Full name is required.",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-phone">Phone Number *</Label>
            <Input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              placeholder="081234567890"
              aria-invalid={!!errors.phone}
              {...register("phone", {
                required: "Phone number is required.",
                minLength: {
                  value: 10,
                  message: "Phone number must be at least 10 characters.",
                },
              })}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="signup-email">Email Address *</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
              {...register("email", {
                required: "Email address is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="signup-password">Password *</Label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={!!errors.password}
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters.",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>
      </section>

      <Separator />

      {/* Company Information */}
      <section className="space-y-4">
        <div>
          <h3 className="font-semibold text-xl">Company Information</h3>
          <p className="text-sm text-muted-foreground text-gray-600">
            The first company you will manage.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              placeholder="Smart POS Indonesia"
              aria-invalid={!!errors.company?.name}
              {...register("company.name", {
                required: "Company name is required.",
              })}
            />
            {errors.company?.name && (
              <p className="text-sm text-red-600">
                {errors.company.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-code">Company Code *</Label>
            <Input
              id="company-code"
              placeholder="SMARTPOS001"
              maxLength={30}
              aria-invalid={!!errors.company?.code}
              {...register("company.code", {
                required: "Company code is required.",
                maxLength: {
                  value: 30,
                  message: "Company code must not exceed 30 characters.",
                },
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
            />
            {errors.company?.code && (
              <p className="text-sm text-red-600">
                {errors.company.code.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="legal-name">Legal Company Name</Label>
            <Input
              id="legal-name"
              placeholder="PT Smart POS Indonesia"
              {...register("company.legal_name")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-number">Tax Identification Number</Label>
            <Input
              id="tax-number"
              placeholder="Company tax identification number"
              {...register("company.tax_number")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-email">Company Email</Label>
            <Input
              id="company-email"
              type="email"
              placeholder="company@example.com"
              aria-invalid={!!errors.company?.email}
              {...register("company.email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid company email address.",
                },
              })}
            />
            {errors.company?.email && (
              <p className="text-sm text-red-600">
                {errors.company.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-phone">Company Phone Number</Label>
            <Input
              id="company-phone"
              type="tel"
              placeholder="02112345678"
              {...register("company.phone")}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="company-address">Company Address</Label>
            <Input
              id="company-address"
              placeholder="Full company address"
              {...register("company.address")}
            />
          </div>
        </div>
      </section>

      {/* Branch Information */}
      <section className="space-y-4">
        <div>
          <h3 className="font-semibold text-xl">Branch Information</h3>
          <p className="text-sm text-muted-foreground text-gray-600">
            The Main Branch you will manage.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branch-name">Branch Name *</Label>
            <Input
              id="branch-name"
              placeholder="Jakarta Main Branch"
              aria-invalid={!!errors.branch?.name}
              {...register("branch.name", {
                required: "Branch name is required.",
              })}
            />
            {errors.branch?.name && (
              <p className="text-sm text-red-600">
                {errors.branch.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-code">Branch Code *</Label>
            <Input
              id="branch-code"
              placeholder="JKT-01"
              maxLength={30}
              aria-invalid={!!errors.branch?.code}
              {...register("branch.code", {
                required: "Branch code is required.",
                maxLength: {
                  value: 30,
                  message: "Branch code must not exceed 30 characters.",
                },
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
            />
            {errors.branch?.code && (
              <p className="text-sm text-red-600">
                {errors.branch.code.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch-phone">Branch Phone Number</Label>
            <Input
              id="branch-phone"
              type="tel"
              placeholder="02112345678"
              {...register("branch.phone")}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="branch-address">Branch Address</Label>
            <Input
              id="branch-address"
              placeholder="Full branch address"
              {...register("branch.address")}
            />
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Controller
            name="acceptTerms"
            control={control}
            rules={{
              validate: (value) =>
                value || "You must accept the Terms & Conditions.",
            }}
            render={({ field }) => (
              <Checkbox
                id="accept-terms"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={!!errors.acceptTerms}
              />
            )}
          />

          <Label
            htmlFor="accept-terms"
            className="cursor-pointer text-sm leading-5 font-normal flex-wrap"
          >
            I agree to the{" "}
            <span className="text-blue-500">Terms & Conditions</span> and{" "}
            <span className="text-blue-500">Privacy Policy.</span>
          </Label>
        </div>

        {errors.acceptTerms && (
          <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Controller
            name="acceptEmail"
            control={control}
            rules={{
              validate: (value) =>
                value || "You must accept the Email Verification.",
            }}
            render={({ field }) => (
              <Checkbox
                id="accept-terms"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={!!errors.acceptTerms}
              />
            )}
          />

          <Label
            htmlFor="accept-email"
            className="cursor-pointer text-sm leading-5 font-normal flex-wrap"
          >
            By signing up, you agree to{" "}
            <span className="text-blue-500">receive an email</span> to{" "}
            <span className="text-blue-500">
              verify your account email address.
            </span>
          </Label>
        </div>

        {errors.acceptEmail && (
          <p className="text-sm text-red-600">{errors.acceptEmail.message}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="outline"
        disabled={isSubmitting}
        className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
        {isSubmitting && <Spinner />}
      </Button>
    </form>
  );
}
