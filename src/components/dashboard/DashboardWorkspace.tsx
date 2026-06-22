"use client";

import { useState } from "react";
import type { SystemRole } from "@/lib/auth/types";
import DashboardPropertiesPanel from "@/components/dashboard/DashboardPropertiesPanel";
import TeamManagementPanel from "@/components/dashboard/TeamManagementPanel";

type DashboardTab = "properties" | "team";

interface DashboardWorkspaceProps {
  role: SystemRole;
  /** When true, hide team management even for admin/dev (agent dashboard route) */
  agentOnly?: boolean;
}

export default function DashboardWorkspace({ role, agentOnly = false }: DashboardWorkspaceProps) {
  const canManageTeam = !agentOnly && (role === "admin" || role === "dev");
  const [tab, setTab] = useState<DashboardTab>("properties");

  return (
    <>
      {canManageTeam && (
        <div className="mb-8 flex gap-2 border-b border-white/10">
          <TabButton active={tab === "properties"} onClick={() => setTab("properties")}>
            ניהול נכסים
          </TabButton>
          <TabButton active={tab === "team"} onClick={() => setTab("team")}>
            ניהול צוות
          </TabButton>
        </div>
      )}

      {tab === "properties" || !canManageTeam ? (
        <DashboardPropertiesPanel role={role} />
      ) : (
        <TeamManagementPanel />
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-gold-500 text-gold-400"
          : "border-transparent text-white/45 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}
