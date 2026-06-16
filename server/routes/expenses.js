import { Router } from "express";
import { get, all } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const expenses = await all(
    "SELECT * FROM expenses WHERE user_id = $1 ORDER BY spent_on DESC, id DESC",
    [req.user.id],
  );
  res.json({ expenses });
});

router.post("/", async (req, res) => {
  const { description, amount, category } = req.body;
  if (!description || amount == null || !category) {
    return res
      .status(400)
      .json({ error: "Description, amount, and category are required." });
  }
  const expense = await get(
    "INSERT INTO expenses (user_id, description, amount, category) VALUES ($1, $2, $3, $4) RETURNING *",
    [req.user.id, description, amount, category],
  );
  res.status(201).json({ expense });
});

export default router;
