import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import logoSmartPos from "@/assets/images/logo-smart-pos.png";


export default function EmailVerified() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-center gap-2">
          <img
            src={logoSmartPos}
            alt="Logo Smart POS"
            className="mb-4 w-[50%]"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-10">
          <div className="relative mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-green-50">
            <div className="absolute inset-2 rounded-full border border-green-100" />

            <CheckCircle2 className="size-12 text-green-600" />
          </div>

          <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">
            Email verified!
          </h1>

          <p className="mb-8 text-sm leading-relaxed text-slate-500">
            Your email address has been successfully verified. Your account is
            now ready to use.
          </p>

          <Link
            to="/"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            Continue to Login
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="mt-6 text-xs text-slate-400">
            Thank you for choosing Smart POS.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Smart POS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
