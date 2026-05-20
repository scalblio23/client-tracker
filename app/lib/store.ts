import fs from "fs/promises";
import path from "path";

export type Client = {
  id: string;
  name: string;
  dateStarted: string;        // ISO date (YYYY-MM-DD)
  leads: number;
  costPerLead: number;         // in dollars
  dateLastContacted: string;   // ISO date (YYYY-MM-DD), can be empty
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "clients.json");

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ clients: [] }, null, 2));
  }
}

export async function readClients(): Promise<Client[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.clients) ? parsed.clients : [];
  } catch {
    return [];
  }
}

export async function writeClients(clients: Client[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify({ clients }, null, 2));
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
