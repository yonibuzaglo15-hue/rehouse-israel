"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Mail, Instagram, Calendar, Award } from "lucide-react";
import type { Agent } from "@/lib/types";
import { AGENT_PLACEHOLDER } from "@/lib/images";
import { WhatsAppIcon, TelegramIcon } from "@/components/icons/SocialIcons";

interface AgentCardProps {
  agent: Agent;
  index?: number;
  onScheduleMeeting: (agent: Agent) => void;
}

const CONTACT_LINKS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: WhatsAppIcon,
    getHref: (a: Agent) => `https://wa.me/${a.whatsapp}`,
    hoverClass: "hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/40",
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: TelegramIcon,
    getHref: (a: Agent) => `https://t.me/${a.telegram}`,
    hoverClass: "hover:bg-[#0088cc]/20 hover:text-[#0088cc] hover:border-[#0088cc]/40",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    getHref: (a: Agent) => `https://instagram.com/${a.instagram}`,
    hoverClass: "hover:bg-[#E4405F]/20 hover:text-[#E4405F] hover:border-[#E4405F]/40",
  },
  {
    key: "email",
    label: "Email",
    icon: Mail,
    getHref: (a: Agent) => `mailto:${a.email}`,
    hoverClass: "hover:bg-gold-500/20 hover:text-gold-400 hover:border-gold-500/40",
  },
  {
    key: "phone",
    label: "טלפון",
    icon: Phone,
    getHref: (a: Agent) => `tel:${a.phone}`,
    hoverClass: "hover:bg-gold-500/20 hover:text-gold-400 hover:border-gold-500/40",
  },
] as const;

export default function AgentCard({ agent, index = 0, onScheduleMeeting }: AgentCardProps) {
  const [imageSrc, setImageSrc] = useState(agent.image);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="glass-panel overflow-hidden rounded-2xl transition-all duration-500 group-hover:border-gold-500/30 group-hover:shadow-xl group-hover:shadow-gold-500/5">
        {/* Portrait */}
        <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[4/5]">
          <Image
            src={imageSrc}
            alt={agent.name}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => {
              if (imageSrc !== AGENT_PLACEHOLDER) {
                setImageSrc(AGENT_PLACEHOLDER);
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />

          {/* Specialization badge */}
          <div className="absolute start-4 top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-navy-950/80 px-3 py-1.5 text-xs font-medium text-gold-300 backdrop-blur-sm">
              <Award className="h-3 w-3" />
              {agent.specialization}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <Link href={`/agents/${agent.id}`}>
            <h3 className="font-display text-xl font-bold text-slate-900 transition-colors group-hover:text-gold-600 dark:text-white dark:group-hover:text-gold-300">
              {agent.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/50">{agent.title}</p>

          {/* Quick contact */}
          <div className="mt-5">
            <p className="mb-3 text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-white/40">
              יצירת קשר מהירה
            </p>
            <div className="flex flex-wrap gap-2">
              {CONTACT_LINKS.map(({ key, label, icon: Icon, getHref, hoverClass }) => (
                <a
                  key={key}
                  href={getHref(agent)}
                  target={key === "phone" || key === "email" ? undefined : "_blank"}
                  rel={key === "phone" || key === "email" ? undefined : "noopener noreferrer"}
                  aria-label={`${label} — ${agent.name}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-navy-200/80 bg-slate-50 text-navy-600 transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:text-white/60 ${hoverClass}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Schedule meeting CTA */}
          <button
            type="button"
            onClick={() => onScheduleMeeting(agent)}
            className="luxury-btn-primary mt-3 w-full text-sm"
          >
            <Calendar className="h-4 w-4" />
            קבעו פגישה
          </button>
          <Link
            href={`/agents/${agent.id}`}
            className="luxury-btn-ghost mt-2 block w-full py-2.5 text-center text-sm"
          >
            לפרופיל הסוכן
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
