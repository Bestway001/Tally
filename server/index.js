import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { initDb } from "./db.js";
import users from "./routes/users.js";
import courses from "./routes/courses.js";
import study from "./routes/study.js";
import expenses from "./routes/expenses.js";
import feedback from "./routes/feedback.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", users);
app.use("/api/courses", courses);
app.use("/api/study", study);
app.use("/api/expenses", expenses);
app.use("/api/feedback", feedback);

app.use(express.static(join(__dirname, "..", "public")));

initDb()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Tally running at http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("Could not start — database error:", err);
    process.exit(1);
  });
