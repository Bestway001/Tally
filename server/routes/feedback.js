import { Router } from "express";
import { get } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }
  const fb = await get(
    "INSERT INTO feedback (user_id, matric, message) VALUES ($1, $2, $3) RETURNING *",
    [req.user.id, req.user.matric, message.trim()],
  );
  res.status(201).json({ feedback: fb });
});

export default router;
