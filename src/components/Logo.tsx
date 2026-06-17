import Image from "next/image";
import Link from "next/link";

export const LOGO_SRC = "/images/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  linked?: boolean;
  className?: string;
}

const HEIGHT = { sm: 40, md: 52, lg: 72 } as const;

export default function Logo({ size = "sm", linked = true, className = "" }: LogoProps) {
  const h = HEIGHT[size];

  const img = (
    <Image
      src={LOGO_SRC}
      alt="Rehouse Israel"
      width={h * 3.5}
      height={h}
      className={`w-auto object-contain ${className}`}
      style={{ height: h }}
      priority={size === "sm"}
    />
  );

  if (!linked) return <span className="inline-flex">{img}</span>;

  return (
    <Link href="/" className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90">
      {img}
    </Link>
  );
}
