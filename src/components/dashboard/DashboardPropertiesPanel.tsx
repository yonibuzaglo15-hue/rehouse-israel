"use client";

import { useState } from "react";
import type { SystemRole } from "@/lib/auth/types";
import { getPropertiesListTitle } from "@/lib/properties";
import PropertyIntakeForm from "./PropertyIntakeForm";
import PropertyList from "./PropertyList";

interface DashboardPropertiesPanelProps {
  role: SystemRole;
}

export default function DashboardPropertiesPanel({
  role,
}: DashboardPropertiesPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PropertyIntakeForm onSuccess={() => setRefreshKey((key) => key + 1)} />
      <PropertyList
        role={role}
        listTitle={getPropertiesListTitle(role)}
        refreshKey={refreshKey}
      />
    </>
  );
}
