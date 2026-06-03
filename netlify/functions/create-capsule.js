const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SENDER_ACCESS_CODE", "SITE_URL"];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) return json(501, { error: "Backend belum dikonfigurasi", missing });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Body JSON tidak valid" });
  }

  if (payload.accessCode !== process.env.SENDER_ACCESS_CODE) {
    return json(401, { error: "Kode akses pengirim salah" });
  }

  const capsule = payload.capsule || {};
  const recipients = Array.isArray(payload.recipients) ? payload.recipients : [];
  if (!capsule.from || !capsule.message || !capsule.openAt || recipients.length === 0) {
    return json(400, { error: "Data capsule belum lengkap" });
  }

  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, "");
  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  const senderRes = await fetch(`${supabaseUrl}/rest/v1/senders?access_code=eq.${encodeURIComponent(payload.accessCode)}&select=id,name,credits`, { headers });
  const senders = await senderRes.json();
  const sender = senders[0];
  if (!sender) return json(403, { error: "Pengirim tidak ditemukan" });
  if (sender.credits < recipients.length) return json(402, { error: "Kredit tidak cukup", credits: sender.credits, needed: recipients.length });

  const insertCapsules = recipients.map((recipient) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const firstName = String(recipient.name || "penerima").trim().split(/\s+/)[0].toLowerCase();
    const slug = `${firstName}-${id}`;
    return {
      id,
      sender_id: sender.id,
      from_name: capsule.from,
      company: capsule.company || "",
      recipient_name: recipient.name,
      recipient_email: recipient.email,
      message: capsule.message,
      theme: capsule.theme || "birthday",
      open_at: capsule.openAt,
      slug,
      recipient_url: `${process.env.SITE_URL.replace(/\/$/, "")}/untuk/${slug}`,
      status: "scheduled",
    };
  });

  const capsuleRes = await fetch(`${supabaseUrl}/rest/v1/capsules`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(insertCapsules),
  });
  if (!capsuleRes.ok) return json(500, { error: "Gagal menyimpan capsule", detail: await capsuleRes.text() });

  const updateCredits = await fetch(`${supabaseUrl}/rest/v1/senders?id=eq.${sender.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ credits: sender.credits - recipients.length }),
  });
  if (!updateCredits.ok) return json(500, { error: "Gagal mengurangi kredit", detail: await updateCredits.text() });

  const saved = await capsuleRes.json();
  return json(200, { ok: true, credits: sender.credits - recipients.length, capsules: saved });
};
