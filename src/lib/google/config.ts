/** Official Rehouse Israel data sources */
export const GOOGLE_SHEETS_ID =
  process.env.GOOGLE_SHEETS_ID ?? "1-5ucjjhZlFKzS6xhdJDiJZeYERlR3FpkUUkeAh9fm88";

export const GOOGLE_SHEETS_PROPERTIES_GID =
  process.env.GOOGLE_SHEETS_PROPERTIES_GID ?? "1128361858";

export const GOOGLE_SHEETS_AGENTS_GID =
  process.env.GOOGLE_SHEETS_AGENTS_GID ?? "";

export const GOOGLE_DRIVE_MEDIA_FOLDER_ID =
  process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID ?? "1kycNEfLyb07auk5KfKARZCaTyzfFkyF_";

export const GOOGLE_DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
] as const;
