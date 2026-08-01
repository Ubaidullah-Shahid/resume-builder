import { Router } from "express";
import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import { requireAuth } from "../lib/auth.js";
import { renderResumePdf } from "../lib/pdf.js";

const router = Router();
router.use(requireAuth);

async function getOwnedResume(id, userId) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Resume.findOne({ _id: id, userId });
}

router.get("/", async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json({ resumes: resumes.map((r) => r.toPublicJSON()) });
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, data } = req.body || {};
    if (!data) return res.status(400).json({ error: "Resume `data` object is required." });
    const resume = await Resume.create({ userId: req.userId, title: title || data.fullName || "Untitled resume", data });
    res.status(201).json({ resume: resume.toPublicJSON() });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const resume = await getOwnedResume(req.params.id, req.userId);
    if (!resume) return res.status(404).json({ error: "Resume not found." });
    res.json({ resume: resume.toPublicJSON() });
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const resume = await getOwnedResume(req.params.id, req.userId);
    if (!resume) return res.status(404).json({ error: "Resume not found." });
    const { title, data } = req.body || {};
    if (title !== undefined) resume.title = title;
    if (data !== undefined) resume.data = data;
    await resume.save();
    res.json({ resume: resume.toPublicJSON() });
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const resume = await getOwnedResume(req.params.id, req.userId);
    if (!resume) return res.status(404).json({ error: "Resume not found." });
    await resume.deleteOne();
    res.status(204).end();
  } catch (err) { next(err); }
});

router.get("/:id/export.pdf", async (req, res, next) => {
  try {
    const resume = await getOwnedResume(req.params.id, req.userId);
    if (!resume) return res.status(404).json({ error: "Resume not found." });
    renderResumePdf(res, resume.data);
  } catch (err) { next(err); }
});

export default router;