import type { Metadata } from "next";
import { Heebo, Rubik } from "next/font/google";
import "./globals.css";
import { LOGO_SRC } from "@/components/Logo";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rehouse.co.il"),
  title: {
    default: "Rehouse Israel | נדל״ן יוקרה בדרום",
    template: "%s | Rehouse Israel",
  },
  description:
    "סוכנות נדל״ן פרימיום באשדוד, אשקלון, יבנה וגן יבנה. דירות למכירה ולהשכרה, ליווי אישי ושירות ברמה בינלאומית.",
  keywords: [
    "נדלן יוקרה",
    "דירות למכירה אשדוד",
    "דירות להשכרה אשקלון",
    "נדלן יבנה",
    "גן יבנה נדלן",
    "Rehouse Israel",
    "נדל״ן דרום",
  ],
  openGraph: {
    title: "Rehouse Israel | נדל״ן יוקרה בדרום",
    description: "מצאו את הבית שלכם באשדוד, אשקלון ויבנה",
    locale: "he_IL",
    type: "website",
    siteName: "Rehouse Israel",
    images: [{ url: LOGO_SRC, width: 512, height: 512, alt: "Rehouse Israel" }],
  },
  icons: {
    icon: LOGO_SRC,
    apple: LOGO_SRC,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://rehouse.co.il",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} ${rubik.variable} font-body overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
