import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose, { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resumes.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";
import templatesRoutes from "./routes/templates.js";
import paymentsRoutes, { stripeWebhook } from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Stripe webhook must see the raw body — register BEFORE express.json().
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json({ limit: "2mb" }));

const READY_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: READY_STATES[mongoose.connection.readyState] });
});

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/payments", paymentsRoutes);

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }
  res.status(err.status || 500).json({ error: err.message || "Something went wrong." });
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Resume Builder API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();