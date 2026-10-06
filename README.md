# Skill Up Assessment Platform — Hindustan University

A complete, production-grade assessment and adaptive preparation platform for Hindustan Institute of Technology & Science (Hindustan University). Replaces legacy static Google Sheets and Excel workflows with a dynamic, database-driven web platform.

---

## 🌟 Key Features

1. **Strict Institutional Authentication (Google Workspace SSO & Regex Enforcement):**
   - **Student Login Rule:** Must end with `@student.hindustanuniv.ac.in` and the prefix before `@` must contain `sp` or `su` anywhere, case-insensitive (e.g. `sp123456`, `SP123456`, `abcsp123`, `123SU456`).
   - **Faculty/Staff:** Domain restriction to `@hindustanuniv.ac.in`.
   - **Dev Mock Login Switcher:** Instant role-testing (Student, Faculty, Admin) for local verification.

2. **Excel Import & Row-Level Validation:**
   - Upload `.xlsx` or `.csv` files; preserves raw uploaded files untouched in `public/uploads/`.
   - Validates required fields, option completeness, correct answer index, and difficulty values.
   - Partial import: Safely imports valid rows while isolating errors in an audit table.
   - Imported questions always enter `PENDING_REVIEW` before reaching the central question bank.

3. **Multi-Tier Duplicate Detection:**
   - **Tier 1 (Exact / Format):** SHA-256 normalized text hash.
   - **Tier 2 (Reordered Options):** Set-comparison of options regardless of order.
   - **Tier 3 (Semantic Vector Similarity):** Embedding cosine similarity threshold ($\ge 0.88$).
   - Never auto-deletes; provides side-by-side diff review with actions: `Keep Both`, `Merge & Link`, or `Reject Duplicate`.

4. **AI Auto-Classification:**
   - Analyzes questions using Groq LLM API (`llama-3.3-70b-versatile`) or deterministic offline rules.
   - Recommends Subject, Topic, Difficulty, and Confidence score to assist teacher review.

5. **Dynamic Assessment Generation & Shortage Prevention:**
   - **Fixed Mode:** Single paper generated for all students in a batch.
   - **Practice Mode (Personalized):** Dynamically generated per student, prioritizing unseen questions and weak topics.
   - **Explicit Shortage Reporting:** If approved questions are insufficient, displays exact needed vs. available counts; never silently repeats.

6. **Distraction-Free Exam Engine:**
   - Server-enforced countdown timer with autosave on every selection.
   - Real-time interactive Question Palette (Answered, Flagged, Unvisited).
   - Auto-submission upon timeout and instant evaluation with negative marking.

7. **Weak Area Analytics & Seen-Question History:**
   - Tracks every question seen (`student_question_history`) to guarantee no unwanted repetition.
   - Aggregates rolling accuracy per topic (`student_topic_stats`) to generate targeted booster recommendations.

8. **Excel Exports:**
   - Export filtered Question Bank or Student Assessment Result Rank Lists to formatted Excel `.xlsx` files.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20.20)
- **npm** v10+

### 2. Quick Local Setup
```bash
# Clone and enter directory
cd skillup_web

# Install dependencies (already completed)
npm install

# Generate Prisma Client
npx prisma generate

# Run automated unit test suite
npm test

# Start Next.js development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🧪 Testing the Platform

### Running Automated Unit Tests
```bash
npm test
```
Runs 20+ unit tests across:
- Hindustan University email regex rules (`tests/email-validator.test.ts`)
- Multi-tier duplicate detection (`tests/duplicate.test.ts`)
- Dynamic assessment generation & shortage handling (`tests/assessment.test.ts`)
- Evaluation, negative marking, and seen-question history (`tests/evaluation.test.ts`)

### Manual End-to-End Walkthrough in Browser

1. **Login (`/login`):**
   - Click **"Student (sp prefix)"** to test Student Portal (`/student`).
   - Click **"Faculty / Teacher"** to test Teacher Portal (`/teacher`).
   - Click **"Administrator"** to test Super Admin Portal (`/admin`).

2. **Teacher Flows:**
   - Go to **`/teacher/upload`**: Upload any `.xlsx` or download the sample template.
   - Go to **`/teacher/review`**: Inspect AI suggestions and approve/reject questions.
   - Go to **`/teacher/duplicates`**: View side-by-side question differences and resolve flags.
   - Go to **`/teacher/questions`**: Search and filter the question bank, or click **"Export Question Bank (Excel)"**.
   - Go to **`/teacher/assessments`**: Click **"Generate New Assessment"** and test blueprint creation.

3. **Student Flows:**
   - Go to **`/student/assessments`**: Click **"Start Assessment Now"**.
   - In the exam interface (`/exam/[attemptId]`): Click options, observe autosave badge, flag questions, and click **"Submit Test"** to see instant evaluation and negative marks breakdown.
   - Go to **`/student/performance`**: Inspect detected weak areas and click **"Start Targeted Drill"**.

---

## 🐳 Docker Deployment

To deploy in production using Docker with PostgreSQL + pgvector:
```bash
docker compose up --build -d
```
The application will be live at `http://localhost:3000` connected to PostgreSQL with `pgvector` enabled.
"# skill_up-website" 
