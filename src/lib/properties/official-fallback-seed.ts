import type { CatalogProperty } from "./catalog-schema";
import { createEmptyCatalogProperty } from "./catalog-schema";
import { SYSTEM_USERS } from "@/lib/auth/users";

/** Official sheet rows (Rehouse Israel) — used when Google sync is unavailable */
interface OfficialSheetRow {
  externalId: string;
  city: "ashdod";
  rooms: number;
  floor?: string;
  street: string;
  mamad: boolean;
  balcony: boolean;
  storage: boolean;
  parking: boolean;
  price: number;
  agentName: string;
  agentPhone?: string;
  additionalAgentName?: string;
  additionalAgentPhone?: string;
  matterportUrl?: string;
  neighborhood?: string;
}

const OFFICIAL_SHEET_ROWS: OfficialSheetRow[] = [
  {
    externalId: "ash-001",
    city: "ashdod",
    rooms: 2,
    floor: "3/9",
    street: "וולפסון 2",
    mamad: true,
    balcony: true,
    storage: false,
    parking: true,
    price: 1_720_000,
    agentName: "ילנה שפירא",
    agentPhone: "054-4654528",
    neighborhood: "רובע י׳",
  },
  {
    externalId: "ash-002",
    city: "ashdod",
    rooms: 2,
    floor: "4/8",
    street: 'קדושי בלזן 1',
    mamad: true,
    balcony: true,
    storage: false,
    parking: false,
    price: 1_450_000,
    agentName: "סטס",
    agentPhone: "054-7683600",
    neighborhood: "רובע א׳",
  },
  {
    externalId: "ash-003",
    city: "ashdod",
    rooms: 2,
    street: "מרטין בובר 1",
    mamad: false,
    balcony: false,
    storage: false,
    parking: false,
    price: 1_290_000,
    agentName: "סטס",
    agentPhone: "054-7683600",
    neighborhood: "רובע י״ג",
  },
  {
    externalId: "ash-004",
    city: "ashdod",
    rooms: 2.5,
    street: "ההגנה 6",
    mamad: false,
    balcony: false,
    storage: false,
    parking: false,
    price: 1_380_000,
    agentName: "סטס",
    agentPhone: "054-7683600",
    neighborhood: "רובע ט׳",
  },
  {
    externalId: "ash-005",
    city: "ashdod",
    rooms: 2.5,
    floor: "1/3",
    street: 'רמב"ם 8',
    mamad: false,
    balcony: false,
    storage: false,
    parking: false,
    price: 1_380_000,
    agentName: "סטס",
    agentPhone: "054-7683600",
    neighborhood: "רובע י״א",
  },
  {
    externalId: "ash-006",
    city: "ashdod",
    rooms: 2,
    floor: "6/12",
    street: "הטיילת 5",
    mamad: false,
    balcony: true,
    storage: false,
    parking: false,
    price: 1_300_000,
    agentName: "יאן",
    agentPhone: "052-2895437",
    neighborhood: "רובע א׳",
  },
  {
    externalId: "ash-007",
    city: "ashdod",
    rooms: 2,
    floor: "4/4",
    street: "חטיבת גולני 7",
    mamad: false,
    balcony: false,
    storage: false,
    parking: false,
    price: 1_200_000,
    agentName: "רומה משמן",
    agentPhone: "052-4704325",
    neighborhood: "רובע ג׳",
  },
  {
    externalId: "ash-008",
    city: "ashdod",
    rooms: 2.5,
    floor: "4/4",
    street: "הרב הרצוג 3",
    mamad: false,
    balcony: false,
    storage: false,
    parking: false,
    price: 1_200_000,
    agentName: "אלי מסלה",
    agentPhone: "054-5977978",
    neighborhood: "רובע י״ב",
  },
  {
    externalId: "ash-009",
    city: "ashdod",
    rooms: 3,
    floor: "7/7",
    street: "המעפילים 5",
    mamad: false,
    balcony: true,
    storage: false,
    parking: false,
    price: 1_730_000,
    agentName: "יונתן בוזגלו",
    agentPhone: "054-7740176",
    additionalAgentName: "גארי",
    additionalAgentPhone: "052-4178830",
    neighborhood: "רובע י׳",
  },
  {
    externalId: "ash-010",
    city: "ashdod",
    rooms: 3.5,
    floor: "3/4",
    street: "הרב קוק",
    mamad: false,
    balcony: false,
    storage: false,
    parking: false,
    price: 1_420_000,
    agentName: "אנטה",
    agentPhone: "",
    neighborhood: "רובע י״א",
  },
];

