"use client";

import { useEffect, useMemo, useState } from "react";

type Client = {
  id: string;
  name: string;
  dateStarted: string;
  leads: number;
  costPerLead: number;
  dateLastContacted: string;
  createdAt: string;
  updatedAt: string;
};

type SortKey = "name" | "dateStarted" | "leads" | "costPerLead" | "dateLastContacted";
type SortDir = "asc" | "desc";

const today = () => new Date().toISOString().slice(0, 10);

function fmtDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMoney(n: number) {
  if (!n) return "$0.00";
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

const emptyForm = (): Omit<Client, "id" | "createdAt" | "updatedAt"> => ({
  name: "",
  dateStarted: today(),
  leads: 0,
  costPerLead: 0,
  dateLastContacted: "",
});

export default function Page() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dateStarted");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/clients", { cache: "no-store" });
      const data = await r.json();
      setClients(data.clients || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name,
      dateStarted: c.dateStarted,
      leads: c.leads,
      costPerLead: c.costPerLead,
      dateLastContacted: c.dateLastContacted,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const url = editing ? `/api/clients/${editing.id}` : "/api/clients";
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert(e.error || "Save failed");
        return;
      }
      setModalOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Client) {
    if (!confirm(`Delete "${c.name}"? This can't be undone.`)) return;
    await fetch(`/api/clients/${c.id}`, { method: "DELETE" });
    await load();
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = clients;
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
    const sorted = [...list].sort((a, b) => {
      let av: string | number = a[sortKey] as any;
      let bv: string | number = b[sortKey] as any;
      if (typeof av === "string" && typeof bv === "string") {
        av = av.toLowerCase(); bv = bv.toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [clients, search, sortKey, sortDir]);

  const stats = useMemo(() => {
    const totalLeads = clients.reduce((s, c) => s + (c.leads || 0), 0);
    const totalSpend = clients.reduce((s, c) => s + (c.leads || 0) * (c.costPerLead || 0), 0);
    const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    return { count: clients.length, totalLeads, totalSpend, avgCpl };
  }, [clients]);

  const sortIndicator = (k: SortKey) => {
    if (sortKey !== k) return null;
    return <span className="sort-indicator">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-mark">H</div>
          <div>
            <span className="brand-name">Client Tracker</span>
            <span className="brand-tag">harbourview</span>
          </div>
        </div>
        <button className="btn primary" onClick={openCreate}>＋ New client</button>
      </header>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Clients</div>
          <div className="stat-value">{stats.count}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total leads</div>
          <div className="stat-value accent">{stats.totalLeads}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total spend</div>
          <div className="stat-value">{fmtMoney(stats.totalSpend)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg CPL</div>
          <div className="stat-value">{fmtMoney(stats.avgCpl)}</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-title">
          Clients
          <span className="toolbar-count">{filtered.length}</span>
        </div>
        <div className="toolbar-actions">
          <div className="search">
            <span style={{ color: "var(--text-dim)" }}>⌕</span>
            <input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort("name")}>
                Name{sortIndicator("name")}
              </th>
              <th className="sortable" onClick={() => toggleSort("dateStarted")}>
                Date Started{sortIndicator("dateStarted")}
              </th>
              <th className="sortable" onClick={() => toggleSort("leads")}>
                Leads{sortIndicator("leads")}
              </th>
              <th className="sortable" onClick={() => toggleSort("costPerLead")}>
                Cost Per Lead{sortIndicator("costPerLead")}
              </th>
              <th className="sortable" onClick={() => toggleSort("dateLastContacted")}>
                Date Last Contacted{sortIndicator("dateLastContacted")}
              </th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty">
                    <div className="empty-title">Loading...</div>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty">
                    <div className="empty-title">
                      {search ? "No matches" : "No clients yet"}
                    </div>
                    <div className="empty-hint">
                      {search ? "Try a different search term" : "Click \"New client\" to add your first one"}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td className="cell-name">{c.name}</td>
                  <td className="cell-mono">{fmtDate(c.dateStarted)}</td>
                  <td className="cell-leads">{c.leads}</td>
                  <td className="cell-mono">{fmtMoney(c.costPerLead)}</td>
                  <td className="cell-mono">{fmtDate(c.dateLastContacted)}</td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn-icon" onClick={() => openEdit(c)} title="Edit">✎</button>
                      <button className="btn-icon" onClick={() => remove(c)} title="Delete">✕</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="footer">
        <div><span className="dot"></span>Local data store · /data/clients.json</div>
        <div>Harbourview · {new Date().getFullYear()}</div>
      </footer>

      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? "Edit client" : "New client"}</div>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Name</label>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Q9 Finance"
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Date Started</label>
                  <input
                    type="date"
                    value={form.dateStarted}
                    onChange={(e) => setForm({ ...form, dateStarted: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Date Last Contacted</label>
                  <input
                    type="date"
                    value={form.dateLastContacted}
                    onChange={(e) => setForm({ ...form, dateLastContacted: e.target.value })}
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Leads</label>
                  <input
                    type="number"
                    min={0}
                    value={form.leads}
                    onChange={(e) => setForm({ ...form, leads: Number(e.target.value) })}
                  />
                </div>
                <div className="field">
                  <label>Cost Per Lead (AUD)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.costPerLead}
                    onChange={(e) => setForm({ ...form, costPerLead: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn primary" onClick={save} disabled={saving || !form.name.trim()}>
                {saving ? "Saving..." : editing ? "Save changes" : "Create client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
