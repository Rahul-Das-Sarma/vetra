import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f5f4f1] px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(80,89,201,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(125,131,235,0.12), transparent 50%), radial-gradient(ellipse 40% 35% at 0% 90%, rgba(80,89,201,0.08), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(#e7e7e2 1px, transparent 1px), linear-gradient(90deg, #e7e7e2 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-8">
        <Link href="/" className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-[#5059c9]/25">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-[#0c1b2e]">
              Vetra
            </div>
            <p className="mt-1 text-sm text-[#747474]">
              Executive search dossier engine
            </p>
          </div>
        </Link>

        <div className="w-full text-center">
          <h1 className="text-lg font-semibold tracking-tight text-[#0c1b2e]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-[#747474]">{subtitle}</p>
        </div>

        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
