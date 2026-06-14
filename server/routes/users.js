import { Router } from "express";
import db from "../db.js";
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

router.post("/signup", (req, res) => {
  const { name, university, department, matric, password, scale, entryLevel } =
    req.body;

  if (!name || !matric || !password) {
    return res
      .status(400)
      .json({ error: "Name, matric number, and password are required." });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE matric = ?")
    .get(matric.toUpperCase());
  if (existing) {
    return res
      .status(409)
      .json({ error: "An account with this matric number already exists." });
  }

  const info = db
    .prepare(
      `INSERT INTO users (name, university, department, matric, password_hash, scale, current_level)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      name,
      university || null,
      department || null,
      matric.toUpperCase(),
      hashPassword(password),
      Number(scale) || 5,
      Number(entryLevel) || 100,
    );

  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(info.lastInsertRowid);
  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { matric, password } = req.body;
  const user = db
    .prepare("SELECT * FROM users WHERE matric = ?")
    .get((matric || "").toUpperCase());

  if (!user || !checkPassword(password, user.password_hash)) {
    return res
      .status(401)
      .json({ error: "Incorrect matric number or password." });
  }

  res.json({ token: createToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user)
    return res
      .status(401)
      .json({ error: "Account not found. Please sign in again." });
  res.json({ user: publicUser(user) });
});

router.patch("/me", requireAuth, (req, res) => {
  const { currentLevel, monthlyBudget, scale, budgetMonth } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user)
    return res
      .status(401)
      .json({ error: "Account not found. Please sign in again." });

  db.prepare(
    "UPDATE users SET current_level = ?, monthly_budget = ?, scale = ?, budget_month = ? WHERE id = ?",
  ).run(
    currentLevel ?? user.current_level,
    monthlyBudget ?? user.monthly_budget,
    scale ?? user.scale,
    budgetMonth ?? user.budget_month,
    req.user.id,
  );

  const updated = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(req.user.id);
  res.json({ user: publicUser(updated) });
});

export default router;
