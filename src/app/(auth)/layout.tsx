import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="font-display text-2xl font-extrabold text-navy">
        Sobres<span className="text-primary">.</span>
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-white p-6 shadow-sm">{children}</div>
    </main>
  );
}
