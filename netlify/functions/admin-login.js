const crypto = require("crypto");

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const digest = (value) => crypto.createHash("sha256").update(String(value)).digest();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  // Sandi admin hanya disimpan di pengaturan Netlify, tidak di kode aplikasi.
  if (!process.env.ADMIN_PASSWORD) return json(501, { error: "Sandi admin belum diatur di server" });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Body JSON tidak valid" });
  }

  const ok = crypto.timingSafeEqual(digest(payload.password || ""), digest(process.env.ADMIN_PASSWORD));
  if (!ok) {
    // Jeda singkat supaya sandi tidak mudah ditebak berulang-ulang.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return json(401, { error: "Password salah" });
  }

  return json(200, { ok: true });
};
