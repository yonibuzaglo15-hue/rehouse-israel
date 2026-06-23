import Link from "next/link";
import { BRAND } from "@/lib/brand";
import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  WhatsAppIcon,
} from "@/components/icons/SocialIcons";

const SOCIAL_LINKS = [
  { key: "facebook", href: BRAND.social.facebook, label: "Facebook", Icon: FacebookIcon },
  { key: "instagram", href: BRAND.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { key: "youtube", href: BRAND.social.youtube, label: "YouTube", Icon: YouTubeIcon },
  { key: "whatsapp", href: BRAND.social.whatsapp, label: "WhatsApp", Icon: WhatsAppIcon },
] as const;

export default function FooterSocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIAL_LINKS.map(({ key, href, label, Icon }) => (
        <Link
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="footer-social-link flex h-10 w-10 items-center justify-center rounded-full border border-navy-200/80 bg-white text-navy-600 transition-all hover:border-gold-500/45 hover:bg-gold-500/10 hover:text-gold-600 dark:border-white/12 dark:bg-white/[0.04] dark:text-white/55 dark:hover:text-gold-300"
        >
          <Icon className="h-4 w-4" />
        </Link>
      ))}
    </div>
  );
}
