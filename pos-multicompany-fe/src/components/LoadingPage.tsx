import { Spinner } from "@/components/ui/spinner";
import LogoSmartPos from "@/assets/images/logo-smart-pos.png";

type LoadingPageProps = {
  message?: string;
};

export default function LoadingPage({
  message = "Preparing your workspace...",
}: LoadingPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100  text-black">
      <div className="flex flex-col items-center gap-5">
        {/* Spinner */}
        <img src={LogoSmartPos} className="w-1/4" alt="" />
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Spinner className="size-8 text-primary" />
        </div>

        {/* Loading Text */}
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
