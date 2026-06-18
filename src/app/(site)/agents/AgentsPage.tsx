"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Clock, Star } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import MeetingModal from "@/components/MeetingModal";
import PageHero from "@/components/PageHero";
import { MOCK_AGENTS } from "@/lib/constants";
import type { Agent } from "@/lib/types";

const TRUST_SIGNALS = [
  { icon: Users, label: "ליווי אישי", desc: "סוכן ייעודי לכל לקוח" },
  { icon: Shield, label: "אמינות מוכחת", desc: "15+ שנות ניסיון בשוק" },
  { icon: Clock, label: "זמינות 24/7", desc: "מענה מהיר בכל ערוץ" },
  { icon: Star, label: "98% שביעות רצון", desc: "לקוחות ממליצים" },
];

interface AgentsPageProps {
  initialAgents?: Agent[];
}

export default function AgentsPage({ initialAgents }: AgentsPageProps) {
  const [meetingAgent, setMeetingAgent] = useState<Agent | null>(null);
  const agents = initialAgents?.length ? initialAgents : MOCK_AGENTS;

  return (
    <>
      <PageHero
        badge="הצוות שלנו"
        title={
          <>
            הסוכנים <span className="gold-gradient-text">של Rehouse</span>
          </>
        }
        subtitle="צוות מקצועי של מומחי נדל״ן שילוו אתכם בכל שלב — משיחת היכרות ועד מסירת המפתחות"
      />

      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {TRUST_SIGNALS.map((signal) => (
              <div key={signal.label} className="glass-panel rounded-xl p-4 text-center sm:p-5">
                <signal.icon className="mx-auto mb-2 h-5 w-5 text-gold-400" />
                <div className="text-sm font-semibold text-white">{signal.label}</div>
                <div className="mt-1 text-xs text-white/40">{signal.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {agents.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={i}
                onScheduleMeeting={setMeetingAgent}
              />
            ))}
          </div>
        </div>
      </section>

      <MeetingModal agent={meetingAgent} onClose={() => setMeetingAgent(null)} />
    </>
  );
}
