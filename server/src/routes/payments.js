import { Router } from "express";
import Stripe from "stripe";
import Template from "../models/Template.js";
import Purchase from "../models/Purchase.js";
import { requireAuth } from "../lib/auth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const router = Router();

// POST /api/payments/checkout — starts a Stripe Checkout session for a paid template
router.post("/checkout", requireAuth, async (req, res, next) => {
  try {
    const { templateId } = req.body || {};
    const template = await Template.findById(templateId);
    if (!template || !template.isActive) return res.status(404).json({ error: "Template not found." });
    if (template.price <= 0) return res.status(400).json({ error: "This template is free — no payment needed." });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Template: ${template.name}` },
          unit_amount: Math.round(template.price * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&template=${template._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/templates`,
    });

    await Purchase.create({
      userId: req.userId,
      templateId: template._id,
      stripeSessionId: session.id,
      amount: template.price,
      status: "pending",
    });

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/check/:templateId — has the current user paid for this template?
router.get("/check/:templateId", requireAuth, async (req, res, next) => {
  try {
    const purchase = await Purchase.findOne({
      userId: req.userId,
      templateId: req.params.templateId,
      status: "paid",
    });
    res.json({ purchased: !!purchase });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/confirm/:sessionId — frontend polls this right after Stripe redirects back
router.get("/confirm/:sessionId", requireAuth, async (req, res, next) => {
  try {
    const purchase = await Purchase.findOne({ stripeSessionId: req.params.sessionId, userId: req.userId });
    if (!purchase) return res.status(404).json({ error: "Purchase not found." });
    res.json({ status: purchase.status, templateId: purchase.templateId });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook — the source of truth for marking a purchase actually paid.
// Registered with raw body parsing in index.js, NOT json().
export async function stripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await Purchase.findOneAndUpdate({ stripeSessionId: session.id }, { status: "paid" });
  }

  res.json({ received: true });
}

export default router;