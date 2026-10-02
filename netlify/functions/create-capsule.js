const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SITE_URL"];

// Lampiran gambar disimpan di Supabase Storage, satu folder per capsule: <id capsule>/<urutan>.<ext>
const BUCKET = "capsule-images";
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function parseImages(list) {
  if (!Array.isArray(list)) return { images: [] };
  if (list.length > MAX_IMAGES) return { error: `Maksimal ${MAX_IMAGES} gambar per capsule` };
  const images = [];
  for (const item of list) {
    const match = typeof item === "string" && item.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return { error: "Format gambar lampiran tidak didukung" };
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > MAX_IMAGE_BYTES) return { error: "Ukuran gambar lampiran terlalu besar" };
    images.push({ type: match[1], ext: IMAGE_TYPES[match[1]], buffer });
  }
  return { images };
}

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
  const recipients = (Array.isArray(payload.recipients) ? payload.recipients : []).filter(
    (recipient) => recipient && String(recipient.name || "").trim()
  );
  if (!capsule.from || !capsule.message || !capsule.openAt || recipients.length === 0) {
    return json(400, { error: "Data capsule belum lengkap" });
  }

  const openAt = new Date(capsule.openAt);
  if (Number.isNaN(openAt.getTime())) return json(400, { error: "Tanggal buka tidak valid" });

  const parsed = parseImages(capsule.images);
  if (parsed.error) return json(400, { error: parsed.error });
  const images = parsed.images;

  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, "");
  const auth = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  };
  const headers = { ...auth, "Content-Type": "application/json" };

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

  const siteUrl = process.env.SITE_URL.replace(/\/$/, "");
  const insertCapsules = recipients.map((recipient) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const firstName = String(recipient.name).trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "penerima";
    const slug = `${firstName}-${id}`;
    return {
      id,
      sender_id: sender.id,
      from_name: capsule.from,
      company: capsule.company || "",
      recipient_name: String(recipient.name).trim(),
      // Kontak penerima boleh email, nomor WA, atau kosong. Kontak bukan syarat penyimpanan.
      recipient_email: String(recipient.email || "").trim(),
      message: capsule.message,
      theme: capsule.theme || "birthday",
      open_at: openAt.toISOString(),
      slug,
      recipient_url: `${siteUrl}/untuk/${slug}`,
      status: "scheduled",
      ...(avatar ? { sender_avatar: avatar } : {}),
    };
  });
  const ids = insertCapsules.map((row) => row.id);

  // ── Lampiran: unggah dulu ke Storage, supaya capsule tidak tersimpan tanpa gambarnya.
  const uploaded = [];
  const upload = (path, image) =>
    fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": image.type, "x-upsert": "true" },
      body: image.buffer,
    });
  const removeUploaded = async () => {
    if (!uploaded.length) return;
    await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ prefixes: uploaded }),
    }).catch(() => {});
  };

  if (images.length) {
    let bucketChecked = false;
    for (const id of ids) {
      for (let i = 0; i < images.length; i += 1) {
        const path = `${id}/${i}.${images[i].ext}`;
        let res = await upload(path, images[i]);
        if (!res.ok && !bucketChecked) {
          // Bucket belum ada: buat sekali (privat), lalu ulangi unggahan.
          bucketChecked = true;
          await fetch(`${supabaseUrl}/storage/v1/bucket`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              id: BUCKET,
              name: BUCKET,
              public: false,
              file_size_limit: MAX_IMAGE_BYTES,
              allowed_mime_types: Object.keys(IMAGE_TYPES),
            }),
          }).catch(() => {});
          res = await upload(path, images[i]);
        }
        if (!res.ok) {
          const detail = await res.text();
          await removeUploaded();
          return json(500, { error: "Gagal menyimpan gambar lampiran. Token tidak dipotong.", detail });
        }
        uploaded.push(path);
      }
    }
  }

  // ── Simpan capsule.
  const insert = (rows) =>
    fetch(`${supabaseUrl}/rest/v1/capsules`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(rows),
    });

  let capsuleRes = await insert(insertCapsules);
  if (!capsuleRes.ok) {
    let detail = await capsuleRes.text();
    // Kolom sender_avatar belum ada di tabel capsules: simpan tanpa logo supaya capsule tetap terkirim.
    if (avatar && detail.includes("sender_avatar")) {
      capsuleRes = await insert(insertCapsules.map(({ sender_avatar, ...row }) => row));
      if (!capsuleRes.ok) detail = await capsuleRes.text();
    }
    if (!capsuleRes.ok) {
      await removeUploaded();
      return json(500, { error: "Gagal menyimpan capsule. Token tidak dipotong.", detail });
    }
  }
  const saved = await capsuleRes.json();

  // ── Token dipotong hanya setelah capsule tersimpan. Syarat credits_used pada PATCH
  // mencegah dua permintaan bersamaan memotong dari angka yang sama.
  const usedFilter = sender.credits_used === null || sender.credits_used === undefined ? "is.null" : `eq.${used}`;
  const newUsed = used + recipients.length;
  const updateCredits = await fetch(`${supabaseUrl}/rest/v1/senders?id=eq.${encodeURIComponent(sender.id)}&credits_used=${usedFilter}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ credits_used: newUsed, last_used_at: new Date().toISOString() }),
  });
  const updatedRows = updateCredits.ok ? await updateCredits.json().catch(() => []) : [];
  if (!updateCredits.ok || !Array.isArray(updatedRows) || updatedRows.length === 0) {
    // Token gagal dicatat: batalkan capsule dan lampirannya supaya data tetap konsisten.
    const detail = updateCredits.ok ? "Token berubah saat diproses" : await updateCredits.text();
    await fetch(`${supabaseUrl}/rest/v1/capsules?id=in.(${ids.map((id) => encodeURIComponent(`"${id}"`)).join(",")})`, {
      method: "DELETE",
      headers,
    }).catch(() => {});
    await removeUploaded();
    return json(updateCredits.ok ? 409 : 500, { error: "Gagal mencatat pemakaian token. Capsule dibatalkan, silakan kirim ulang.", detail });
  }

  return json(200, {
    ok: true,
    credits: total - newUsed,
    sisa: total - newUsed,
    total,
    used: newUsed,
    capsules: saved.map((row) => ({ id: row.id, slug: row.slug, recipient_url: row.recipient_url, images: images.length })),
  });
};
