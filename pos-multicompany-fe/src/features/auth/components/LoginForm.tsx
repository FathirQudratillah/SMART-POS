import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LoginDataRequest } from "../types";
import { useForm, type SubmitHandler } from "react-hook-form";
import { login } from "../api/login";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthContext";
import SignupModal from "./SignupModal";
import { Spinner } from "@/components/ui/spinner";
import FormLogo from "@/components/ui/FormLogo";
import { requestPasswordReset } from "../api/password";

export default function LoginForm() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginDataRequest>();
  const emailRegistration = register("email", {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email address",
    },
  });

  const onSubmit: SubmitHandler<LoginDataRequest> = async (data) => {
    try {
      await login(data);
      refreshUser();
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
      }
    }
  };

  const onForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetMessage("");
    setResetError("");
    setIsSendingReset(true);
    try {
      setResetMessage(await requestPasswordReset(forgotEmail));
    } catch (error: unknown) {
      setResetError(
        typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
          ? error.message
          : "Unable to request a password reset. Please try again.",
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="h-full w-full md:w-2/3 lg:w-1/3 px-20 justify-center lg:mb-30 flex flex-col items-center z-50">
      <FormLogo className="mb-8 w-[90%]" />
      <p className="self-start text-2xl font-bold text-white">
        {forgotPassword ? "Forgot password" : "Login"}
      </p>

      <div className="w-full mt-8">
        {forgotPassword ? (
          <form className="gap-4 flex flex-col" onSubmit={onForgotPassword}>
            <p className="text-sm text-white/80">
              Enter your account email and we&apos;ll send a password reset
              link.
            </p>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
              className="w-full rounded-md border-2 border-white px-4 py-2 text-white placeholder:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 lg:border-gray-500 lg:placeholder:text-gray-500"
            />
            {resetMessage && (
              <p role="status" className="text-sm text-green-300">
                {resetMessage}
              </p>
            )}
            {resetError && (
              <p role="alert" className="text-sm text-red-400">
                {resetError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSendingReset}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-400 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
            >
              Send reset link
              {isSendingReset && <Spinner />}
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotPassword(false);
                setResetMessage("");
                setResetError("");
              }}
              className="text-sm text-gray-200 hover:underline"
            >
              Back to login
            </button>
          </form>
        ) : (
          <form
            className="gap-4 flex flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <input
                type="email"
                placeholder="Email"
                {...emailRegistration}
                onChange={(event) => {
                  void emailRegistration.onChange(event);
                  setForgotEmail(event.target.value);
                }}
                className="w-full text-white placeholder:text-white lg:placeholder:text-gray-500 border-2 border-white lg:border-gray-500 rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              {errors.email && (
                <span className="ml-2 text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                })}
                className="w-full text-white placeholder:text-white lg:placeholder:text-gray-500 border-2 border-white lg:border-gray-500 rounded-md py-2 pl-4 pr-11 focus:outline-none focus:ring-1 focus:ring-gray-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white lg:text-gray-500 hover:text-gray-700"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <span className="ml-2 text-red-500 text-xs">
                  {errors.password.message}
                </span>
              )}
            </div>

            {errorMessage && (
              <p className="text-center my-2 text-red-500 text-xs">
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setForgotEmail(getValues("email"));
                setForgotPassword(true);
                setErrorMessage(null);
              }}
              className="self-end text-sm text-gray-200 hover:underline"
            >
              Forgot password?
            </button>

            <button
              type="submit"
              className="bg-blue-400 w-full flex justify-center items-center gap-2 text-white font rounded-md py-2 px-4 hover:bg-blue-500"
            >
              Login
              {isSubmitting && <Spinner />}
            </button>
          </form>
        )}
      </div>

      {!forgotPassword && (
        <p className="text-sm text-gray-400 mt-4">
          Dont have an account?{" "}
          <span
            onClick={() => setSignupOpen(true)}
            className="text-gray-200 md:text-blue-400  hover:underline"
          >
            Sign up
          </span>
        </p>
      )}

      <SignupModal open={signupOpen} onOpenChange={setSignupOpen} />
    </div>
  );
}
