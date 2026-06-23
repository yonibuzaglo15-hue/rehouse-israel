import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export default function AdminPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen overflow-x-hidden">{children}</main>
      <Footer />
      <Toaster
        position="top-center"
        dir="rtl"
        toastOptions={{
          classNames: {
            toast:
              "glass-panel !border-gold-500/30 !bg-white/95 !text-slate-900 dark:!bg-navy-950/95 dark:!text-white",
            success: "!border-emerald-500/40",
          },
        }}
      />
    </>
  );
}
