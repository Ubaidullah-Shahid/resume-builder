import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken, requireAuth } from "../lib/auth.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are all required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      passwordHash,
      role: "customer",
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: "Name can't be empty." });
      user.name = name.trim();
    }
    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are both required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }
    const user = await User.findById(req.userId);
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: "This account signed up with Google and has no password to change." });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ---------------- Google OAuth ---------------- */

router.get("/google", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error("Missing authorization code.");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokenBody = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenBody.error_description || "Google token exchange failed.");

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    const profile = await profileRes.json();

    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }] });
    if (!user) {
      user = await User.create({
        email: profile.email.toLowerCase(),
        name: profile.name || "Google User",
        role: "customer",
        googleId: profile.sub,
      });
    } else if (!user.googleId) {
      user.googleId = profile.sub;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  } catch (err) {
    console.error("Google OAuth error:", err.message);
    res.redirect(`${process.env.FRONTEND_URL}/sign-in?error=google_oauth_failed`);
  }
});

export default router;