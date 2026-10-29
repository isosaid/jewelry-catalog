import { list } from "@vercel/blob";

/* Список загруженных кадров.
   Отвечает всегда 200: поле ready говорит, работает ли хранилище,
   reason и detail — почему не работает. */
export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(200).json({
      ready: false,
      shots: [],
      reason: "no-token",
      detail: "Blob-хранилище не подключено к проекту"
    });
    return;
  }

  try {
    const { blobs } = await list({ prefix: "shots/" });
    blobs.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
    res.status(200).json({
      ready: true,
      shots: blobs.map(b => ({ url: b.url, at: b.uploadedAt }))
    });
  } catch (e) {
    res.status(200).json({
      ready: false,
      shots: [],
      reason: "list-failed",
      detail: String(e && e.message || e)
    });
  }
}
