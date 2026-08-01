import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();
router.use(requireAuth);

async function callGemini(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error("GEMINI_API_KEY not set in server/.env"), { status: 503 });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a helpful resume-writing assistant. Be concise and practical.\n\n${message}` }] }],
      }),
    }
  );
  if (!res.ok) throw Object.assign(new Error(`Gemini error: ${await res.text()}`), { status: 502 });
  const data = await res.json();
  return data.candidates[0].content.parts[0].text.trim();
}

router.post("/chat", async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Message is required." });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.aiCredits <= 0) {
      return res.status(402).json({ error: "You're out of AI credits.", aiCredits: 0 });
    }

    const reply = await callGemini(message);

    user.aiCredits -= 1;
    await user.save();

    res.json({ reply, aiCredits: user.aiCredits });
  } catch (err) {
    next(err);
  }
});

router.get("/credits", async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ aiCredits: user.aiCredits });
  } catch (err) {
    next(err);
  }
});

export default router;