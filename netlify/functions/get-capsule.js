const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Lampiran gambar ada di Supabase Storage (bucket privat), folder <id capsule>/.
const BUCKET = "capsule-images";
const SIGNED_URL_SECONDS = 60 * 60 * 6;

// Capsule lama atau capsule tanpa lampiran mengembalikan daftar kosong, tidak pernah galat.
async function loadImages(base, headers, capsuleId) {
  try {
    const listRes = await fetch(`${base}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: `${capsuleId}/`, limit: 20, sortBy: { column: "name", order: "asc" } }),
    });
    if (!listRes.ok) return [];
    const files = await listRes.json();
    const paths = (Array.isArray(files) ? files : [])
      .filter((file) => file && file.name && /\.(jpg|png|webp)$/.test(file.name))
      .map((file) => `${capsuleId}/${file.name}`);
    if (!paths.length) return [];

    const signRes = await fetch(`${base}/storage/v1/object/sign/${BUCKET}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: SIGNED_URL_SECONDS, paths }),
    });
    if (!signRes.ok) return [];
    const signed = await signRes.json();
    return (Array.isArray(signed) ? signed : [])
      .map((item) => item && (item.signedURL || item.signedUrl))
      .filter(Boolean)
      .map((path) => `${base}/storage/v1${path.startsWith("/") ? "" : "/"}${path}`);
  } catch {
    return [];
  }
}

exports.handler = async (event) => {
  const slug = event.queryStringParameters?.slug;
  if (!slug) return json(400, { error: "Slug wajib diisi" });

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(501, { error: "Backend belum dikonfigurasi" });
  }

  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  };

  const res = await fetch(`${base}/rest/v1/capsules?slug=eq.${encodeURIComponent(slug)}&select=*`, { headers });
  if (!res.ok) return json(500, { error: "Gagal mengambil capsule", detail: await res.text() });

  const rows = await res.json();
  const row = rows[0];
  if (!row) return json(404, { error: "Capsule tidak ditemukan" });

  return json(200, {
    id: row.id,
    slug: row.slug,
    from: row.from_name,
    company: row.company,
    to: row.recipient_name,
    email: row.recipient_email,
    message: row.message,
    theme: row.theme,
    openAt: row.open_at,
    images: await loadImages(base, headers, row.id),
    avatar: row.sender_avatar || "",
    recipientType: row.company ? "company" : "personal",
    recipientUrl: row.recipient_url,
  });
};
