import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new Database(join(__dirname, 'data.db'));


db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    university     TEXT,
    department     TEXT,
    matric         TEXT    NOT NULL UNIQUE,
    password_hash  TEXT    NOT NULL,
    scale          INTEGER NOT NULL DEFAULT 5,
    current_level  INTEGER NOT NULL DEFAULT 100,
    monthly_budget REAL    NOT NULL DEFAULT 0,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS courses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    level       INTEGER NOT NULL,
    semester    TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    units       INTEGER NOT NULL,
    grade       TEXT    NOT NULL,
    grade_point INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS study_logs (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   INTEGER NOT NULL,
    log_date  TEXT    NOT NULL,
    subject   TEXT    NOT NULL,
    hours     REAL    NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    description TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    category    TEXT    NOT NULL,
    spent_on    TEXT    NOT NULL DEFAULT (date('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);
// ... the db.exec(`CREATE TABLE ...`) block above ...

const userCols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
if (!userCols.includes('budget_month')) {
  db.exec("ALTER TABLE users ADD COLUMN budget_month TEXT");
  console.log("Migration: added budget_month column");
}

export default db;
