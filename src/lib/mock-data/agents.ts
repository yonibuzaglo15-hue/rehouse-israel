import type { Agent } from "@/lib/types";
import { agentImage } from "@/lib/images";

export const MOCK_AGENTS: Agent[] = [
  {
    id: "1",
    name: "אלין סמירנוב",
    title: "סוכנת נדל״ן בכירה | Rehouse Israel",
    specialization: "מומחית נדל״ן אשדוד והסביבה",
    image: agentImage("elin"),
    phone: "0501234567",
    email: "elin@rehouse.co.il",
    whatsapp: "972501234567",
    telegram: "elinsmirnov",
    instagram: "elin_rehouse",
    calendarUrl: "https://calendly.com",
  },
  {
    id: "2",
    name: "דני כהן",
    title: "סוכן בכיר | מנהל מחלקת מכירות",
    specialization: "מומחה נדל״ן אשדוד",
    image: agentImage("danny"),
    phone: "0501234568",
    email: "danny@rehouse.co.il",
    whatsapp: "972501234568",
    telegram: "dannycohen",
    instagram: "danny_rehouse",
    calendarUrl: "https://calendly.com",
  },
  {
    id: "3",
    name: "מיכל לוי",
    title: "יועצת נדל״ן | השכרות פרימיום",
    specialization: "מומחית נדל״ן אשקלון",
    image: agentImage("michal"),
    phone: "0509876543",
    email: "michal@rehouse.co.il",
    whatsapp: "972509876543",
    telegram: "michallevy",
    instagram: "michal_rehouse",
    calendarUrl: "https://calendly.com",
  },
  {
    id: "4",
    name: "יוסי אברהם",
    title: "סוכן נדל״ן | פרויקטים חדשים",
    specialization: "מומחה נדל״ן יבנה וגן יבנה",
    image: agentImage("yossi"),
    phone: "0527654321",
    email: "yossi@rehouse.co.il",
    whatsapp: "972527654321",
    telegram: "yossiabraham",
    instagram: "yossi_rehouse",
    calendarUrl: "https://calendly.com",
  },
  {
    id: "5",
    name: "נועה שפירא",
    title: "יועצת השקעות נדל״ן",
    specialization: "מומחית נכסי יוקרה",
    image: agentImage("noa"),
    phone: "0543219876",
    email: "noa@rehouse.co.il",
    whatsapp: "972543219876",
    telegram: "noashapira",
    instagram: "noa_rehouse",
    calendarUrl: "https://calendly.com",
  },
];

export function getAgentById(id: string): Agent | undefined {
  return MOCK_AGENTS.find((a) => a.id === id);
}
