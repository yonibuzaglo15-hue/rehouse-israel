import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "לוח בקרה",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-950">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,149,46,0.07),transparent_50%)]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}
