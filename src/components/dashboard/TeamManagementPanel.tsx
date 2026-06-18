"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save, Users } from "lucide-react";
import type { AgentProfile } from "@/lib/agents/types";

export default function TeamManagementPanel() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/team/agents");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "טעינה נכשלה");
      setAgents(data.agents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "טעינה נכשלה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const updateLocal = (id: string, patch: Partial<AgentProfile>) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const saveAgent = async (agent: AgentProfile) => {
    setSavingId(agent.id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/team/agents/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agent.name,
          title: agent.title,
          specialization: agent.specialization,
          description: agent.description,
          image: agent.image,
          phone: agent.phone,
          whatsapp: agent.whatsapp,
          instagram: agent.instagram,
          facebook: agent.facebook,
          telegram: agent.telegram,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שמירה נכשלה");
      setSuccess(`פרופיל ${agent.name} עודכן`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירה נכשלה");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/50">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <section className="dashboard-panel rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-5 w-5 text-gold-400" />
        <div>
          <h2 className="font-display text-xl font-semibold text-white">ניהול צוות</h2>
          <p className="text-sm text-white/45">עריכת פרופילים, קישורים חברתיים ותמונות סוכנים</p>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {success}
        </p>
      )}

      <div className="space-y-6">
        {agents.map((agent) => (
          <article
            key={agent.id}
            className="rounded-xl border border-white/10 bg-navy-900/50 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{agent.name}</h3>
                <p className="text-xs text-white/40">{agent.email}</p>
              </div>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase text-white/45">
                {agent.role}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="שם">
                <input
                  value={agent.name}
                  onChange={(e) => updateLocal(agent.id, { name: e.target.value })}
                  className="dashboard-input"
                />
              </Field>
              <Field label="תפקיד">
                <input
                  value={agent.title}
                  onChange={(e) => updateLocal(agent.id, { title: e.target.value })}
                  className="dashboard-input"
                />
              </Field>
              <Field label="התמחות">
                <input
                  value={agent.specialization}
                  onChange={(e) => updateLocal(agent.id, { specialization: e.target.value })}
                  className="dashboard-input"
                />
              </Field>
              <Field label="טלפון">
                <input
                  value={agent.phone}
                  onChange={(e) => updateLocal(agent.id, { phone: e.target.value })}
                  className="dashboard-input"
                />
              </Field>
              <Field label="WhatsApp (מספר בינ״ל)">
                <input
                  value={agent.whatsapp}
                  onChange={(e) => updateLocal(agent.id, { whatsapp: e.target.value })}
                  className="dashboard-input"
                />
              </Field>
              <Field label="Instagram (username)">
                <input
                  value={agent.instagram}
                  onChange={(e) => updateLocal(agent.id, { instagram: e.target.value })}
                  className="dashboard-input"
                />
              </Field>
              <Field label="Facebook (username)">
                <input
                  value={agent.facebook ?? ""}
                  onChange={(e) => updateLocal(agent.id, { facebook: e.target.value })}
                  className="dashboard-input"
                />
              </Field>
              <Field label="תמונת פרופיל (URL / נתיב)">
                <input
                  value={agent.image}
                  onChange={(e) => updateLocal(agent.id, { image: e.target.value })}
                  className="dashboard-input"
                  placeholder="/images/agents/slug.png"
                />
              </Field>
              <Field label="תיאור" className="sm:col-span-2">
                <textarea
                  value={agent.description ?? ""}
                  onChange={(e) => updateLocal(agent.id, { description: e.target.value })}
                  rows={3}
                  className="dashboard-input resize-y"
                />
              </Field>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={savingId === agent.id}
                onClick={() => saveAgent(agent)}
                className="inline-flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-500/15 px-4 py-2 text-sm text-gold-300 hover:bg-gold-500/25 disabled:opacity-50"
              >
                {savingId === agent.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                שמור פרופיל
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}
