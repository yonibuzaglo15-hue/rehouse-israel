"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Clock, Star } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import MeetingModal from "@/components/MeetingModal";
import PageHero from "@/components/PageHero";
import { MOCK_AGENTS, CORE_TEAM_AGENTS } from "@/lib/constants";
import type { Agent } from "@/lib/types";

const TRUST_SIGNALS = [
  { icon: Users, label: "ליווי אישי", desc: "סוכן ייעודי לכל לקוח" },
  { icon: Shield, label: "אמינות מוכחת", desc: "15+ שנות ניסיון בשוק" },
  { icon: Clock, label: "זמינות 24/7", desc: "מענה מהיר בכל ערוץ" },
  { icon: Star, label: "98% שביעות רצון", desc: "לקוחות ממליצים" },
];

interface AgentsPageProps {
  initialAgents?: Agent[];
  companyOwners?: Agent[];
  seniorConsultants?: Agent[];
}

export default function AgentsPage({
  initialAgents,
  companyOwners = [],
}: AgentsPageProps) {
  const [meetingAgent, setMeetingAgent] = useState<Agent | null>(null);
  const agents = initialAgents?.length ? initialAgents : MOCK_AGENTS;
  const owners = companyOwners.length
    ? companyOwners
    : CORE_TEAM_AGENTS;

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

      {owners.length > 0 && (
        <section className="pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center sm:text-start">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                הנהלת <span className="gold-gradient-text">החברה</span>
              </h2>
              <p className="mt-2 text-sm text-white/50">
                יונתן בוזגלו, איגור חנין ואלון חנין — מובילים את Rehouse Israel
              </p>
            </div>
            <div className="mx-auto grid max-w-md gap-6 sm:max-w-none sm:grid-cols-2 lg:max-w-5xl lg:grid-cols-3">
              {owners.map((owner, i) => (
                <AgentCard
                  key={owner.id}
                  agent={owner}
                  index={i}
                  onScheduleMeeting={setMeetingAgent}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {(owners.length > 0) && (
            <div className="mb-8 text-center sm:text-start">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                צוות <span className="gold-gradient-text">הסוכנים</span>
              </h2>
              <p className="mt-2 text-sm text-white/50">
                מומחי נדל״ן שילוו אתכם בכל שלב בדרך לבית החדש
              </p>
            </div>
          )}
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
