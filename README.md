# Naija Student

A web app that helps Nigerian university students track three things in one place:

- **CGPA** — session-by-session, level 100–500, on either the 5.0 or 4.0 scale
- **Study tracker** — log study hours per subject and see your consistency for the month
- **Budget** — set a monthly budget in Naira and watch a status indicator move from green to red as you spend

Every student signs in with their matric number, and all their data is saved on the server so it follows them across devices and sessions.

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (ES modules) | No build step — easy to read and learn from |
| Backend | Node.js + Express | One language (JavaScript) across the whole app |
| Database | SQLite (via better-sqlite3) | A real SQL database in a single file, zero setup |
| Auth | JWT + bcryptjs | Industry-standard login and password security |

## Getting started

You need [Node.js](https://nodejs.org) version 18 or newer installed.

```bash
# 1. Install the dependencies listed in package.json
npm install

# 2. Create your environment file from the template
cp .env.example .env
# then open .env and set a real JWT_SECRET

# 3. Start the server
npm start
```

Now open http://localhost:3000 in your browser. Create an account and start adding courses.

During development you can run `npm run dev` instead — it restarts the server automatically whenever you save a file.

## How the project is organised

```
naija-student-app/
├── server/                 the backend (runs on Node.js)
│   ├── index.js            starts Express and connects everything
│   ├── db.js               creates the database and its tables
│   ├── auth.js             password hashing + login tokens
│   └── routes/             one file per feature
│       ├── users.js        signup, login, profile
│       ├── courses.js      CGPA courses
│       ├── study.js        study sessions
│       └── expenses.js     budget expenses
└── public/                 the frontend (runs in the browser)
    ├── index.html          the single page that loads everything
    ├── css/style.css       all the styling
    └── js/
        ├── api.js          talks to the backend
        ├── helpers.js      GPA maths, formatting, grading scales
        ├── auth.js         the sign in / sign up screen
        ├── cgpa.js         the CGPA tab
        ├── study.js        the study tracker tab
        ├── budget.js       the budget tab
        └── app.js          ties the tabs together
```

## How it works (the big picture)

The app has two halves that talk over the internet:

1. The **frontend** is what the student sees — the buttons, forms, and colours. It runs inside the browser.
2. The **backend** is a program running on a server. It holds the database and decides what each student is allowed to see.

When you add a course, the frontend sends a small message to the backend ("please save this course"). The backend checks who you are, saves it to the database, and replies. This message-passing happens through an **API** — a set of web addresses like `/api/courses` that the backend listens on.

## The API

All addresses below start with `/api`. Everything except signup and login requires a login token.

| Method | Path | What it does |
|---|---|---|
| POST | `/signup` | Create a new student account |
| POST | `/login` | Sign in and receive a token |
| GET | `/me` | Get the signed-in student's profile |
| PATCH | `/me` | Update level, budget, or scale |
| GET / POST | `/courses` | List or add courses |
| DELETE | `/courses/:id` | Remove a course |
| GET / POST | `/study` | List or add study sessions |
| DELETE | `/study/:id` | Remove a study session |
| GET / POST | `/expenses` | List or add expenses |
| DELETE | `/expenses/:id` | Remove an expense |

## Ideas for what to build next

- A password reset flow by email
- Charts showing CGPA trend across semesters
- Exporting results to PDF
- Deploying it online so friends can use it

## License

MIT — see the [LICENSE](LICENSE) file. You are free to use, change, and share this.
