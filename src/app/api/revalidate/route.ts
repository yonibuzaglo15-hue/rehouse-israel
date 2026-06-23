import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  isValidRevalidationSecret,
  REVALIDATION_PATHS,
} from "@/lib/revalidation";

interface RevalidateBody {
  secret?: string;
  paths?: string[];
  tags?: string[];
}

/**
 * On-demand ISR revalidation for Make/n8n/Dror automations.
 *
 * POST /api/revalidate
 * Headers: x-revalidation-secret: <REVALIDATION_SECRET>
 * Body: { "paths": ["/", "/properties"], "tags": ["properties"] }
 *
 * Or query: ?secret=<REVALIDATION_SECRET>&path=/properties
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: RevalidateBody = {};

  try {
    body = await request.json();
  } catch {
    // query-string only is fine
  }

  const secret =
    request.headers.get("x-revalidation-secret") ??
    body.secret ??
    url.searchParams.get("secret");

  if (!isValidRevalidationSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pathParam = url.searchParams.get("path");
  const requestedPaths = body.paths ?? (pathParam ? [pathParam] : [...REVALIDATION_PATHS]);
  const tags = body.tags ?? ["properties", "catalog"];

  const revalidatedPaths: string[] = [];

  for (const path of requestedPaths) {
    if (!path.startsWith("/")) continue;
    revalidatePath(path);
    revalidatedPaths.push(path);
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({
    revalidated: true,
    paths: revalidatedPaths,
    tags,
    timestamp: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  return POST(request);
}

export const dynamic = "force-dynamic";
