import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const expenses = db
    .prepare(
      "SELECT * FROM expenses WHERE user_id = ? ORDER BY spent_on DESC, id DESC",
    )
    .all(req.user.id);
  res.json({ expenses });
});

router.post("/", (req, res) => {
  const { description, amount, category } = req.body;

  if (!description || amount == null || !category) {
    return res
      .status(400)
      .json({ error: "Description, amount, and category are required." });
  }
  const u = db
    .prepare("SELECT monthly_budget FROM users WHERE id = ?")
    .get(req.user.id);
  const { spent } = db
    .prepare(
      "SELECT COALESCE(SUM(amount),0) AS spent FROM expenses WHERE user_id = ?",
    )
    .get(req.user.id);
  if (u.monthly_budget <= 0) {
    return res
      .status(400)
      .json({ error: "Please set your monthly budget first." });
  }
  if (amount > u.monthly_budget - spent) {
    return res
      .status(400)
      .json({ error: "Not enough balance for this expense." });
  }

  const info = db
    .prepare(
      "INSERT INTO expenses (user_id, description, amount, category) VALUES (?, ?, ?, ?)",
    )
    .run(req.user.id, description, amount, category);

  const expense = db
    .prepare("SELECT * FROM expenses WHERE id = ?")
    .get(info.lastInsertRowid);
  res.status(201).json({ expense });
});

// router.delete("/:id", (req, res) => {
//   db.prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?").run(
//     req.params.id,
//     req.user.id,
//   );
//   res.json({ ok: true });
// });

export default router;
