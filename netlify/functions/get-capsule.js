const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

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
    from: row.from_name,
    company: row.company,
    to: row.recipient_name,
    email: row.recipient_email,
    message: row.message,
    theme: row.theme,
    openAt: row.open_at,
    images: [],
    recipientType: row.company ? "company" : "personal",
    recipientUrl: row.recipient_url,
  });
};
