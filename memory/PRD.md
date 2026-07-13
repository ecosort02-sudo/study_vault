# Student Portal - PRD

## Original Problem Statement
Build a portal for students with:
- Great design and a login page with working buttons/links
- Admin dashboard to add tests, assignments, etc.
- Anti-cheat mechanism: track tab switches, flag if >5 (visible to admin)
- Connect login with Supabase, prevent SQL injection
- Prevent inspect element for students
- Make it "hackerproof"

## User Choices
- Portal sections: Dashboard, Tests, Assignments, Grades, Announcements
- Test types: MCQ only
- Design: Dark theme with vibrant neon accents (cyan/purple), Modern/Professional
- Database: Supabase PostgreSQL (Transaction Pooler)

## Architecture
- **Frontend**: React 19, TailwindCSS, shadcn/ui, sonner (toasts), lucide-react (icons)
- **Backend**: FastAPI, SQLAlchemy async, asyncpg, Alembic migrations, JWT auth, bcrypt password hashing
- **Database**: Supabase PostgreSQL via Transaction Pooler
- **Auth**: JWT-based with role-based access control (student/admin)

## User Personas
1. **Student**: Takes tests, views assignments, checks grades, reads announcements
2. **Admin**: Creates tests/assignments/announcements, monitors violations, tracks stats

## Core Requirements (Static)
- Secure authentication with bcrypt + JWT
- Role-based access (student vs admin routes)
- SQL injection prevention (Pydantic validators + ORM)
- Anti-cheat: track tab switches per test, flag if >5
- Inspect element prevention (context menu, F12, Ctrl+Shift+I/J/C, Ctrl+U blocked)

## What's Been Implemented (Feb 2026)
- ✅ Login page with gradient design and JWT auth
- ✅ Student Dashboard with 5 tabs (Dashboard/Tests/Assignments/Grades/Announcements)
- ✅ Test-taking page with:
  - Countdown timer with auto-submit
  - MCQ questions and answer selection
  - Tab switch tracking (visibilitychange + blur events)
  - Warning banner shows count, flags at >5
  - Inspect element prevention
- ✅ Admin Dashboard with:
  - Live stats (students/tests/assignments/violations)
  - Create Test modal with dynamic questions
  - Create Assignment modal
  - Create Announcement modal
  - Violations table showing all flagged submissions
- ✅ Supabase PostgreSQL integration via Transaction Pooler
- ✅ Alembic migrations for schema management
- ✅ Auto-grading for MCQ tests (creates Grade entry on submission)
- ✅ SQL injection blocked at Pydantic input validation layer
- ✅ RBAC enforced on all admin endpoints (403 for non-admins)

## Update (Feb 2026 - Post first-finish additions)
- ✅ **StudyVault branding** across every page (logo + gradient text)
- ✅ **Admin-only account creation** — `/api/auth/register` removed; new `POST /api/admin/users` requires admin JWT
- ✅ **Users tab in admin** with Create User modal (choose student/admin role)
- ✅ **One-time attempts**:
  - Tests: unique per (test_id, user_id); attempted tests show a lock and disabled "Already Attempted" button
  - Assignments: new `assignment_submissions` table; students see "Submitted" badge and locked button after submission
- ✅ **Admin scheduling** with `starts_at` / `ends_at` on tests and assignments — students only see items inside the availability window
- ✅ **Publish/Unpublish results**:
  - Grades created with `is_published=false` by default
  - Admin toggles per-test with `/api/admin/tests/{id}/publish` and `/unpublish`
  - `GET /api/grades` only returns published grades
- ✅ **Percentile** displayed on grades table — computed from all submissions for the same test
- ✅ **Assignment text submission** endpoint (`POST /api/assignments/submit`)

## Test Credentials
- Admin: admin@portal.com / admin123
- Student: student@portal.com / student123

## Prioritized Backlog
### P1 (Nice-to-have)
- Student registration flow (currently seed-only)
- Assignment file upload/submission
- Real-time notifications for new announcements
- Test retry policy configuration
- Password reset flow

### P2 (Future)
- Email notifications
- Discussion forums
- Course materials section
- Attendance tracking
- Timetable view
- Detailed test analytics (per-question stats)
- CSV export for grades/violations
- Bulk student import

## Next Tasks
- Wait for user feedback on the initial MVP
- Consider student registration if needed
- Add more admin features based on usage