function parseStreetAddress(raw: string): { street: string; houseNumber: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.+?)\s+(\d+[\w/-]*)$/);
  if (!match) {
    return { street: trimmed, houseNumber: "" };
  }
  return { street: match[1].trim(), houseNumber: match[2].trim() };
}

function parseFloor(raw?: string): { floor: number; totalFloors: number } {
  if (!raw?.trim()) return { floor: 0, totalFloors: 1 };
  const [floorPart, totalPart] = raw.split("/").map((part) => part.trim());
  const floor = Number(floorPart);
  const totalFloors = Number(totalPart);
  return {
    floor: Number.isFinite(floor) ? floor : 0,
    totalFloors: Number.isFinite(totalFloors) && totalFloors > 0 ? totalFloors : 1,
  };
}

function resolveAgent(agentName: string): {
  agentId: string;
  agentEmail: string;
  agentName: string;
} {
  const name = agentName.trim();
  const byFullName = SYSTEM_USERS.find(
    (user) => user.fullName === name || user.fullName.includes(name) || name.includes(user.fullName)
  );
  if (byFullName) {
    return {
      agentId: byFullName.id,
      agentEmail: byFullName.email,
      agentName: byFullName.fullName,
    };
  }

  const aliasMap: Record<string, string> = {
    יאן: "usr_yan_shindelman",
    ילנה: "usr_lena_shapira",
    יונתן: "usr_yonatan_buzaglo",
  };

  for (const [alias, userId] of Object.entries(aliasMap)) {
    if (name.includes(alias)) {
      const user = SYSTEM_USERS.find((entry) => entry.id === userId);
      if (user) {
        return { agentId: user.id, agentEmail: user.email, agentName: user.fullName };
      }
    }
  }

  return { agentId: "", agentEmail: "", agentName: name };
}

function estimateArea(rooms: number): number {
  if (rooms <= 2) return 65;
  if (rooms <= 2.5) return 78;
  if (rooms <= 3) return 92;
  if (rooms <= 3.5) return 105;
  return 120;
}

export function buildOfficialFallbackCatalogProperties(): CatalogProperty[] {
  const now = new Date().toISOString();

  return OFFICIAL_SHEET_ROWS.map((row, index) => {
    const { street, houseNumber } = parseStreetAddress(row.street);
    const { floor, totalFloors } = parseFloor(row.floor);
    const neighborhood = row.neighborhood ?? "אשדוד";
    const agent = resolveAgent(row.agentName);

    return createEmptyCatalogProperty({
      id: `prop_official_${String(index + 1).padStart(2, "0")}`,
      externalId: row.externalId,
      sourceSheet: "official-fallback-csv",
      title: `דירת ${row.rooms} חדרים — ${row.street}`,
      description: `נכס למכירה באשדוד, ${row.street}. ${row.rooms} חדרים${row.floor ? `, קומה ${row.floor}` : ""}.`,
      listingType: "buy",
      city: row.city,
      neighborhood,
      price: row.price,
      rooms: row.rooms,
      area: estimateArea(row.rooms),
      floor,
      totalFloors,
      mamad: row.mamad,
      balcony: row.balcony,
      parking: row.parking,
      storage: row.storage,
      elevator: totalFloors > 1,
      street,
      houseNumber,
      media: {
        images: [],
        videoUrl: "",
        matterportUrl: row.matterportUrl ?? "",
      },
      featured: index < 3,
      status: "active",
      published: true,
      agentId: agent.agentId,
      agentEmail: agent.agentEmail,
      agentName: agent.agentName,
      attributes: {
        agentPhone: row.agentPhone ?? null,
        ...(row.additionalAgentName
          ? {
              additionalAgentName: row.additionalAgentName,
              additionalAgentPhone: row.additionalAgentPhone ?? null,
            }
          : {}),
        sheetCity: "אשדוד",
      },
      recruitedAt: now,
      updatedAt: now,
    });
  });
}

export { OFFICIAL_SHEET_ROWS };
