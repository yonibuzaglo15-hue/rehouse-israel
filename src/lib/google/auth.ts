import "server-only";

import { readFileSync, existsSync } from "fs";
import { google } from "googleapis";
import { GOOGLE_DRIVE_SCOPES } from "./config";

function loadServiceAccountCredentials(): {
  client_email: string;
  private_key: string;
} {
  const jsonPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH?.trim();
  if (jsonPath && existsSync(jsonPath)) {
    const parsed = JSON.parse(readFileSync(jsonPath, "utf8")) as {
      client_email?: string;
      private_key?: string;
    };
    if (parsed.client_email && parsed.private_key) {
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, "\n"),
      };
    }
  }

  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    const parsed = JSON.parse(json) as {
      client_email?: string;
      private_key?: string;
    };
    if (parsed.client_email && parsed.private_key) {
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, "\n"),
      };
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  if (email && privateKey) {
    return {
      client_email: email,
      private_key: privateKey.replace(/\\n/g, "\n"),
    };
  }

  throw new Error(
    "חסרות הרשאות Google: הגדירו GOOGLE_SERVICE_ACCOUNT_JSON או GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
  );
}

export function hasGoogleServiceAccountCredentials(): boolean {
  try {
    loadServiceAccountCredentials();
    return true;
  } catch {
    return false;
  }
}

export function getGoogleAuth() {
  const credentials = loadServiceAccountCredentials();
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [...GOOGLE_DRIVE_SCOPES],
  });
}

export async function getSheetsClient() {
  const auth = getGoogleAuth();
  return google.sheets({ version: "v4", auth });
}

export async function getDriveClient() {
  const auth = getGoogleAuth();
  return google.drive({ version: "v3", auth });
}
