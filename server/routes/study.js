import { Router } from "express";
import { get, all, run } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const logs = await all(
    "SELECT * FROM study_logs WHERE user_id = $1 ORDER BY log_date DESC, id DESC",
    [req.user.id],
  );
  res.json({ logs });
});

router.post("/", async (req, res) => {
  const { logDate, subject, hours } = req.body;
  if (!logDate || !subject || hours == null) {
    return res
      .status(400)
      .json({ error: "Date, subject, and hours are required." });
  }
  const log = await get(
    "INSERT INTO study_logs (user_id, log_date, subject, hours) VALUES ($1, $2, $3, $4) RETURNING *",
    [req.user.id, logDate, subject, hours],
  );
  res.status(201).json({ log });
});

router.delete("/:id", async (req, res) => {
  await run("DELETE FROM study_logs WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.user.id,
  ]);
  res.json({ ok: true });
});

export default router;
