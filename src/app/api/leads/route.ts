import { NextResponse } from "next/server";

export interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: string;
  propertyId?: string;
  listingType?: "buy" | "rent";
  city?: string;
  /** Extra fields for Dror / Make / n8n field mapping */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Lead intake endpoint — wire to Make/n8n/Dror automations via webhook forwarding.
 *
 * POST /api/leads
 * Body: LeadPayload
 *
 * Set LEADS_WEBHOOK_URL in Vercel to forward payloads to your automation.
 */
export async function POST(request: Request) {
  let body: LeadPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json(
      { error: "שם וטלפון הם שדות חובה" },
      { status: 400 }
    );
  }

  const lead = {
    ...body,
    name: body.name.trim(),
    phone: body.phone.trim(),
    email: body.email?.trim() ?? "",
    message: body.message?.trim() ?? "",
    source: body.source ?? "website",
    receivedAt: new Date().toISOString(),
  };

  const webhookUrl = process.env.LEADS_WEBHOOK_URL?.trim();

  if (webhookUrl) {
    try {
      const webhookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      if (!webhookRes.ok) {
        console.error("Lead webhook failed:", webhookRes.status, await webhookRes.text());
      }
    } catch (error) {
      console.error("Lead webhook error:", error);
    }
  }

  return NextResponse.json({
    success: true,
    leadId: `lead_${Date.now()}`,
    forwarded: Boolean(webhookUrl),
  });
}

export const dynamic = "force-dynamic";
