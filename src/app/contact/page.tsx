import type { Metadata } from "next";
import ContactPage from "./ContactPage";

export const metadata: Metadata = {
  title: "צור קשר",
  description: "צרו קשר עם Rehouse Israel — נשמח ללוות אתכם במציאת הנכס המושלם.",
};

export default function Page() {
  return <ContactPage />;
}
