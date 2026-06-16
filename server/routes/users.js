import { Router } from "express";
import { get } from "../db.js";
import {
  hashPassword,
  checkPassword,
  createToken,
  requireAuth,
} from "../auth.js";

const router = Router();

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    university: u.university,
    department: u.department,
    matric: u.matric,
    scale: u.scale,
    currentLevel: u.current_level,
    monthlyBudget: u.monthly_budget,
    budgetMonth: u.budget_month,
  };
}

router.post("/signup", async (req, res) => {
  const { name, university, department, matric, password, scale, entryLevel } =
    req.body;

  if (!name || !matric || !password) {
    return res
      .status(400)
      .json({ error: "Name, matric number, and password are required." });
  }

  const existing = await get("SELECT id FROM users WHERE matric = $1", [
    matric.toUpperCase(),
  ]);
  if (existing) {
    return res
      .status(409)
      .json({ error: "An account with this matric number already exists." });
  }

  const user = await get(
    `INSERT INTO users (name, university, department, matric, password_hash, scale, current_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      name,
      university || null,
      department || null,
      matric.toUpperCase(),
      hashPassword(password),
      Number(scale) || 5,
      Number(entryLevel) || 100,
    ],
  );

  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { matric, password } = req.body;
  const user = await get("SELECT * FROM users WHERE matric = $1", [
    (matric || "").toUpperCase(),
  ]);

  if (!user || !checkPassword(password, user.password_hash)) {
    return res
      .status(401)
      .json({ error: "Incorrect matric number or password." });
  }

  res.json({ token: createToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await get("SELECT * FROM users WHERE id = $1", [req.user.id]);
  if (!user)
    return res
      .status(401)
      .json({ error: "Account not found. Please sign in again." });
  res.json({ user: publicUser(user) });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { currentLevel, monthlyBudget, scale, budgetMonth } = req.body;
  const user = await get("SELECT * FROM users WHERE id = $1", [req.user.id]);
  if (!user)
    return res
      .status(401)
      .json({ error: "Account not found. Please sign in again." });

  const updated = await get(
    `UPDATE users SET current_level = $1, monthly_budget = $2, scale = $3, budget_month = $4
     WHERE id = $5 RETURNING *`,
    [
      currentLevel ?? user.current_level,
      monthlyBudget ?? user.monthly_budget,
      scale ?? user.scale,
      budgetMonth ?? user.budget_month,
      req.user.id,
    ],
  );

  res.json({ user: publicUser(updated) });
});

export default router;
