import type { Metadata } from "next";
import AgentsPage from "./AgentsPage";

export const metadata: Metadata = {
  title: "הסוכנים שלנו",
  description:
    "הכירו את צוות הסוכנים המקצועי של Rehouse Israel — מומחי נדל״ן באשדוד, אשקלון, יבנה וגן יבנה.",
  openGraph: {
    title: "הסוכנים שלנו | Rehouse Israel",
    description: "צוות מקצועי של מומחי נדל״ן לליווי אישי",
  },
};

export default function Page() {
  return <AgentsPage />;
}
