import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "התחברות",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,149,46,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,42,67,0.9),transparent_60%)]"
        aria-hidden
      />
      {children}
    </div>
  );
}
