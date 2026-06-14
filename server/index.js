import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import users from './routes/users.js';
import courses from './routes/courses.js';
import study from './routes/study.js';
import expenses from './routes/expenses.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', users);
app.use('/api/courses', courses);
app.use('/api/study', study);
app.use('/api/expenses', expenses);

app.use(express.static(join(__dirname, '..', 'public')));

app.listen(PORT, () => {
  console.log(`Naija Student App running at http://localhost:${PORT}`);
});
