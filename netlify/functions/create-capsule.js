const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SITE_URL"];

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

  const accessCode = String(payload.accessCode || "").trim().toUpperCase();
  if (!accessCode) return json(401, { error: "Kode akses pengirim wajib diisi" });

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

  // Setiap pengirim punya kode akses sendiri. Pemeriksaannya memakai fungsi database
  // yang sama dengan halaman login (status, masa berlaku, dan sisa token).
  const checkRes = await fetch(`${supabaseUrl}/rest/v1/rpc/check_sender_code`, {
    method: "POST",
    headers,
    body: JSON.stringify({ p_code: accessCode }),
  });
  if (!checkRes.ok) return json(500, { error: "Gagal memeriksa kode akses", detail: await checkRes.text() });
  const check = await checkRes.json();
  if (!check || !check.ok || !check.id) {
    return json(401, { error: (check && check.error) || "Kode akses pengirim salah" });
  }

  // Token: credits = jumlah diberikan, credits_used = jumlah terpakai.
  const senderRes = await fetch(`${supabaseUrl}/rest/v1/senders?id=eq.${encodeURIComponent(check.id)}&select=id,name,credits,credits_used`, { headers });
  if (!senderRes.ok) return json(500, { error: "Gagal mengambil data pengirim", detail: await senderRes.text() });
  const sender = (await senderRes.json())[0];
  if (!sender) return json(403, { error: "Pengirim tidak ditemukan" });
  const total = Number(sender.credits) || 0;
  const used = Number(sender.credits_used) || 0;
  const sisa = total - used;
  if (sisa < recipients.length) return json(402, { error: "Token tidak cukup", credits: sisa, sisa, total, used, needed: recipients.length });

  // Logo/foto pengirim: hanya data URL gambar kecil yang diterima.
  const avatar =
    typeof capsule.avatar === "string" &&
    /^data:image\/(png|jpeg|webp);base64,/.test(capsule.avatar) &&
    capsule.avatar.length <= 150000
      ? capsule.avatar
      : "";

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
      ...(avatar ? { sender_avatar: avatar } : {}),
    };
  });

  const insert = (rows) =>
    fetch(`${supabaseUrl}/rest/v1/capsules`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(rows),
    });

  let capsuleRes = await insert(insertCapsules);
  if (!capsuleRes.ok) {
    const detail = await capsuleRes.text();
    // Kolom sender_avatar belum ada di tabel capsules: simpan tanpa logo supaya capsule tetap terkirim.
    if (avatar && detail.includes("sender_avatar")) {
      capsuleRes = await insert(insertCapsules.map(({ sender_avatar, ...row }) => row));
      if (!capsuleRes.ok) return json(500, { error: "Gagal menyimpan capsule", detail: await capsuleRes.text() });
    } else {
      return json(500, { error: "Gagal menyimpan capsule", detail });
    }
  }

  const updateCredits = await fetch(`${supabaseUrl}/rest/v1/senders?id=eq.${sender.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ credits_used: used + recipients.length, last_used_at: new Date().toISOString() }),
  });
  if (!updateCredits.ok) return json(500, { error: "Gagal mencatat pemakaian token", detail: await updateCredits.text() });

  const saved = await capsuleRes.json();
  const newUsed = used + recipients.length;
  return json(200, { ok: true, credits: total - newUsed, sisa: total - newUsed, total, used: newUsed, capsules: saved });
};
