import { list } from "@vercel/blob";

/* Список загруженных кадров. Возвращает пустой список, если хранилище ещё не подключено. */
export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  try {
    const { blobs } = await list({ prefix: "shots/" });
    blobs.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
    res.status(200).json({
      ready: true,
      shots: blobs.map(b => ({ url: b.url, at: b.uploadedAt }))
    });
  } catch (e) {
    res.status(200).json({ ready: false, shots: [], error: "Хранилище не подключено" });
  }
}
