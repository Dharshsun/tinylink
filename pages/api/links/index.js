import clientPromise from "../../../lib/db.cjs";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("urlshortener");
  const collection = db.collection("links");

  if (req.method === "POST") {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    const shortCode = nanoid(6);

    const result = await collection.insertOne({
      originalUrl,
      shortCode,
      createdAt: new Date(),
    });

    return res.status(201).json({ id: result.insertedId, shortCode, originalUrl });
  }

  if (req.method === "GET") {
    const links = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(links);
  }

  res.status(405).json({ error: "Method not allowed" });
}
