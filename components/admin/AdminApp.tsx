"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { AdminContent, Promo, Review, ReviewStatus, SiteSettings } from "@/lib/types";

type Props = {
  authed: boolean;
  configured: boolean;
  initial: AdminContent | null;
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  published: "Tampil",
  pending: "Menunggu",
  hidden: "Disembunyikan",
};

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function Stars({ value }: { value: number }) {
  return (
    <span style={{ color: "var(--brass)", fontSize: "0.8rem", letterSpacing: "1px" }} aria-label={`${value} dari 5`}>
      {"★".repeat(value)}
      <span style={{ opacity: 0.22 }}>{"★".repeat(5 - value)}</span>
    </span>
  );
}

async function request(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json", "x-yrb-admin": "1" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(json.error || "Gagal menyimpan.");
  return json;
}

export default function AdminApp({ authed, configured, initial }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"dashboard" | "reviews" | "promos">("dashboard");
  const [reviews, setReviews] = useState<Review[]>(initial?.reviews ?? []);
  const [promos, setPromos] = useState<Promo[]>(initial?.promos ?? []);
  const [settings, setSettings] = useState<SiteSettings>(
    initial?.settings ?? {
      waNumber: "",
      phoneDisplay: "",
      email: "",
      farmAddress: "",
      officeAddress: "",
      announcement: "",
    },
  );
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!initial) return;
    setReviews(initial.reviews);
    setPromos(initial.promos);
    setSettings(initial.settings);
  }, [initial]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const notify = (kind: "ok" | "err", text: string) => setToast({ kind, text });

  if (!authed) {
    return <Login configured={configured} />;
  }

  const pending = reviews.filter((r) => r.status === "pending").length;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", headers: { "x-yrb-admin": "1" } });
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-rail">
        <a className="admin-brand" href="/" aria-label="Berkah Rizki Bersama Farm">
          <img className="admin-logo" src="/images/logo-berkah.png" alt="" width={760} height={493} />
          <span>
            Berkah Rizki Bersama
            <small>Panel admin</small>
          </span>
        </a>

        <nav className="admin-tabs" aria-label="Menu admin">
          <button className="admin-tab" data-active={tab === "dashboard"} onClick={() => setTab("dashboard")} type="button">
            Dasbor
          </button>
          <button className="admin-tab" data-active={tab === "reviews"} onClick={() => setTab("reviews")} type="button">
            Ulasan
            {pending ? <small>{pending}</small> : null}
          </button>
          <button className="admin-tab" data-active={tab === "promos"} onClick={() => setTab("promos")} type="button">
            Promo
          </button>
        </nav>

        <div className="admin-rail-foot">
          <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Lihat situs">
            <span aria-hidden="true">↗</span>
            <span className="rail-label">Lihat situs</span>
          </a>
          <button type="button" onClick={logout} aria-label="Keluar">
            <span aria-hidden="true">⏻</span>
            <span className="rail-label">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {!initial?.connected ? (
          <div className="notice">
            <div>
              <strong>Database belum terhubung.</strong> Panel bisa dibuka, tetapi perubahan belum tersimpan.
              Hubungkan Google Sheets lewat Apps Script, lalu set <code>SHEET_API_URL</code> dan{" "}
              <code>SHEET_API_TOKEN</code> di Vercel.
            </div>
          </div>
        ) : null}

        {tab === "dashboard" ? (
          <DashboardPanel
            settings={settings}
            onChange={setSettings}
            notify={notify}
            refresh={() => router.refresh()}
            reviews={reviews}
            promos={promos}
            connected={Boolean(initial?.connected)}
          />
        ) : null}

        {tab === "reviews" ? (
          <ReviewsPanel reviews={reviews} onChange={setReviews} notify={notify} refresh={() => router.refresh()} />
        ) : null}

        {tab === "promos" ? (
          <PromosPanel promos={promos} onChange={setPromos} notify={notify} refresh={() => router.refresh()} />
        ) : null}
      </main>

      {toast ? (
        <div className="toast" data-kind={toast.kind} role="status">
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- login ---------------- */

function Login({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") || "");
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setOk(true);
        setMessage("Berhasil masuk. Memuat panel…");
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (data.error === "not_configured") {
        setMessage("Admin belum aktif. Set ADMIN_PASSWORD di Vercel lalu redeploy.");
      } else if (data.error === "too_many") {
        const retry = res.headers.get("retry-after");
        setMessage(`Terlalu banyak percobaan. Coba lagi dalam ${retry ? Math.ceil(Number(retry) / 60) : 10} menit.`);
      } else {
        setMessage("Password salah.");
      }
    } catch {
      setMessage("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <div className="login-card">
        <img className="login-logo" src="/images/logo-berkah.png" alt="Berkah Rizki Bersama Farm" width={760} height={493} />
        <h1>Masuk admin</h1>
        <p>Kelola ulasan, promo, dan kontak yang tampil di situs.</p>

        {!configured ? (
          <div className="notice" style={{ marginTop: "1rem", marginBottom: 0 }}>
            <div>
              Password admin belum diatur di server. Tambahkan <code>ADMIN_PASSWORD</code> di Vercel →
              Settings → Environment Variables, lalu redeploy.
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={busy || !configured}
            />
          </div>
          <button className="btn" type="submit" disabled={busy || !configured}>
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
        </form>

        <p className="login-msg" data-kind={ok ? "ok" : undefined} aria-live="polite">
          {message}
        </p>
        <a className="login-back" href="/">
          ← Kembali ke situs
        </a>
      </div>
    </main>
  );
}

/* ---------------- reviews ---------------- */

function ReviewsPanel({
  reviews,
  onChange,
  notify,
  refresh,
}: {
  reviews: Review[];
  onChange: (next: Review[]) => void;
  notify: (kind: "ok" | "err", text: string) => void;
  refresh: () => void;
}) {
  const [filter, setFilter] = useState<"all" | ReviewStatus>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(
    () => ({
      all: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      published: reviews.filter((r) => r.status === "published").length,
      hidden: reviews.filter((r) => r.status === "hidden").length,
    }),
    [reviews],
  );

  const visible = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  async function save(review: Review, patch: Partial<Review>, successText: string) {
    setBusy(true);
    try {
      await request(`/api/admin/reviews/${review.id}`, "PATCH", { ...review, ...patch });
      onChange(reviews.map((r) => (r.id === review.id ? { ...r, ...patch } : r)));
      notify("ok", successText);
      setEditingId(null);
      refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(review: Review) {
    if (!window.confirm(`Hapus ulasan dari ${review.name}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    try {
      await request(`/api/admin/reviews/${review.id}`, "DELETE");
      onChange(reviews.filter((r) => r.id !== review.id));
      notify("ok", "Ulasan dihapus.");
      refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function create(data: { name: string; city: string; rating: number; message: string; status: ReviewStatus }) {
    setBusy(true);
    try {
      const res = (await request("/api/admin/reviews", "POST", data)) as { review?: Review };
      if (res.review) onChange([res.review, ...reviews]);
      notify("ok", "Ulasan ditambahkan.");
      setCreating(false);
      refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="admin-eyebrow">Ulasan</p>
          <h1>Ulasan pelanggan</h1>
          <p>
            {counts.pending} menunggu · {counts.published} tampil di situs
          </p>
        </div>
        <button className="mini-btn mini-btn--primary" type="button" onClick={() => setCreating((v) => !v)}>
          {creating ? "Tutup form" : "+ Tambah ulasan"}
        </button>
      </div>

      {creating ? (
        <ReviewEditor
          initial={null}
          busy={busy}
          onCancel={() => setCreating(false)}
          onSave={(data) => create(data)}
          submitLabel="Simpan ulasan"
        />
      ) : null}

      <div className="admin-toolbar" style={{ marginTop: "1rem" }}>
        {(
          [
            ["all", `Semua ${counts.all}`],
            ["pending", `Menunggu ${counts.pending}`],
            ["published", `Tampil ${counts.published}`],
            ["hidden", `Disembunyikan ${counts.hidden}`],
          ] as const
        ).map(([key, label]) => (
          <button key={key} className="filter" data-on={filter === key} type="button" onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="admin-list">
        {visible.length === 0 ? <p className="admin-empty">Belum ada ulasan di bagian ini.</p> : null}

        {visible.map((review) => (
          <article className="admin-row" key={review.id}>
            <div className="admin-row-head">
              <div>
                <h3>
                  {review.name} <Stars value={review.rating} />
                </h3>
                <div className="admin-meta">
                  <span>{review.city}</span>
                  <span>·</span>
                  <span>{formatDate(review.createdAt)}</span>
                  <span className={`chip chip--${review.status}`}>{STATUS_LABEL[review.status]}</span>
                </div>
              </div>
            </div>

            <p>{review.message}</p>

            <div className="admin-actions">
              {review.status !== "published" ? (
                <button
                  className="mini-btn"
                  type="button"
                  disabled={busy}
                  onClick={() => save(review, { status: "published" }, "Ulasan diterbitkan.")}
                >
                  Terbitkan
                </button>
              ) : (
                <button
                  className="mini-btn"
                  type="button"
                  disabled={busy}
                  onClick={() => save(review, { status: "hidden" }, "Ulasan disembunyikan.")}
                >
                  Sembunyikan
                </button>
              )}
              <button
                className="mini-btn"
                type="button"
                onClick={() => setEditingId(editingId === review.id ? null : review.id)}
              >
                {editingId === review.id ? "Tutup" : "Edit"}
              </button>
              <button className="mini-btn mini-btn--danger" type="button" disabled={busy} onClick={() => remove(review)}>
                Hapus
              </button>
            </div>

            {editingId === review.id ? (
              <ReviewEditor
                initial={review}
                busy={busy}
                onCancel={() => setEditingId(null)}
                onSave={(data) => save(review, data, "Ulasan diperbarui.")}
                submitLabel="Simpan perubahan"
              />
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}

function ReviewEditor({
  initial,
  busy,
  submitLabel,
  onCancel,
  onSave,
}: {
  initial: Review | null;
  busy: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSave: (data: { name: string; city: string; rating: number; message: string; status: ReviewStatus }) => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    city: initial?.city ?? "",
    rating: initial?.rating ?? 5,
    message: initial?.message ?? "",
    status: initial?.status ?? ("published" as ReviewStatus),
  });

  return (
    <form
      className="admin-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="admin-grid2">
        <div className="field">
          <label>Nama</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
            maxLength={60}
          />
        </div>
        <div className="field">
          <label>Kota</label>
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required maxLength={60} />
        </div>
      </div>

      <div className="admin-grid2">
        <div className="field">
          <label>Rating</label>
          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ReviewStatus })}
          >
            <option value="published">Tampil</option>
            <option value="pending">Menunggu</option>
            <option value="hidden">Disembunyikan</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Ulasan</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          minLength={10}
          maxLength={800}
        />
      </div>

      <div className="admin-form-actions">
        <button className="mini-btn mini-btn--primary" type="submit" disabled={busy}>
          {busy ? "Menyimpan…" : submitLabel}
        </button>
        <button className="mini-btn" type="button" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
}

/* ---------------- promos ---------------- */

function PromosPanel({
  promos,
  onChange,
  notify,
  refresh,
}: {
  promos: Promo[];
  onChange: (next: Promo[]) => void;
  notify: (kind: "ok" | "err", text: string) => void;
  refresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function create(data: Omit<Promo, "id" | "createdAt">) {
    setBusy(true);
    try {
      const res = (await request("/api/admin/promos", "POST", data)) as { promo?: Promo };
      if (res.promo) onChange([res.promo, ...promos]);
      notify("ok", "Promo ditambahkan.");
      setCreating(false);
      refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save(promo: Promo, patch: Partial<Promo>) {
    setBusy(true);
    try {
      await request(`/api/admin/promos/${promo.id}`, "PATCH", { ...promo, ...patch });
      onChange(promos.map((p) => (p.id === promo.id ? { ...p, ...patch } : p)));
      notify("ok", "Promo diperbarui.");
      setEditingId(null);
      refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(promo: Promo) {
    if (!window.confirm(`Hapus promo "${promo.title}"?`)) return;
    setBusy(true);
    try {
      await request(`/api/admin/promos/${promo.id}`, "DELETE");
      onChange(promos.filter((p) => p.id !== promo.id));
      notify("ok", "Promo dihapus.");
      refresh();
    } catch (err) {
      notify("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="admin-eyebrow">Promo</p>
          <h1>Promo terbaru</h1>
          <p>{promos.filter((p) => p.active).length} promo aktif tampil di halaman promo.</p>
        </div>
        <button className="mini-btn mini-btn--primary" type="button" onClick={() => setCreating((v) => !v)}>
          {creating ? "Tutup form" : "+ Tambah promo"}
        </button>
      </div>

      {creating ? (
        <PromoEditor
          initial={null}
          busy={busy}
          submitLabel="Simpan promo"
          onCancel={() => setCreating(false)}
          onSave={create}
        />
      ) : null}

      <div className="admin-list" style={{ marginTop: "1rem" }}>
        {promos.length === 0 ? <p className="admin-empty">Belum ada promo. Tambahkan penawaran pertama.</p> : null}

        {promos.map((promo) => (
          <article className="admin-row" key={promo.id}>
            <div className="admin-row-head">
              <div>
                <h3>{promo.title}</h3>
                <div className="admin-meta">
                  <span className={`chip chip--${promo.active ? "published" : "hidden"}`}>
                    {promo.active ? "Aktif" : "Nonaktif"}
                  </span>
                  {promo.badge ? <span>{promo.badge}</span> : null}
                  {promo.validUntil ? (
                    <span>· berlaku sampai {formatDate(`${promo.validUntil}T00:00:00Z`)}</span>
                  ) : null}
                </div>
              </div>
            </div>

            {promo.description ? <p>{promo.description}</p> : null}

            <div className="admin-actions">
              <button
                className="mini-btn"
                type="button"
                disabled={busy}
                onClick={() => save(promo, { active: !promo.active })}
              >
                {promo.active ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button
                className="mini-btn"
                type="button"
                onClick={() => setEditingId(editingId === promo.id ? null : promo.id)}
              >
                {editingId === promo.id ? "Tutup" : "Edit"}
              </button>
              <button className="mini-btn mini-btn--danger" type="button" disabled={busy} onClick={() => remove(promo)}>
                Hapus
              </button>
            </div>

            {editingId === promo.id ? (
              <PromoEditor
                initial={promo}
                busy={busy}
                submitLabel="Simpan perubahan"
                onCancel={() => setEditingId(null)}
                onSave={(data) => save(promo, data)}
              />
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}

function PromoEditor({
  initial,
  busy,
  submitLabel,
  onCancel,
  onSave,
}: {
  initial: Promo | null;
  busy: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSave: (data: Omit<Promo, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    badge: initial?.badge ?? "",
    validUntil: initial?.validUntil ?? "",
    active: initial?.active ?? true,
  });

  return (
    <form
      className="admin-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <div className="field">
        <label>Judul promo</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          minLength={3}
          maxLength={80}
          placeholder="Contoh: Paket aqiqah satu domba"
        />
      </div>

      <div className="field">
        <label>Keterangan</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={300}
          placeholder="Detail singkat penawaran."
        />
      </div>

      <div className="admin-grid2">
        <div className="field">
          <label>Label</label>
          <input
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            maxLength={24}
            placeholder="Promo"
          />
        </div>
        <div className="field">
          <label>Berlaku sampai</label>
          <input
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
          />
        </div>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Tampilkan promo di situs
      </label>

      <div className="admin-form-actions">
        <button className="mini-btn mini-btn--primary" type="submit" disabled={busy}>
          {busy ? "Menyimpan…" : submitLabel}
        </button>
        <button className="mini-btn" type="button" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
}

/* ---------------- dashboard ---------------- */

function DashboardPanel({
  settings,
  onChange,
  notify,
  refresh,
  reviews,
  promos,
  connected,
}: {
  settings: SiteSettings;
  onChange: (next: SiteSettings) => void;
  notify: (kind: "ok" | "err", text: string) => void;
  refresh: () => void;
  reviews: Review[];
  promos: Promo[];
  connected: boolean;
}) {
  const published = reviews.filter((r) => r.status === "published").length;
  const pending = reviews.filter((r) => r.status === "pending").length;
  const activePromos = promos.filter((p) => p.active).length;

  return (
    <>
      <div className="admin-head">
        <div>
          <p className="admin-eyebrow">Dasbor</p>
          <h1>Ringkasan & data situs</h1>
          <p>Ubah nomor, alamat, dan email di sini. Perubahan langsung dipakai situs.</p>
        </div>
      </div>

      <div className="stat-grid">
        <article className="stat-card">
          <span>Ulasan tampil</span>
          <strong>{published}</strong>
        </article>
        <article className="stat-card">
          <span>Menunggu diperiksa</span>
          <strong>{pending}</strong>
        </article>
        <article className="stat-card">
          <span>Promo aktif</span>
          <strong>{activePromos}</strong>
        </article>
        <article className="stat-card">
          <span>Database</span>
          <strong data-ok={connected}>{connected ? "Terhubung" : "Lokal"}</strong>
        </article>
      </div>

      <ContactForm settings={settings} onChange={onChange} notify={notify} refresh={refresh} />
    </>
  );
}

/* ---------------- contact form ---------------- */

function ContactForm({
  settings,
  onChange,
  notify,
  refresh,
}: {
  settings: SiteSettings;
  onChange: (next: SiteSettings) => void;
  notify: (kind: "ok" | "err", text: string) => void;
  refresh: () => void;
}) {
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setForm(settings), [settings]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await request("/api/admin/settings", "POST", form);
      onChange(form);
      notify("ok", "Data situs diperbarui. Situs memakai data baru.");
      refresh();
    } catch (err) {
      setError((err as Error).message);
      notify("err", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-subhead">
        <h2>Kontak & situs</h2>
        <p>Nomor WhatsApp ini dipakai di semua tombol pesan pada situs.</p>
      </div>

      <form className="admin-form" onSubmit={submit} style={{ maxWidth: "720px" }}>
        <div className="admin-grid2">
          <div className="field">
            <label>Nomor WhatsApp (format internasional)</label>
            <input
              value={form.waNumber}
              onChange={(e) => setForm({ ...form, waNumber: e.target.value })}
              required
              placeholder="62811290002"
            />
          </div>
          <div className="field">
            <label>Nomor yang ditampilkan</label>
            <input
              value={form.phoneDisplay}
              onChange={(e) => setForm({ ...form, phoneDisplay: e.target.value })}
              required
              placeholder="0811-290002"
            />
          </div>
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label>Alamat farm</label>
          <input
            value={form.farmAddress}
            onChange={(e) => setForm({ ...form, farmAddress: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label>Alamat kantor</label>
          <input
            value={form.officeAddress}
            onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label>Pengumuman header (opsional)</label>
          <input
            value={form.announcement}
            onChange={(e) => setForm({ ...form, announcement: e.target.value })}
            maxLength={160}
            placeholder="Kosongkan jika tidak ingin menampilkan bar pengumuman."
          />
        </div>

        {error ? <p className="login-msg">{error}</p> : null}

        <div className="admin-form-actions">
          <button className="mini-btn mini-btn--primary" type="submit" disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan data situs"}
          </button>
        </div>
      </form>
    </section>
  );
}
