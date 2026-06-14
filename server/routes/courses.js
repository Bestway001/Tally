import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const courses = db
    .prepare('SELECT * FROM courses WHERE user_id = ? ORDER BY level, semester')
    .all(req.user.id);
  res.json({ courses });
});

router.post('/', (req, res) => {
  const { level, semester, name, units, grade, gradePoint } = req.body;

  if (!level || !semester || !name || !units || !grade) {
    return res.status(400).json({ error: 'Missing course details.' });
  }

  const info = db
    .prepare(`INSERT INTO courses (user_id, level, semester, name, units, grade, grade_point)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(req.user.id, level, semester, name, units, grade, gradePoint);

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ course });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM courses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

export default router;
