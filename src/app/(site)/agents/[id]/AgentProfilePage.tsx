"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";
import PropertyMediaHero, { PropertyMatterportEmbed } from "@/components/PropertyMediaHero";
import { AGENT_PLACEHOLDER } from "@/lib/images";
import type { Agent } from "@/lib/types";
import type { Property } from "@/lib/types";
import { formatPrice, getCityLabel } from "@/lib/constants";

interface AgentProfilePageProps {
  agent: Agent;
  properties: Property[];
}

export default function AgentProfilePage({ agent, properties }: AgentProfilePageProps) {
  const [imageSrc, setImageSrc] = useState(agent.image);

  return (
    <>
      <section className="pt-24 pb-12 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/agents"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-gold-400"
          >
            <ArrowRight className="h-4 w-4" />
            חזרה לצוות
          </Link>

          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-2xl p-6 text-center lg:sticky lg:top-24 lg:self-start"
            >
              <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border-2 border-gold-500/40">
                <Image
                  src={imageSrc}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  onError={() => {
                    if (imageSrc !== AGENT_PLACEHOLDER) {
                      setImageSrc(AGENT_PLACEHOLDER);
                    }
                  }}
                />
              </div>
              <h1 className="mt-5 font-display text-2xl font-bold text-white">{agent.name}</h1>
              <p className="mt-1 text-sm text-gold-400">{agent.title}</p>
              <p className="mt-1 text-xs text-white/45">{agent.specialization}</p>
              {agent.description && (
                <p className="mt-4 text-sm leading-relaxed text-white/60">{agent.description}</p>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {agent.whatsapp && (
                  <SocialButton
                    href={`https://wa.me/${agent.whatsapp}`}
                    label="WhatsApp"
                    icon={<MessageCircle className="h-4 w-4" />}
                  />
                )}
                {agent.instagram && (
                  <SocialButton
                    href={`https://instagram.com/${agent.instagram}`}
                    label="Instagram"
                    icon={<Instagram className="h-4 w-4" />}
                  />
                )}
                {agent.facebook && (
                  <SocialButton
                    href={`https://facebook.com/${agent.facebook}`}
                    label="Facebook"
                    icon={<Facebook className="h-4 w-4" />}
                  />
                )}
              </div>
            </motion.aside>

            <div>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">נכסים בלעדיים</h2>
                  <p className="mt-1 text-sm text-white/45">
                    {properties.length} נכסים בניהול {agent.name.split(" ")[0]}
                  </p>
                </div>
              </div>

              {properties.length > 0 ? (
                <div className="space-y-6">
                  {properties.map((property, i) => (
                    <motion.article
                      key={property.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-panel overflow-hidden rounded-2xl"
                    >
                      <div className="grid gap-0 md:grid-cols-2">
                        <PropertyMediaHero
                          property={property}
                          href={`/properties/${property.id}`}
                          className="rounded-none md:rounded-s-2xl"
                        />
                        <div className="flex flex-col justify-center p-6">
                          <Link href={`/properties/${property.id}`} className="group">
                            <h3 className="font-display text-xl font-semibold text-white group-hover:text-gold-300">
                              {property.title}
                            </h3>
                          </Link>
                          <div className="mt-2 flex items-center gap-1 text-sm text-white/50">
                            <MapPin className="h-3.5 w-3.5 text-gold-500/70" />
                            {getCityLabel(property.city)} · {property.neighborhood}
                          </div>
                          <p className="mt-3 font-display text-2xl font-bold text-gold-400">
                            {formatPrice(property.price, property.listingType)}
                          </p>
                          {property.matterportUrl && (
                            <div className="mt-4">
                              <PropertyMatterportEmbed url={property.matterportUrl} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-12 text-center text-white/45">
                  אין נכסים מפורסמים כרגע תחת סוכן זה.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SocialButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition-colors hover:border-gold-500/40 hover:text-gold-300"
    >
      {icon}
      {label}
    </a>
  );
}
