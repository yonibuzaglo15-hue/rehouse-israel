import type { SystemUser } from "./types";

/**
 * רשימת משתמשי המערכת הראשונית — Rehouse Israel
 * שם משתמש = כתובת אימייל ארגונית @rehouse.co.il
 */
export const SYSTEM_USERS: SystemUser[] = [
  {
    id: "usr_yonatan_buzaglo",
    fullName: "יונתן בוזגלו",
    email: "yonatan.buzaglo@rehouse.co.il",
    username: "yonatan.buzaglo@rehouse.co.il",
    role: "dev",
  },
  {
    id: "usr_igor_hanin",
    fullName: "איגור חנין",
    email: "igor.hanin@rehouse.co.il",
    username: "igor.hanin@rehouse.co.il",
    role: "admin",
  },
  {
    id: "usr_alon_hanin",
    fullName: "אלון חנין",
    email: "alon.hanin@rehouse.co.il",
    username: "alon.hanin@rehouse.co.il",
    role: "admin",
  },
  {
    id: "usr_elina_bayder",
    fullName: "אלינה ביידר",
    email: "elina.bayder@rehouse.co.il",
    username: "elina.bayder@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_yan_shindelman",
    fullName: "יאן שינדלמן",
    email: "yan.shindelman@rehouse.co.il",
    username: "yan.shindelman@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_pavel_kachka",
    fullName: "פבל קצ׳קה",
    email: "pavel.kachka@rehouse.co.il",
    username: "pavel.kachka@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_lena_shapira",
    fullName: "לנה שפירא",
    email: "lena.shapira@rehouse.co.il",
    username: "lena.shapira@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_mazal_benshitrit",
    fullName: "מזל בן שיטרית",
    email: "mazal.benshitrit@rehouse.co.il",
    username: "mazal.benshitrit@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_rossen_kiselovich",
    fullName: "רוסן קיסלביץ׳",
    email: "rossen.kiselovich@rehouse.co.il",
    username: "rossen.kiselovich@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_dennis_novitsky",
    fullName: "דניס נוביצקי",
    email: "dennis.novitsky@rehouse.co.il",
    username: "dennis.novitsky@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_nicole_liskovich",
    fullName: "ניקול ליסקוביץ׳",
    email: "nicole.liskovich@rehouse.co.il",
    username: "nicole.liskovich@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_yulia_lerman",
    fullName: "יוליה לרמן",
    email: "yulia.lerman@rehouse.co.il",
    username: "yulia.lerman@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_lena_eivinder",
    fullName: "לנה אייבינדר",
    email: "lena.eivinder@rehouse.co.il",
    username: "lena.eivinder@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_mark_arbel",
    fullName: "מארק ארבל",
    email: "mark.arbel@rehouse.co.il",
    username: "mark.arbel@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_yana_zerach",
    fullName: "יאנה זרח",
    email: "yana.zerach@rehouse.co.il",
    username: "yana.zerach@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_karen_keizner",
    fullName: "קרן קיזנר",
    email: "karen.keizner@rehouse.co.il",
    username: "karen.keizner@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_ilona_yasser",
    fullName: "אילונה יאסר",
    email: "ilona.yasser@rehouse.co.il",
    username: "ilona.yasser@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_nava_kolgan",
    fullName: "נאווה קולגן",
    email: "nava.kolgan@rehouse.co.il",
    username: "nava.kolgan@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_felix_sprincis",
    fullName: "פליקס שפרינצס",
    email: "felix.sprincis@rehouse.co.il",
    username: "felix.sprincis@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_rut_shalo",
    fullName: "רות שלו",
    email: "rut.shalo@rehouse.co.il",
    username: "rut.shalo@rehouse.co.il",
    role: "agent",
  },
  {
    id: "usr_tomer_g",
    fullName: "תומר ג",
    email: "tomer.g@rehouse.co.il",
    username: "tomer.g@rehouse.co.il",
    role: "agent",
  },
];

export function getUserByEmail(email: string): SystemUser | undefined {
  const normalized = email.trim().toLowerCase();
  return SYSTEM_USERS.find((user) => user.email.toLowerCase() === normalized);
}

export function getUserById(id: string): SystemUser | undefined {
  return SYSTEM_USERS.find((user) => user.id === id);
}

export function getUsersByRole(role: SystemUser["role"]): SystemUser[] {
  return SYSTEM_USERS.filter((user) => user.role === role);
}
