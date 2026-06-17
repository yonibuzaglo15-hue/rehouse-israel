"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import MeetingModal from "@/components/MeetingModal";
import { MOCK_AGENTS } from "@/lib/constants";
import type { Agent } from "@/lib/types";

export default function AgentSection() {
  const [meetingAgent, setMeetingAgent] = useState<Agent | null>(null);
  const featuredAgents = MOCK_AGENTS.slice(0, 4);

  return (
    <section className="relative border-t border-white/5 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 to-navy-900/40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-start"
        >
          <div>
            <span className="mb-3 inline-block text-xs font-medium tracking-widest text-gold-400 uppercase">
              הצוות שלנו
            </span>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              הכירו את <span className="gold-gradient-text">הסוכנים</span>
            </h2>
            <p className="mt-3 max-w-lg text-white/50">
              מומחי נדל״ן שילוו אתכם בכל שלב — עם ליווי אישי ומענה מהיר
            </p>
          </div>
          <Link
            href="/agents"
            className="luxury-btn-ghost mt-6 shrink-0 sm:mt-0"
          >
            <span>לכל הסוכנים</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredAgents.map((agent, i) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={i}
              onScheduleMeeting={setMeetingAgent}
            />
          ))}
        </div>
      </div>

      <MeetingModal agent={meetingAgent} onClose={() => setMeetingAgent(null)} />
    </section>
  );
}
