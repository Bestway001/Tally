import { Router } from "express";
import { get, all, run } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const courses = await all(
    "SELECT * FROM courses WHERE user_id = $1 ORDER BY level, semester",
    [req.user.id],
  );
  res.json({ courses });
});

router.post("/", async (req, res) => {
  const { level, semester, name, units, grade, gradePoint } = req.body;
  if (!level || !semester || !name || !units || !grade) {
    return res.status(400).json({ error: "Missing course details." });
  }
  const course = await get(
    `INSERT INTO courses (user_id, level, semester, name, units, grade, grade_point)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [req.user.id, level, semester, name, units, grade, gradePoint],
  );
  res.status(201).json({ course });
});

router.delete("/:id", async (req, res) => {
  await run("DELETE FROM courses WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.user.id,
  ]);
  res.json({ ok: true });
});

export default router;
