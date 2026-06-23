import type { Property } from "@/lib/types";
import type { Testimonial } from "@/lib/mock-data/testimonials";

const IMG = {
  ashdod: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  marina: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  newProject: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  ashkelon: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
} as const;

/** Curated hot properties for the landing-page visual preview */
export const LANDING_HOT_PROPERTIES: Property[] = [
  {
    id: "preview-ashdod-4br",
    title: "דירת 4 חדרים מרווחת — רובע י״א, אשדוד",
    description:
      "דירה משופצת עם מטבח פתוח, מרפסת שמש וממ״ד. קומה 8 עם נוף לים, חניה ומחסן. מיקום מרכזי ליד פארקים ובתי ספר.",
    listingType: "buy",
    city: "ashdod",
    neighborhood: "רובע י״א",
    price: 2_350_000,
    rooms: 4,
    area: 112,
    floor: 8,
    totalFloors: 14,
    mamad: true,
    balcony: true,
    parking: true,
    elevator: true,
    image: IMG.ashdod,
    featured: true,
    status: "active",
  },
  {
    id: "preview-marina-penthouse",
    title: "פנטהאוז יוקרתי במרינה אשדוד",
    description:
      "פנטהאוז דופלקס עם נוף פנורמי לים, מרפסת ענקית, מפרט פרימיום וחניה כפולה. אחד הנכסים המבוקשים באזור המרינה.",
    listingType: "buy",
    city: "ashdod",
    neighborhood: "מרינה",
    price: 5_900_000,
    rooms: 6,
    area: 210,
    floor: 18,
    totalFloors: 18,
    mamad: true,
    balcony: true,
    parking: true,
    elevator: true,
    image: IMG.marina,
    featured: true,
    status: "exclusive",
  },
  {
    id: "preview-new-tower",
    title: "פרויקט חדש — מגדלי הים, אשדוד",
    description:
      "דירת 5 חדרים בפרויקט יוקרה חדש על קו החוף. סטנדרט בנייה תל-אביבי, לובי מעוצב, בריכה וחדר כושר. הרשמה מוקדמת.",
    listingType: "buy",
    city: "ashdod",
    neighborhood: "רובע י״א",
    price: 3_450_000,
    rooms: 5,
    area: 138,
    floor: 22,
    totalFloors: 32,
    mamad: true,
    balcony: true,
    parking: true,
    elevator: true,
    image: IMG.newProject,
    featured: true,
    status: "active",
  },
  {
    id: "preview-ashkelon-rent",
    title: "דירת 3 חדרים מרוהטת — אגמים, אשקלון",
    description:
      "דירה מוארת ומרוהטת במלואה, במרחק הליכה מהים. מזגן בכל החדרים, מרפסת שמש וממ״ד. זמינה לכניסה מיידית.",
    listingType: "rent",
    city: "ashkelon",
    neighborhood: "אגמים",
    price: 7_200,
    rooms: 3,
    area: 88,
    floor: 6,
    totalFloors: 10,
    mamad: true,
    balcony: true,
    parking: false,
    elevator: true,
    image: IMG.ashkelon,
    featured: true,
    status: "active",
  },
];

/** Curated testimonials for the landing-page visual preview */
export const LANDING_TESTIMONIALS: Testimonial[] = [
  {
    id: "preview-t1",
    name: "דנה ואור כהן",
    role: "רוכשי דירה",
    city: "אשדוד",
    rating: 5,
    quote:
      "קנינו דירת 4 חדרים ברובע י״א דרך Rehouse Israel. הסוכנים היו זמינים בכל שעה, ליוו אותנו במשכנתא ובמשא ומתן — חוויה מקצועית ואישית מההתחלה ועד המסירה.",
    agentName: "שרון גולדשטיין",
  },
  {
    id: "preview-t2",
    name: "יוסי לוי",
    role: "משכיר דירה",
    city: "אשקלון",
    rating: 5,
    quote:
      "השכרנו את הדירה תוך שבועיים בלבד, במחיר מעולה ולשוכרים איכותיים. הצוות דאג לכל הפרטים — צילומים, פרסום וסינון פניות. ממליץ בחום!",
    agentName: "דיאנה",
  },
  {
    id: "preview-t3",
    name: "מיכל אברהם",
    role: "רוכשת דירה ראשונה",
    city: "יבנה",
    rating: 5,
    quote:
      "כרוכשת לראשונה הרגשתי שיש מי שמלווה אותי באמת. הסבירו כל שלב בפשטות, מצאו לי דירה ביבנה במחיר הוגן, ועזרו לי לסגור משכנתא בתנאים מצוינים.",
  },
];
