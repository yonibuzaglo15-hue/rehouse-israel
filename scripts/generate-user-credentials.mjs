/**
 * יוצר סיסמאות ראשוניות אקראיות, מצפין bcrypt (cost 12),
 * וכותב:
 *   - src/lib/auth/user-password-hashes.ts (מועלה ל-git — hashes בלבד)
 *   - data/initial-user-credentials.json (לא ב-git — סיסמאות גלויות להפצה פנימית)
 *
 * הרצה: npm run auth:generate-users
 */

import { randomBytes } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const USERS = [
  { id: "usr_yonatan_buzaglo", fullName: "יונתן בוזגלו", email: "yonatan.buzaglo@rehouse.co.il", role: "dev" },
  { id: "usr_igor_hanin", fullName: "איגור חנין", email: "igor.hanin@rehouse.co.il", role: "admin" },
  { id: "usr_alon_hanin", fullName: "אלון חנין", email: "alon.hanin@rehouse.co.il", role: "admin" },
  { id: "usr_elina_bayder", fullName: "אלינה ביידר", email: "elina.bayder@rehouse.co.il", role: "agent" },
  { id: "usr_yan_shindelman", fullName: "יאן שינדלמן", email: "yan.shindelman@rehouse.co.il", role: "agent" },
  { id: "usr_pavel_kachka", fullName: "פבל קצ׳קה", email: "pavel.kachka@rehouse.co.il", role: "agent" },
  { id: "usr_lena_shapira", fullName: "לנה שפירא", email: "lena.shapira@rehouse.co.il", role: "agent" },
  { id: "usr_mazal_benshitrit", fullName: "מזל בן שיטרית", email: "mazal.benshitrit@rehouse.co.il", role: "agent" },
  { id: "usr_rossen_kiselovich", fullName: "רוסן קיסלביץ׳", email: "rossen.kiselovich@rehouse.co.il", role: "agent" },
  { id: "usr_dennis_novitsky", fullName: "דניס נוביצקי", email: "dennis.novitsky@rehouse.co.il", role: "agent" },
  { id: "usr_nicole_liskovich", fullName: "ניקול ליסקוביץ׳", email: "nicole.liskovich@rehouse.co.il", role: "agent" },
  { id: "usr_yulia_lerman", fullName: "יוליה לרמן", email: "yulia.lerman@rehouse.co.il", role: "agent" },
  { id: "usr_lena_eivinder", fullName: "לנה אייבינדר", email: "lena.eivinder@rehouse.co.il", role: "agent" },
  { id: "usr_mark_arbel", fullName: "מארק ארבל", email: "mark.arbel@rehouse.co.il", role: "agent" },
  { id: "usr_yana_zerach", fullName: "יאנה זרח", email: "yana.zerach@rehouse.co.il", role: "agent" },
  { id: "usr_karen_keizner", fullName: "קרן קיזנר", email: "karen.keizner@rehouse.co.il", role: "agent" },
  { id: "usr_ilona_yasser", fullName: "אילונה יאסר", email: "ilona.yasser@rehouse.co.il", role: "agent" },
  { id: "usr_nava_kolgan", fullName: "נאווה קולגן", email: "nava.kolgan@rehouse.co.il", role: "agent" },
  { id: "usr_felix_sprincis", fullName: "פליקס שפרינצס", email: "felix.sprincis@rehouse.co.il", role: "agent" },
  { id: "usr_rut_shalo", fullName: "רות שלו", email: "rut.shalo@rehouse.co.il", role: "agent" },
  { id: "usr_tomer_g", fullName: "תומר ג", email: "tomer.g@rehouse.co.il", role: "agent" },
];

const BCRYPT_ROUNDS = 12;

function generatePassword() {
  const token = randomBytes(5).toString("base64url");
  return `Rh26!${token}`;
}

async function main() {
  const hashes = [];
  const credentials = [];

  for (const user of USERS) {
    const initialPassword = generatePassword();
    const passwordHash = await bcrypt.hash(initialPassword, BCRYPT_ROUNDS);
    hashes.push({ userId: user.id, passwordHash });
    credentials.push({
      ...user,
      username: user.email,
      initialPassword,
      mustChangeOnFirstLogin: true,
    });
  }

  const hashesPath = join(root, "src/lib/auth/user-password-hashes.ts");
  const hashesContent = `import type { UserCredentialRecord } from "./types";

/**
 * AUTO-GENERATED — אל תערוך ידנית.
 * הרץ: npm run auth:generate-users
 * bcrypt cost factor: ${BCRYPT_ROUNDS}
 */
export const USER_PASSWORD_HASHES: UserCredentialRecord[] = ${JSON.stringify(hashes, null, 2)};
`;
  writeFileSync(hashesPath, hashesContent, "utf8");

  const dataDir = join(root, "data");
  mkdirSync(dataDir, { recursive: true });
  const credentialsPath = join(dataDir, "initial-user-credentials.json");
  writeFileSync(
    credentialsPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note: "קובץ זה אינו נשמר ב-git. הפץ סיסמאות בערוץ מאובטח בלבד.",
        users: credentials,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Wrote ${hashes.length} password hashes → src/lib/auth/user-password-hashes.ts`);
  console.log(`Wrote plaintext credentials → data/initial-user-credentials.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
