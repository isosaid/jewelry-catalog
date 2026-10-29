import { del } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Нужен POST" });
    return;
  }

  const { url } = req.body || {};
  if (!url) {
    res.status(400).json({ error: "Не указан кадр" });
    return;
  }

  try {
    await del(url);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Не удалось убрать кадр" });
  }
}
