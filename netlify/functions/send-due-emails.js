const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "EMAIL_FROM"];

async function supabaseFetch(path, options = {}) {
  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  return fetch(`${base}/rest/v1/${path}`, { ...options, headers });
}

async function sendEmail(capsule) {
  const subject = `TimeCapsule untuk ${capsule.recipient_name} sudah siap dibuka`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2>Halo ${capsule.recipient_name},</h2>
      <p><strong>${capsule.from_name}</strong>${capsule.company ? ` dari <strong>${capsule.company}</strong>` : ""} mengirimkan TimeCapsule untukmu.</p>
      <p>Capsule sudah siap dibuka.</p>
      <p><a href="${capsule.recipient_url}" style="display:inline-block;background:#111827;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">Buka TimeCapsule</a></p>
      <p style="font-size:12px;color:#6b7280">Tidak ada data yang diminta. Abaikan email ini jika kamu merasa tidak mengenal pengirim.</p>
    </div>
  `;

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: capsule.recipient_email,
      subject,
      html,
    }),
  });
}

exports.handler = async (event) => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) return json(501, { error: "Backend email belum dikonfigurasi", missing });

  const secret = process.env.SEND_EMAILS_SECRET;
  if (secret && event.queryStringParameters?.secret !== secret) {
    return json(401, { error: "Secret salah" });
  }

  const duePath = `capsules?status=eq.scheduled&open_at=lte.${encodeURIComponent(new Date().toISOString())}&select=*`;
  const dueRes = await supabaseFetch(duePath);
  if (!dueRes.ok) return json(500, { error: "Gagal mengambil capsule due", detail: await dueRes.text() });

  const dueCapsules = await dueRes.json();
  const results = [];

  for (const capsule of dueCapsules) {
    if (!capsule.recipient_email) continue;
    const emailRes = await sendEmail(capsule);
    if (emailRes.ok) {
      await supabaseFetch(`capsules?id=eq.${capsule.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "sent", sent_at: new Date().toISOString() }),
      });
      results.push({ id: capsule.id, ok: true });
    } else {
      results.push({ id: capsule.id, ok: false, detail: await emailRes.text() });
    }
  }

  return json(200, { ok: true, sent: results.filter((r) => r.ok).length, results });
};
