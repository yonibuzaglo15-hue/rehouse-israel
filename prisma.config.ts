import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig, env } from "prisma/config";

// Next.js uses .env.local; Prisma CLI loads it here for migrate/db commands.
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Prisma 7: CLI uses direct (session) connection — not the pooled URL.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
