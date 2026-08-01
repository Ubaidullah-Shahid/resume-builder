import { Router } from "express";
import Template from "../models/Template.js";

const router = Router();

// Public — no auth required. Only returns templates marked active.
router.get("/", async (req, res, next) => {
  try {
    const templates = await Template.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ templates: templates.map((t) => t.toPublicJSON()) });
  } catch (err) {
    next(err);
  }
});

export default router;