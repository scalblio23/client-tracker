import { NextRequest, NextResponse } from "next/server";
import { readClients, writeClients, newId, Client } from "@/app/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const clients = await readClients();
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const now = new Date().toISOString();
  const client: Client = {
    id: newId(),
    name: String(body.name || "").trim(),
    dateStarted: String(body.dateStarted || "").trim(),
    leads: Number(body.leads) || 0,
    costPerLead: Number(body.costPerLead) || 0,
    dateLastContacted: String(body.dateLastContacted || "").trim(),
    createdAt: now,
    updatedAt: now,
  };
  if (!client.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const clients = await readClients();
  clients.push(client);
  await writeClients(clients);
  return NextResponse.json({ client });
}
