import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id             SERIAL PRIMARY KEY,
      name           TEXT    NOT NULL,
      university     TEXT,
      department     TEXT,
      matric         TEXT    NOT NULL UNIQUE,
      password_hash  TEXT    NOT NULL,
      scale          INTEGER NOT NULL DEFAULT 5,
      current_level  INTEGER NOT NULL DEFAULT 100,
      monthly_budget REAL    NOT NULL DEFAULT 0,
      budget_month   TEXT,
      created_at     TIMESTAMP NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS courses (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      level       INTEGER NOT NULL,
      semester    TEXT    NOT NULL,
      name        TEXT    NOT NULL,
      units       INTEGER NOT NULL,
      grade       TEXT    NOT NULL,
      grade_point INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS study_logs (
      id       SERIAL PRIMARY KEY,
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      log_date TEXT    NOT NULL,
      subject  TEXT    NOT NULL,
      hours    REAL    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      description TEXT    NOT NULL,
      amount      REAL    NOT NULL,
      category    TEXT    NOT NULL,
      spent_on    TEXT    NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD')
    );
  `);
}

export async function get(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0];
}

export async function all(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

export async function run(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

export default pool;
