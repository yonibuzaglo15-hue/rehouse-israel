export interface NewProject {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  description: string;
  priceFrom: number;
  roomsRange: string;
  deliveryDate: string;
  status: "presale" | "construction" | "ready";
  image: string;
}

export const NEW_PROJECTS: NewProject[] = [
  {
    id: "proj-1",
    name: "מגדלי הים — רובע י״א",
    city: "אשדוד",
    neighborhood: "רובע י״א",
    description: "פרויקט יוקרה על קו החוף עם נוף פנורמי לים, לובי מעוצב ומתקני ספורט.",
    priceFrom: 2_450_000,
    roomsRange: "3–5",
    deliveryDate: "2027",
    status: "presale",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  },
  {
    id: "proj-2",
    name: "פארק הדרים",
    city: "אשקלון",
    neighborhood: "שכונת אפרידר",
    description: "מתחם מגורים ירוק עם גינות משותפות, חדר כושר ומסחר בקרבת מרכז העיר.",
    priceFrom: 1_890_000,
    roomsRange: "4–5",
    deliveryDate: "2026",
    status: "construction",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  },
  {
    id: "proj-3",
    name: "שדרות הזהב",
    city: "יבנה",
    neighborhood: "מרכז העיר",
    description: "דירות חדשות במיקום מרכזי, קרוב לתחבורה ציבורית ולמרכזי קניות.",
    priceFrom: 1_650_000,
    roomsRange: "3–4",
    deliveryDate: "2026",
    status: "construction",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  },
  {
    id: "proj-4",
    name: "גני יבנה החדשה",
    city: "גן יבנה",
    neighborhood: "שכונה חדשה",
    description: "שכונה מתוכננת עם בתי ספר, פארקים ותשתיות מודרניות — איכות חיים בשכונה שקטה.",
    priceFrom: 1_750_000,
    roomsRange: "4–6",
    deliveryDate: "2028",
    status: "presale",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
];

export const PROJECT_STATUS_LABELS: Record<NewProject["status"], string> = {
  presale: "הרשמה מוקדמת",
  construction: "בבנייה",
  ready: "אכלוס מיידי",
};
