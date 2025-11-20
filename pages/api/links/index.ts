import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function isValidUrl(u: string) {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const links = await prisma.link.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(links);
  }

  if (req.method === "POST") {
    const { url, code } = req.body as { url?: string; code?: string };

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid or missing URL" });
    }

    if (code) {
      if (!CODE_REGEX.test(code)) {
        return res.status(400).json({ error: "Code must match [A-Za-z0-9]{6,8}" });
      }
      const existing = await prisma.link.findUnique({ where: { code } });
      if (existing) return res.status(409).json({ error: "Code already exists" });

      const created = await prisma.link.create({ data: { code, url } });
      return res.status(201).json(created);
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    function gen(n=6){
      let s="";
      for(let i=0;i<n;i++) s+=chars[Math.floor(Math.random()*chars.length)];
      return s;
    }

    let newCode = gen(6);
    for (let i=0;i<5;i++) {
      const exists = await prisma.link.findUnique({ where: { code: newCode } });
      if (!exists) break;
      newCode = gen(6);
    }

    const exists = await prisma.link.findUnique({ where: { code: newCode } });
    if (exists) return res.status(500).json({ error: "Could not generate unique code" });

    const created = await prisma.link.create({ data: { code: newCode, url } });
    return res.status(201).json(created);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
