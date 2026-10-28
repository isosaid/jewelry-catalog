import { put } from "@vercel/blob";

const LIMIT = 4 * 1024 * 1024; // запас под ограничение Vercel в 4,5 МБ на запрос

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Нужен POST" });
    return;
  }

  const pass = process.env.UPLOAD_PASSWORD;
  if (!pass) {
    res.status(503).json({ error: "Загрузка не настроена: не задан UPLOAD_PASSWORD" });
    return;
  }
  if (req.headers["x-upload-key"] !== pass) {
    res.status(401).json({ error: "Неверный пароль" });
    return;
  }

  const { type, data } = req.body || {};
  if (!data) {
    res.status(400).json({ error: "Файл не передан" });
    return;
  }

  const buf = Buffer.from(data, "base64");
  if (buf.length > LIMIT) {
    res.status(413).json({ error: "Файл слишком большой" });
    return;
  }

  const mime = typeof type === "string" && type.startsWith("image/") ? type : "image/webp";
  const ext = mime.split("/")[1].replace("jpeg", "jpg");

  try {
    const blob = await put(`shots/${Date.now()}.${ext}`, buf, {
      access: "public",
      contentType: mime,
      addRandomSuffix: true
    });
    res.status(200).json({ url: blob.url });
  } catch (e) {
    res.status(500).json({ error: "Хранилище не отвечает" });
  }
}
