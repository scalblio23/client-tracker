import { NextRequest, NextResponse } from "next/server";
import { readClients, writeClients } from "@/app/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const clients = await readClients();
  const idx = clients.findIndex((c) => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const current = clients[idx];
  clients[idx] = {
    ...current,
    name: body.name !== undefined ? String(body.name).trim() : current.name,
    dateStarted: body.dateStarted !== undefined ? String(body.dateStarted).trim() : current.dateStarted,
    leads: body.leads !== undefined ? Number(body.leads) || 0 : current.leads,
    costPerLead: body.costPerLead !== undefined ? Number(body.costPerLead) || 0 : current.costPerLead,
    dateLastContacted: body.dateLastContacted !== undefined ? String(body.dateLastContacted).trim() : current.dateLastContacted,
    updatedAt: new Date().toISOString(),
  };
  await writeClients(clients);
  return NextResponse.json({ client: clients[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const clients = await readClients();
  const filtered = clients.filter((c) => c.id !== params.id);
  if (filtered.length === clients.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writeClients(filtered);
  return NextResponse.json({ ok: true });
}
