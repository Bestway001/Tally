import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const logs = db
    .prepare('SELECT * FROM study_logs WHERE user_id = ? ORDER BY log_date DESC, id DESC')
    .all(req.user.id);
  res.json({ logs });
});

router.post('/', (req, res) => {
  const { logDate, subject, hours } = req.body;

  if (!logDate || !subject || hours == null) {
    return res.status(400).json({ error: 'Date, subject, and hours are required.' });
  }

  const info = db
    .prepare('INSERT INTO study_logs (user_id, log_date, subject, hours) VALUES (?, ?, ?, ?)')
    .run(req.user.id, logDate, subject, hours);

  const log = db.prepare('SELECT * FROM study_logs WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ log });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM study_logs WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

export default router;
