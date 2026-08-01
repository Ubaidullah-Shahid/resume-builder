import { Router } from "express";
import User from "../models/User.js";
import Resume from "../models/Resume.js";
import Template from "../models/Template.js";
import Purchase from "../models/Purchase.js";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalCustomers, loggedInToday, totalResumes] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "customer", lastLoginAt: { $gte: startOfToday } }),
      Resume.countDocuments(),
    ]);

    res.json({ totalCustomers, loggedInToday, totalResumes });
  } catch (err) {
    next(err);
  }
});

router.get("/customers", async (req, res, next) => {
  try {
    const users = await User.find({ role: "customer" }).sort({ createdAt: -1 });
    const withCounts = await Promise.all(
      users.map(async (u) => ({
        ...u.toPublicJSON(),
        lastLoginAt: u.lastLoginAt,
        resumeCount: await Resume.countDocuments({ userId: u._id }),
      }))
    );
    res.json({ customers: withCounts });
  } catch (err) {
    next(err);
  }
});

router.delete("/customers/:id", async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: "customer" });
    if (!user) return res.status(404).json({ error: "Customer not found." });
    await Resume.deleteMany({ userId: user._id });
    await user.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get("/templates", async (req, res, next) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json({ templates: templates.map((t) => t.toPublicJSON()) });
  } catch (err) {
    next(err);
  }
});

router.post("/templates", async (req, res, next) => {
  try {
    const { name, price, thumbnailUrl, content } = req.body || {};
    if (!name) return res.status(400).json({ error: "Template name is required." });
    const template = await Template.create({
      name,
      price: price || 0,
      thumbnailUrl: thumbnailUrl || "",
      ...(content ? { content } : {}),
    });
    res.status(201).json({ template: template.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

router.put("/templates/:id", async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: "Template not found." });
    const { name, price, thumbnailUrl, isActive, content } = req.body || {};
    if (name !== undefined) template.name = name;
    if (price !== undefined) template.price = price;
    if (thumbnailUrl !== undefined) template.thumbnailUrl = thumbnailUrl;
    if (isActive !== undefined) template.isActive = isActive;
    if (content !== undefined) template.content = content;
    await template.save();
    res.json({ template: template.toPublicJSON() });
  } catch (err) {
    next(err);
  }
});

router.delete("/templates/:id", async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: "Template not found." });
    await template.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get("/payments", async (req, res, next) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      purchases.map(async (p) => {
        const [user, template] = await Promise.all([
          User.findById(p.userId).select("name email"),
          Template.findById(p.templateId).select("name"),
        ]);
        return {
          id: p._id.toString(),
          customerName: user?.name || "Deleted user",
          customerEmail: user?.email || "—",
          templateName: template?.name || "Deleted template",
          amount: p.amount,
          status: p.status,
          createdAt: p.createdAt,
        };
      })
    );

    res.json({ payments: enriched });
  } catch (err) {
    next(err);
  }
});

export default router;