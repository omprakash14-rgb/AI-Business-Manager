# AI Business Manager — Operations SaaS Platform

Unified AI-Powered Business Management SaaS Platform built with a Modular Monolith architecture, designed specifically for Small and Medium Enterprises (SMEs).

---

## 1. Repository Structure

This project is organized as an **npm workspaces monorepo**:

```text
ai-business-manager/
├── apps/
│   ├── web/                     # Frontend Application (React 19 + TypeScript + Vite)
│   │   ├── src/
│   │   │   ├── components/      # UI primitives, AppShell, Auth & Org views
│   │   │   ├── context/         # AuthContext (user, active org, memberships)
│   │   │   ├── lib/             # Centralized API client & Tailwind utilities
│   │   │   └── App.tsx          # Authenticated App shell & Auth gateway
│   │   └── vite.config.ts       # Vite bundler & API proxy configuration
│   │
│   └── api/                     # Backend Application (Node.js + TypeScript + Fastify)
│       ├── drizzle/             # Generated PostgreSQL SQL migrations (Drizzle Kit)
│       ├── src/
│       │   ├── config/          # Zod environment variable parsing
│       │   ├── core/            # Security (bcrypt password hashing, token crypto)
│       │   ├── db/              # Drizzle schema definitions & repository store
│       │   ├── plugins/         # Fastify plugins (CORS, Error handling, Auth/Cookie)
│       │   ├── routes/          # REST routes (Health, Auth, Users, Organizations)
│       │   └── server.ts        # Fastify server builder & lifecycle
│       ├── drizzle.config.ts    # Drizzle Kit configuration
│       └── .env.example         # Environment template
│
├── packages/
│   └── shared/                  # Pure TypeScript contracts, Zod schemas & DTOs
│       └── src/
│           ├── contracts/       # Auth schemas, Health check & common API envelopes
│           └── types/           # Navigation & module layout types
│
├── package.json                 # Monorepo root manifest
├── tsconfig.json                # Base TypeScript configuration
└── README.md                    # This document
```

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui foundation, Lucide icons.
- **Backend:** Node.js, TypeScript, Fastify, REST API, Zod schema validation.
- **Authentication:** HttpOnly session cookies (`ai_session_id`), bcrypt salted password hashing, SHA-256 session token hashing.
- **Shared:** Zod schemas, TypeScript types, and response contracts in `@ai-business-manager/shared`.
- **Database Provider:** Managed PostgreSQL 16+ via Supabase (Drizzle ORM schema, migrations generated via Drizzle Kit).
- **Architecture:** Modular Monolith with strict multi-tenant organization isolation and Owner-controlled organizational role hierarchy (`owner`, `admin`, `manager`, `member`, `viewer`).

---

## 3. Getting Started

### Prerequisites
- **Node.js:** `v20.0.0` or higher (tested with `v24.19.0`)
- **npm:** `v10.0.0` or higher (tested with `v11.17.0`)
- **Database (Supabase PostgreSQL):** Configure `DATABASE_URL` (transaction pooler, port 6543) and `DIRECT_URL` (session mode, port 5432) from your Supabase dashboard in `apps/api/.env`. In local offline development without a live database, the backend uses a thread-safe in-memory repository store that strictly enforces all relational constraints, unique keys, and tenant boundaries.

### Installation
From the repository root, install dependencies across all workspaces:

```bash
npm install
```

---

## 4. Running the Development Servers

You can run the backend API and frontend Web application independently or together.

### Option A: Run Both Together (Recommended)
From the repository root:

```bash
npm run dev
```

### Option B: Run Backend API Independently
```bash
npm run dev:api
```
- Server URL: `http://localhost:4000`
- Health Check: `http://localhost:4000/api/health`

### Option C: Run Frontend Web Independently
```bash
npm run dev:web
```
- Client URL: `http://localhost:5174` (or next free port if 5174 is busy)

---

## 5. Phase 2 Capabilities & Endpoints

### Authentication & Sessions
- `POST /api/auth/register` — Register a new user account and initialize a default organization.
- `POST /api/auth/login` — Authenticate credentials and establish an HttpOnly session cookie.
- `POST /api/auth/logout` — Invalidate session and clear session cookie.
- `GET /api/auth/me` — Retrieve current authenticated profile, active organization, and authorized memberships.

### User Profile
- `PATCH /api/users/profile` — Update user's full name and profile avatar.

### Organizations & Tenancy
- `POST /api/organizations` — Atomically create a new organization; creator is assigned the `Owner` role.
- `GET /api/organizations` — List all organizations the authenticated user belongs to.
- `POST /api/organizations/switch` — Validate membership and switch the active organization context.
- `GET /api/organizations/current` — Get active organization details and membership role.
- `PATCH /api/organizations/current` — Update organization name (Owner or Admin role required).

### Member Management & Owner-Controlled RBAC
- `GET /api/organizations/current/members` — List members in active organization.
- `PATCH /api/organizations/current/members/:memberId` — Update member role (`admin`, `manager`, `member`, `viewer`). **Exclusively restricted to the Organization Owner.** Non-owners receive 403 Forbidden. Owner account is protected against accidental demotion or removal.
- `DELETE /api/organizations/current/members/:memberId` — Remove member from organization. **Exclusively restricted to the Organization Owner.** Owner cannot be removed.

### Invitations
- `POST /api/organizations/current/invitations` — Generate an invitation token for a colleague (Owner or Admin). Only Owners can assign elevated roles (`admin`, `manager`, `viewer`); invitations sent by Admins strictly default to `member`.
- `GET /api/organizations/current/invitations` — List pending invitations.
- `DELETE /api/organizations/current/invitations/:invitationId` — Revoke pending invitation.
- `POST /api/organizations/accept-invitation` — Accept an invitation token and join the organization with the designated role (default: `member`).

---

## 6. Phase 3 Capabilities & Endpoints (Shared Platform Services)

### File Metadata & Storage Abstraction
- `POST /api/files/metadata` — Register file metadata with visibility control (`private`, `organization`). Emits an HMAC-signed upload URL.
- `GET /api/files` — Paginated and searchable file list scoped to the active organization and user permissions.
- `GET /api/files/:id` — Retrieve file metadata by ID with tenant boundary validation.
- `GET /api/files/:id/access-url` — Generate a time-limited (15-minute) HMAC-signed download/access URL.
- `DELETE /api/files/:id` — Soft-delete a file record (`deletedAt` set).

### In-App Notifications Foundation
- `GET /api/notifications` — List paginated notifications for the authenticated user and organization (with optional `unreadOnly` filter).
- `GET /api/notifications/unread-count` — Lightweight polling endpoint returning `{ unreadCount: number }`.
- `PATCH /api/notifications/:id/read` — Mark an individual notification as read.
- `POST /api/notifications/mark-all-read` — Mark all notifications in the organization as read.
- `POST /api/notifications` — Create an in-app notification (for internal services or administrative alerts).

### Activity History & Audit Trail
- `GET /api/activities` — Paginated, searchable activity timeline for all workspace actions, mutations, and resource lifecycles.
- `GET /api/audit-logs` — Tamper-resistant, sanitized security and admin audit logs (restricted to `Owner` and `Admin` roles).

### Shared Formatting & Computation Helpers
Exported from `@ai-business-manager/shared`:
- `formatCurrency(amount, currency)` & `decimalToCents(amount)`: Safe decimal and fixed-precision money calculation.
- `formatDateTime(isoString)` & `formatRelativeTime(isoString)`: Consistent UTC timestamp representations.
- `formatFileSize(bytes)`: Human-readable file size strings (Bytes, KB, MB, GB).
- `calculatePaginationMeta(totalItems, page, limit)`: Centralized pagination mathematics.

---

## 7. Database Migration Instructions (PostgreSQL)

Drizzle Kit migrations have been generated into:
- `apps/api/drizzle/0000_slim_wraith.sql` (Phase 2: Users, Sessions, Organizations, Memberships, Invitations, Audit Logs)
- `apps/api/drizzle/0001_magenta_ezekiel_stane.sql` (Phase 3: Files, Notifications, Activity Events)
- `apps/api/drizzle/0002_slimy_nightcrawler.sql` (Phase 4: Accounts, Contacts, Leads, Opportunities, CRM Activities)

To review and apply migrations to your live PostgreSQL database:
1. Ensure your PostgreSQL server (v16+) is running.
2. In `apps/api/.env`, configure your database connection string:
   ```env
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>
   ```
3. Inspect `apps/api/drizzle/0002_slimy_nightcrawler.sql` to verify table definitions, constraints, foreign keys, and indexes.
4. Apply the migrations using Drizzle Kit:
   ```bash
   npm run db:migrate --workspace=@ai-business-manager/api
   ```
   *Or execute the `.sql` files directly using your preferred database client (e.g. `psql`, pgAdmin, or DBeaver).*

---

## 8. Phase 4 Capabilities & Endpoints (CRM & Lead Management)

### Leads Management & Pipeline
- `GET /api/crm/leads` — Paginated list of leads with full-text search, status filter (`new`, `contacted`, `qualified`, `unqualified`, `converted`, `lost`), source filter, and owner assignment filter.
- `POST /api/crm/leads` — Create an inbound lead with title, contact info, source, estimated deal value, currency, and notes.
- `POST /api/crm/leads/check-duplicates` — Duplicate check across leads, contacts, and accounts matching email, phone, or company name.
- `GET /api/crm/leads/:id` — Retrieve lead details including interaction history and assigned team member.
- `PATCH /api/crm/leads/:id` — Update lead attributes and transition pipeline status (with automatic activity recording).
- `POST /api/crm/leads/:id/assign` — Reassign lead to an active organization team member and trigger in-app assignment notification.
- `POST /api/crm/leads/:id/convert` — Transactionally convert an eligible lead into an Account, Contact, and optional Sales Opportunity while preserving all prior interaction history.
- `DELETE /api/crm/leads/:id` — Soft-delete lead record (`deletedAt` set).

### Customer Contacts
- `GET /api/crm/contacts` — Paginated customer contacts directory with search and company filter.
- `POST /api/crm/contacts` — Create a new customer contact associated with a company account.
- `GET /api/crm/contacts/:id` — Retrieve contact details.
- `PATCH /api/crm/contacts/:id` — Update contact information.
- `DELETE /api/crm/contacts/:id` — Soft-delete contact.

### Accounts & Companies
- `GET /api/crm/accounts` — Paginated company accounts directory with industry filter.
- `POST /api/crm/accounts` — Register a corporate customer/account.
- `GET /api/crm/accounts/:id` — Retrieve account details and associated contact count.
- `PATCH /api/crm/accounts/:id` — Update account details.
- `DELETE /api/crm/accounts/:id` — Soft-delete account.

### CRM Activities & Follow-ups
- `GET /api/crm/activities` — Paginated CRM interaction timeline filtered by lead, contact, account, type (`note`, `call`, `meeting`, `follow_up`, `task`), or status (`pending`, `completed`).
- `POST /api/crm/activities` — Log a call/meeting/note or schedule a future follow-up with reminder notification.
- `PATCH /api/crm/activities/:id` — Update activity or mark follow-up as completed.

### Opportunities (Future Sales Integration Interface)
- `GET /api/crm/opportunities` — Paginated list of opportunities created during lead conversions, ready for Phase 5 sales pipeline integration.

---

## 10. Phase 5: Sales Management Endpoints

The Sales module (`/api/sales`) enables pipeline visualization, deal management, probabilistic forecasting, stage history tracking, and quotation generation:

### Opportunities & Deals
- `GET /api/sales/opportunities` — Paginated deals list with stage, account, owner, and amount filters.
- `POST /api/sales/opportunities` — Create a new sales deal (with stage, amount, probability %, and expected close date).
- `GET /api/sales/opportunities/:id` — Retrieve opportunity details with account, contact, lead, and stage history.
- `PATCH /api/sales/opportunities/:id` — Update deal attributes.
- `PATCH /api/sales/opportunities/:id/stage` — Transition deal stage with automatic win/loss reason capture and stage history audit.
- `GET /api/sales/opportunities/:id/history` — Audit log of all stage transitions for the deal.
- `DELETE /api/sales/opportunities/:id` — Soft-delete deal.

### Sales Forecasting & Summaries
- `GET /api/sales/forecast` — Aggregated sales metrics: active pipeline value, weighted forecast value (`Σ(Amount × Probability)`), won revenue, lost value, win rate %, stage distribution, and monthly closing projections.

### Quotations & Commercial Proposals
- `GET /api/sales/quotations` — Paginated quotations list with opportunity, account, and status filters.
- `POST /api/sales/quotations` — Create quotation with dynamic line items, discount amount, tax percent, subtotal, and total calculation.
- `GET /api/sales/quotations/:id` — Get quotation details with line items breakdown and commercial terms.
- `PATCH /api/sales/quotations/:id/status` — Transition quotation status (`draft` → `sent` → `approved` / `rejected` / `expired`).
- `DELETE /api/sales/quotations/:id` — Soft-delete quotation.

---

## 12. Phase 6: Operational Finance Endpoints

The Operational Finance module (`/api/finance`) provides SMEs with robust, fixed-precision financial recordkeeping, invoicing, payment settlement, and budget management:

### Financial Categories
- `GET /api/finance/categories` — List financial categories for the active organization (filtered by `type`: `income` or `expense`).
- `POST /api/finance/categories` — Create custom income/expense category with color code.
- `PATCH /api/finance/categories/:id` — Update category attributes.
- `DELETE /api/finance/categories/:id` — Delete custom category (system default categories are protected).

### Financial Transactions Ledger
- `GET /api/finance/transactions` — Paginated transactions ledger with date range, category, type (`income`, `expense`), status, and account filters.
- `POST /api/finance/transactions` — Record income or expense with category, currency, amount, payment method, counterparty, reference, and optional CRM account.
- `GET /api/finance/transactions/:id` — Retrieve transaction details.
- `PATCH /api/finance/transactions/:id` — Update transaction attributes (locked against updates if auto-generated by invoice settlement).
- `DELETE /api/finance/transactions/:id` — Delete transaction (adjusting ledger balances).

### Operational Invoices
- `GET /api/finance/invoices` — Paginated invoices list with status, customer account, date, and overdue filters.
- `POST /api/finance/invoices` — Create invoice with dynamic line items, discount amount, tax percent, subtotal, total amount, and due date.
- `POST /api/finance/invoices/from-quotation/:quotationId` — Lead-to-Cash conversion: directly generates an invoice from an approved Sales Quotation without duplicate data entry.
- `GET /api/finance/invoices/:id` — Get invoice details with line items breakdown, customer account, and payment history.
- `PATCH /api/finance/invoices/:id/status` — Update invoice status (`draft` → `issued` → `void`).
- `DELETE /api/finance/invoices/:id` — Soft-delete invoice (only allowed if no payments are recorded).

### Payment Records & Settlement
- `GET /api/finance/payments` — Paginated payment receipts list with invoice, account, and date filters.
- `POST /api/finance/payments` — Record payment against an invoice or customer account. Enforces overpayment prevention (`amount <= invoice.balanceDue`), updates invoice balances (`paidAmount`, `balanceDue`), transitions status (`partially_paid` or `paid`), and automatically logs a matching `income` transaction in the financial ledger.
- `GET /api/finance/payments/:id` — Retrieve payment receipt details.
- `PATCH /api/finance/payments/:id/void` — Void payment receipt, reversing invoice settlement balances and transaction records.

### Operational Budgets
- `GET /api/finance/budgets` — Paginated budgets list with category and period filters.
- `POST /api/finance/budgets` — Create budget allocation with cycle (`monthly`, `quarterly`, `yearly`), date range, target amount, and optional category filter.
- `GET /api/finance/budgets/:id` — Retrieve budget with dynamically computed `actualSpent`, `remainingAmount`, `utilizationPercent`, and status (`on_track`, `warning`, `exceeded`).
- `PATCH /api/finance/budgets/:id` — Update budget thresholds.
- `DELETE /api/finance/budgets/:id` — Delete budget.

### Financial Summaries & Reports
- `GET /api/finance/summary` — Organization-wide financial report: Total Income, Total Expenses, Net Operating Profit/Loss, Total Receivables (unpaid invoice balances), Overdue Invoices Count & Amount, monthly cash flow breakdown (`YYYY-MM`), category distributions with share percentages, and aggregate budget utilization.

---

## 14. Phase 7: Project Management Endpoints

The Project Management module (`/api/projects`) enables SME teams to plan, assign, organize, and track projects, tasks, subtasks, deadlines, and milestones:

### Summary & Overview
- `GET /api/projects/summary` — Aggregate project KPIs: total projects, active projects, completed projects, total tasks, completed tasks, in-progress tasks, overdue tasks, and delivery completion rate %.

### Projects
- `GET /api/projects` — Paginated projects listing with filters (`status`, `priority`, `ownerId`, `accountId`, `opportunityId`, `search`).
- `POST /api/projects` — Create project with name, description, priority, dates, team members, and CRM account / Sales deal associations.
- `GET /api/projects/:id` — Retrieve project details, task metrics, progress %, and member roster.
- `PATCH /api/projects/:id` — Update project metadata, status, dates, or ownership.
- `DELETE /api/projects/:id` — Soft-delete project and cascade soft-delete associated tasks, milestones, and comments.

### Project Members
- `GET /api/projects/:id/members` — List team members assigned to project.
- `POST /api/projects/:id/members` — Add member to project with role (`lead`, `contributor`, `viewer`).
- `DELETE /api/projects/:id/members/:userId` — Remove member from project (owner cannot be removed).

### Milestones
- `GET /api/projects/:id/milestones` — List milestones for a project with target dates and task completion progress.
- `POST /api/projects/:id/milestones` — Create a project milestone.
- `PATCH /api/projects/milestones/:id` — Update milestone attributes or mark as completed.
- `DELETE /api/projects/milestones/:id` — Soft-delete milestone and unassign its linked tasks.

### Tasks & Subtasks
- `GET /api/projects/tasks` — Paginated tasks listing with filters (`projectId`, `milestoneId`, `parentTaskId`, `status`, `priority`, `assigneeId`, `isOverdue`, `search`, `sortBy`, `sortOrder`).
- `POST /api/projects/tasks` — Create task or subtask (`parentTaskId`) with priority, assignee, due date, and estimated hours.
- `GET /api/projects/tasks/:id` — Get task details, subtask checklist items, and comment count.
- `PATCH /api/projects/tasks/:id` — Update task details.
- `PATCH /api/projects/tasks/:id/status` — Quick status transition (`todo`, `in_progress`, `in_review`, `completed`, `cancelled`) with automatic completion timestamp management.
- `DELETE /api/projects/tasks/:id` — Soft-delete task and cascade delete subtasks.

### Comments & Collaboration
- `GET /api/projects/:id/comments` — List comments for project or specific task (`taskId` query param).
- `POST /api/projects/:id/comments` — Post a discussion comment or status update.
- `DELETE /api/projects/comments/:id` — Delete comment (author or admin only).

---

## 15. Manual Verification Checklist (Phase 7 Project Management)

1. **Projects Directory & Metric KPI Strip:**
   - In the sidebar, click **Projects & Tasks**.
   - Notice the top metric cards: Total Projects, Active Projects, Completed Projects, Total Tasks, Overdue Tasks, and Delivery Rate %.
   - Click **New Project** and enter `Q4 Security Audit & Hardening`, priority `High`, select a target end date, and link a CRM Client Account (e.g. Acme Corp).
   - Click **Create Project**; observe the project card appear in the directory with calculated 0% progress and team members count.
2. **Project Detail & Kanban Board:**
   - Click on the newly created project card to enter the **Project Detail View**.
   - Notice the breadcrumb link (`← All Projects`), project header with progress bar, owner, linked account badge, and status switcher.
   - Switch to the **Kanban Board** tab showing columns: *To Do*, *In Progress*, *In Review*, and *Completed*.
   - Click **+** or **New Task** to create a task: title `Configure TLS 1.3 Cipher Suites`, priority `High`, due date tomorrow.
   - On the Kanban card, click the right arrow `>` to transition the card from *To Do* to *In Progress*, and then to *In Review* and *Completed*.
   - Observe the project progress bar update immediately to reflect task completion.
3. **Subtasks Checklist & Task Detail Dialog:**
   - Click on the task card to open the **Task Detail Dialog**.
   - In the Subtasks section, type `Verify HSTS header` and click **Add**.
   - Add a second subtask `Disable SSLv3`.
   - Check the checkbox next to `Verify HSTS header` — notice the line-through styling and updated completion counter (1 of 2 completed).
4. **Comments & Author Attribution:**
   - Inside the Task Detail Dialog, scroll to the Discussion section.
   - Enter `Testing complete in staging environment` and click **Post**.
   - Verify the comment appears with author full name, timestamp, and delete button.
5. **Project Milestones:**
   - In the Project Detail View, switch to the **Milestones** tab.
   - Click **Add Milestone**, enter `Phase 1 Penetration Testing`, set target date, and submit.
   - Observe the milestone card with its task completion ratio and progress bar.
   - Click **Mark as Complete** to toggle its delivery state.
6. **Project Team Roster:**
   - Click **Team** in the project header to open the **Project Team Members** dialog.
   - Select another user from the organization dropdown, set role to `Contributor`, and click **Add**.
   - Verify the member appears in the roster with their role badge.
7. **Organization-Wide All Tasks List & Kanban:**
   - Click `← All Projects` to return to the Projects module home.
   - Click the **All Tasks Kanban** tab to see tasks across all projects organized by delivery status.
   - Click the **Task List** tab to view the tabular task registry with search, priority filter, and overdue toggle.
8. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher.
   - Verify that all projects, tasks, milestones, and comments are strictly isolated to each organization.

---

## 16. Phase 8: Marketing Management Endpoints

The Marketing module (`/api/marketing`) enables SME teams to plan campaigns, allocate channel budgets, track marketing spend, and deterministically attribute CRM leads to originating campaigns:

### Summary & Performance Metrics
- `GET /api/marketing/summary` — Aggregate marketing KPIs: total campaigns, active campaigns, completed campaigns, planned campaigns, total budget, total actual cost, total remaining budget, average budget utilization %, total attributed leads, total converted leads, overall lead conversion rate %, channel performance breakdown, and status distribution counters.

### Campaign Management
- `GET /api/marketing/campaigns` — Paginated campaigns list with search and filters (`status`, `channel`, `type`, `sortBy`, `sortOrder`).
- `POST /api/marketing/campaigns` — Create marketing campaign with name, type, channel, status, objective, description, start/end dates, budget, actual cost, currency, UTM tracking parameters, and notes.
- `GET /api/marketing/campaigns/:id` — Retrieve campaign details with computed remaining budget, utilization %, total leads, converted leads, and pipeline revenue value.
- `PATCH /api/marketing/campaigns/:id` — Update campaign details, status, dates, or budget allocation.
- `DELETE /api/marketing/campaigns/:id` — Soft-delete marketing campaign and cascade-clear lead attribution associations.

### Lead Attribution & Traceability
- `GET /api/marketing/campaigns/:id/leads` — List all CRM leads attributed to a campaign with lead status, contact details, estimated deal value, and converted sales opportunity links.
- `POST /api/marketing/campaigns/:id/leads` — Attribute a CRM lead to a campaign with optional attribution notes. Validates organization tenant boundary and prevents duplicate association.
- `DELETE /api/marketing/campaigns/:id/leads/:leadId` — Remove lead attribution link from a campaign.

---

## 17. Manual Verification Checklist (Phase 8 Marketing Management)

1. **Marketing Performance Dashboard & KPI Strip:**
   - In the sidebar, click **Marketing**.
   - Notice the top metric cards: Total Campaigns, Allocated Budget, Actual Cost / Spent with utilization %, and Attributed CRM Leads with conversion rate %.
   - Inspect the **Campaign Lifecycle Breakdown** cards showing distribution across `Draft`, `Planned`, `Active`, `Completed`, and `Cancelled`.
   - Inspect the **Channel Performance & Attribution Distribution** table displaying metrics grouped by marketing channel (`Social Media`, `Email Marketing`, `Search`, `Paid Ads`, `Website`, `Referral`, `Events`, `Other`).
2. **Campaign Directory & Filtering:**
   - Switch to the **Campaign Directory** tab.
   - Click **New Campaign** to open the creation modal.
   - Enter `Q2 SaaS Growth Webinar`, select Channel `Events & Webinars`, Type `Event / Tradeshow`, Status `Active`, Budget `6000.00`, Actual Cost `1200.00`, Start Date today, End Date in 30 days, Objective `Generate 40 qualified demo requests`, and UTM parameters `source: webinar, medium: organic`.
   - Click **Create Campaign**; verify the campaign appears immediately in the directory with calculated 20% budget utilization and active status badge.
3. **Budget Tracking & Utilization Gauge:**
   - Click on the newly created campaign card or click the eye icon to open the **Campaign Detail Dialog**.
   - Observe the financial KPI cards: Allocated Budget ($6,000.00), Actual Cost ($1,200.00), Remaining Budget ($4,800.00), and the visual color-coded budget progress bar.
   - Test updating the campaign status using the quick status switcher buttons (`Planned` → `Active` → `Completed`).
4. **CRM Lead Attribution:**
   - In the Campaign Detail Dialog, scroll to the **Attributed CRM Leads** section.
   - In the "Attribute Lead" dropdown, select an existing CRM lead (e.g. Acme Cloud Upgrade / Alex Mercer).
   - Enter an attribution note (e.g. `Registered through webinar landing page`) and click **Attribute Lead**.
   - Verify that the lead appears in the table with contact info, status badge, attribution timestamp, and opportunity link.
   - Verify that the campaign's `totalLeads` and `convertedLeads` counters update dynamically.
5. **Channel Attribution Aggregation:**
   - Return to the **Performance Overview** tab.
   - Verify that the `Events & Webinars` channel row reflects the updated campaign count, budget, actual spend, and attributed lead count.
6. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher.
   - Verify that all marketing campaigns, budget numbers, and lead attributions are strictly isolated to each organization.

---

## 18. Phase 9: HR Management Endpoints

The HR module (`/api/hr`) provides employee directory, department, designation, attendance, and leave management for SME teams:

### Summary & Overview
- `GET /api/hr/summary` — Aggregate HR metrics: total employees, active employees, on-leave employees, terminated employees, departments count, designations count, pending leaves count, today's attendance summary (present, remote, half-day, absent, on-leave, presence rate %), department distribution breakdown, and recent leave requests.

### Departments
- `GET /api/hr/departments` — List departments with calculated employee counts and manager names.
- `POST /api/hr/departments` — Create department with name, code, description, and optional manager lead (Admin/Owner only).
- `GET /api/hr/departments/:id` — Get department details.
- `PATCH /api/hr/departments/:id` — Update department name, code, description, or manager (Admin/Owner only).
- `DELETE /api/hr/departments/:id` — Soft-delete department and unassign employee references (Admin/Owner only).

### Designations / Job Positions
- `GET /api/hr/designations` — List designations with department titles and employee counts.
- `POST /api/hr/designations` — Create job designation with title, code, department, and description (Admin/Owner only).
- `GET /api/hr/designations/:id` — Get designation details.
- `PATCH /api/hr/designations/:id` — Update designation details (Admin/Owner only).
- `DELETE /api/hr/designations/:id` — Soft-delete designation (Admin/Owner only).

### Employee Directory
- `GET /api/hr/employees` — Paginated employee directory with search (`name`, `email`, `employeeNumber`), filters (`departmentId`, `designationId`, `status`, `employmentType`), and sorting.
- `POST /api/hr/employees` — Create employee profile with employee ID, work email, department, designation, joining date, reporting manager, and optional platform user link (Admin/Owner only).
- `GET /api/hr/employees/me` — Retrieve current authenticated user's linked employee profile.
- `GET /api/hr/employees/:id` — Retrieve full employee profile with organizational alignment.
- `PATCH /api/hr/employees/:id` — Update employee profile attributes, status, or assignment (Admin/Owner only).
- `DELETE /api/hr/employees/:id` — Soft-delete / terminate employee record (Admin/Owner only).

### Attendance Tracking
- `GET /api/hr/attendance` — Paginated attendance logs with filters (`date`, `employeeId`, `status`, `month`).
- `POST /api/hr/attendance` — Record daily attendance (date, employeeId, status, checkInTime, checkOutTime, notes). Enforces unique constraint per employee/date. Regular members can only record for their own profile.
- `PATCH /api/hr/attendance/:id` — Update attendance record (Admin/Owner only).
- `DELETE /api/hr/attendance/:id` — Delete attendance record (Admin/Owner only).

### Leave Requests & Approvals
- `GET /api/hr/leaves` — Paginated leave requests with filters (`employeeId`, `status`, `leaveType`, `year`).
- `POST /api/hr/leaves` — Submit leave request with leave type, start/end date, days count, and reason. Validates date boundaries, checks for overlapping active requests, and notifies organization admins.
- `GET /api/hr/leaves/:id` — Get leave request details.
- `PATCH /api/hr/leaves/:id/status` — Approve or reject leave request with decision notes. Automatically marks employee `on_leave` if current date falls within approved window and notifies employee (Admin/Owner only).
- `DELETE /api/hr/leaves/:id` — Cancel pending leave request (Requester or Admin).

---

## 19. Manual Verification Checklist (Phase 9 HR Management)

1. **HR Executive Overview & Workforce KPI Strip:**
   - In the sidebar, click **Human Resources**.
   - Notice the top metric cards: Total Workforce, Departments & Roles count, Today's Presence Rate %, and Pending Leave Requests count.
   - Inspect the **Today's Workforce Attendance Status** card showing breakdown across `Office Present`, `Remote / WFH`, `On Leave`, and `Absent`.
   - Inspect the **Department Workforce Distribution** bars displaying employee distribution percentages per department.
2. **Departments & Designations Setup:**
   - Switch to the **Departments & Roles** tab.
   - Click **New Department**, enter name `Engineering`, code `ENG`, description `Product development & infrastructure`, and submit.
   - Click **New Designation**, enter title `Senior Backend Engineer`, code `SWE-III`, associate with `Engineering`, and submit.
   - Verify that department cards and designation table update dynamically.
3. **Employee Directory & Profile Management:**
   - Switch to the **Employee Directory** tab.
   - Click **Add Employee**.
   - Enter Employee ID `EMP-001`, First Name `Sarah`, Last Name `Connor`, Work Email `sarah.connor@acme.com`, select Department `Engineering` and Designation `Senior Backend Engineer`, Employment Type `Full Time`, Status `Active`, Joining Date today, and submit.
   - Verify that the employee appears in the directory table with their status badge and department pills.
   - Click on the row to open the **Employee Detail Dialog**.
   - Review the Profile tab, Attendance tab, and Leave History tab.
4. **Daily Attendance Logging:**
   - Switch to the **Daily Attendance** tab.
   - Click **Record Attendance**.
   - Select employee `Sarah Connor (EMP-001)`, Date today, Status `Present (In Office)`, check-in time `09:00`, check-out time `17:30`, and submit.
   - Verify that the record appears in the attendance table.
   - Try logging attendance again for `Sarah Connor` on the same date — observe the duplicate prevention error alert.
5. **Leave Request & Management Approval Workflow:**
   - Switch to the **Leave Management** tab.
   - Click **Request Leave**.
   - Select `Sarah Connor`, Leave Type `Annual Leave / Vacation`, Start Date tomorrow, End Date in 3 days, Days Count `3.0`, Reason `Annual family vacation`, and submit.
   - Verify that the request appears in the table with `Pending Review` status.
   - As Admin/Owner, click **Review** on the pending request card to open the approval modal.
   - Enter review note `Approved by Engineering Lead` and click **Approve**.
   - Verify that the status transitions to `Approved`, approver name is recorded, and an in-app notification is delivered to the Notification Drawer.
6. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher.
   - Verify that all employees, departments, designations, attendance records, and leave requests are strictly isolated to each organization.

---

## 13. Manual Verification Checklist (Phase 6 Operational Finance)

1. **Financial Overview & KPI Dashboards:**
   - In the sidebar, click **Finance & Invoices**.
   - Notice the top summary KPI cards: Total Income, Total Expenses, Net Operating Flow (+/- with profit/loss indicator), Receivables (unpaid invoice balances), and Overdue Invoices amount.
   - Inspect the **Monthly Cash Flow Breakdown** table showing monthly inflows, outflows, and net flow (`YYYY-MM`).
   - Inspect the **Expense by Category** and **Income by Category** distribution cards with color badges, transaction counts, and share percentages.
   - Inspect the **Operational Budget Health** card showing overall budget consumption and utilization %.
2. **Operational Invoicing & Overdue Detection:**
   - Switch to the **Invoices** tab.
   - Click **New Invoice**.
   - Select a customer account (e.g. Acme Corp), issue date, and due date.
   - Add line items with descriptions, quantities, and unit prices.
   - Add a discount amount and tax percentage (e.g. 10%). Observe the live recalculation of Subtotal, Discount, Tax Amount, and Balance Due.
   - Click **Create Invoice** and verify that a sequential invoice number is assigned (e.g. `INV-202611-1001`).
   - Click on the invoice row to open the **Invoice Detail Dialog** showing the printable bill layout, line items, and audit details.
3. **Lead-to-Cash Workflow (Quotation to Invoice):**
   - Click **New Invoice** and notice the "Import Approved Quotation" selector.
   - Select an approved sales quotation from Phase 5.
   - Verify that all line items, customer account, discount, and tax terms are automatically pre-filled without manual re-entry.
4. **Payment Recording & Transactional Ledger Reconciliation:**
   - On an issued invoice with a balance due, click **Record Payment** (or click inside the Invoice Detail Dialog).
   - Enter a payment amount greater than the balance due — observe the client-side and server-side overpayment rejection.
   - Click **Pay Full Balance** to fill the exact balance due, choose payment method (`bank_transfer`, `credit_card`, `check`, `cash`), and submit.
   - Verify that:
     - The invoice status transitions immediately to `Paid` (or `Partially Paid` if partial).
     - The `paidAmount` and `balanceDue` update with exact 2-decimal arithmetic.
     - A formal payment receipt is generated (`PAY-202611-1001`).
     - A matching `income` transaction is automatically added to the **Transactions Ledger**.
     - Total Income and Receivables update across the entire Finance Overview dashboard.
5. **Transactions Ledger & Category Spending:**
   - Switch to the **Transactions Ledger** tab.
   - Click **Log Expense**, select an expense category (e.g. "Software & Subscriptions" or "Office & Administrative"), enter amount, and submit.
   - Verify that the transaction is recorded with negative net flow impact and appears in the list.
   - Filter transactions by type (`Income`, `Expense`), category, or date range.
6. **Operational Budgets & Spending Limits:**
   - Switch to the **Budgets** tab.
   - Click **New Budget**, enter a name (e.g. "Q4 Software Tooling"), select a category, set a budget limit (e.g. $5,000.00), and choose Quarterly period.
   - Observe the progress bar, utilization %, and status indicator (`On Track` <= 80%, `Near Limit` 80-100%, `Exceeded` > 100%).
   - Log an expense matching that category and verify that `actualSpent` increases and `remainingAmount` decreases dynamically.
7. **Custom Financial Categories:**
   - Switch to the **Categories** tab.
   - Create a custom category with color picker and type (`income` or `expense`).
   - Verify that system default categories are protected against accidental deletion.
8. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher and confirm that all invoices, payments, transactions, budgets, and categories are strictly isolated to each organization.

---

## 11. Manual Verification Checklist (Phase 5 Sales)

1. **Deals Pipeline Kanban Board:**
   - In the sidebar, click **Sales & Deals**.
   - Notice the top summary banner showing active pipeline value, weighted forecast, won revenue, and open deals count.
   - On the **Deals Pipeline** tab, view the 6 stages: Prospecting (10%), Qualification (25%), Proposal (50%), Negotiation (75%), Closed Won (100%), and Closed Lost (0%).
   - Click **+** on any column or the top **New Opportunity** button to create a new deal with amount, expected close date, account, and win probability.
2. **Interactive Stage Transitions & Win/Loss Audit:**
   - On the Kanban card, use the quick navigation arrows to move deals forward or backward between stages.
   - Click on any deal card to open the **Opportunity Detail Dialog**.
   - Observe the interactive visual progress bar. Click a stage to transition the deal.
   - Transition to **Closed Won** or **Closed Lost** — observe the prompt asking for a mandatory win/loss reason. Enter a reason and confirm.
   - Switch to the **Stage History** sub-tab in the detail dialog to verify the timestamped transition audit log.
3. **Probabilistic Sales Forecasting:**
   - Click the **Forecasting** tab.
   - Verify the top KPI cards: Active Pipeline, Weighted Forecast (`Σ(Deal Value × Win Probability)`), Won Revenue, Lost Value, and Win Rate %.
   - Inspect the **Pipeline Distribution by Stage** table and progress bars.
   - Inspect the **Monthly Closing Projections** table showing deals grouped by closing month (`YYYY-MM`).
4. **Quotations & Commercial Proposals:**
   - Click the **Quotations & Proposals** tab (or click "New Quotation" from within a deal's detail modal).
   - Click **New Quotation**, select a target opportunity, add line items with quantities and unit prices, specify discount and tax %.
   - Verify live calculation of Subtotal, Discount, Tax Amount, and Grand Total.
   - Submit and verify the quotation appears with a generated quotation number (e.g. `QT-202611-1001`).
   - Click to inspect line items, and test status transitions (`draft` → `sent` → `approved` / `rejected`).
5. **Tenant Isolation & CRM Integration:**
   - Verify that deals converted from CRM leads in Phase 4 appear seamlessly in Phase 5 Sales without duplicate entries.
   - Switch organizations in the header switcher and verify all deals and quotations are strictly isolated to the active organization.

---

## 10. Phase 5: Sales Management Endpoints

The Sales module (`/api/sales`) enables pipeline visualization, deal management, probabilistic forecasting, stage history tracking, and quotation generation:

### Opportunities & Deals
- `GET /api/sales/opportunities` — Paginated deals list with stage, account, owner, and amount filters.
- `POST /api/sales/opportunities` — Create a new sales deal (with stage, amount, probability %, and expected close date).
- `GET /api/sales/opportunities/:id` — Retrieve opportunity details with account, contact, lead, and stage history.
- `PATCH /api/sales/opportunities/:id` — Update deal attributes.
- `PATCH /api/sales/opportunities/:id/stage` — Transition deal stage with automatic win/loss reason capture and stage history audit.
- `GET /api/sales/opportunities/:id/history` — Audit log of all stage transitions for the deal.
- `DELETE /api/sales/opportunities/:id` — Soft-delete deal.

### Sales Forecasting & Summaries
- `GET /api/sales/forecast` — Aggregated sales metrics: active pipeline value, weighted forecast value (`Σ(Amount × Probability)`), won revenue, lost value, win rate %, stage distribution, and monthly closing projections.

### Quotations & Commercial Proposals
- `GET /api/sales/quotations` — Paginated quotations list with opportunity, account, and status filters.
- `POST /api/sales/quotations` — Create quotation with dynamic line items, discount amount, tax percent, subtotal, and total calculation.
- `GET /api/sales/quotations/:id` — Get quotation details with line items breakdown and commercial terms.
- `PATCH /api/sales/quotations/:id/status` — Transition quotation status (`draft` → `sent` → `approved` / `rejected` / `expired`).
- `DELETE /api/sales/quotations/:id` — Soft-delete quotation.

---

## 12. Phase 6: Operational Finance Endpoints

The Operational Finance module (`/api/finance`) provides SMEs with robust, fixed-precision financial recordkeeping, invoicing, payment settlement, and budget management:

### Financial Categories
- `GET /api/finance/categories` — List financial categories for the active organization (filtered by `type`: `income` or `expense`).
- `POST /api/finance/categories` — Create custom income/expense category with color code.
- `PATCH /api/finance/categories/:id` — Update category attributes.
- `DELETE /api/finance/categories/:id` — Delete custom category (system default categories are protected).

### Financial Transactions Ledger
- `GET /api/finance/transactions` — Paginated transactions ledger with date range, category, type (`income`, `expense`), status, and account filters.
- `POST /api/finance/transactions` — Record income or expense with category, currency, amount, payment method, counterparty, reference, and optional CRM account.
- `GET /api/finance/transactions/:id` — Retrieve transaction details.
- `PATCH /api/finance/transactions/:id` — Update transaction attributes (locked against updates if auto-generated by invoice settlement).
- `DELETE /api/finance/transactions/:id` — Delete transaction (adjusting ledger balances).

### Operational Invoices
- `GET /api/finance/invoices` — Paginated invoices list with status, customer account, date, and overdue filters.
- `POST /api/finance/invoices` — Create invoice with dynamic line items, discount amount, tax percent, subtotal, total amount, and due date.
- `POST /api/finance/invoices/from-quotation/:quotationId` — Lead-to-Cash conversion: directly generates an invoice from an approved Sales Quotation without duplicate data entry.
- `GET /api/finance/invoices/:id` — Get invoice details with line items breakdown, customer account, and payment history.
- `PATCH /api/finance/invoices/:id/status` — Update invoice status (`draft` → `issued` → `void`).
- `DELETE /api/finance/invoices/:id` — Soft-delete invoice (only allowed if no payments are recorded).

### Payment Records & Settlement
- `GET /api/finance/payments` — Paginated payment receipts list with invoice, account, and date filters.
- `POST /api/finance/payments` — Record payment against an invoice or customer account. Enforces overpayment prevention (`amount <= invoice.balanceDue`), updates invoice balances (`paidAmount`, `balanceDue`), transitions status (`partially_paid` or `paid`), and automatically logs a matching `income` transaction in the financial ledger.
- `GET /api/finance/payments/:id` — Retrieve payment receipt details.
- `PATCH /api/finance/payments/:id/void` — Void payment receipt, reversing invoice settlement balances and transaction records.

### Operational Budgets
- `GET /api/finance/budgets` — Paginated budgets list with category and period filters.
- `POST /api/finance/budgets` — Create budget allocation with cycle (`monthly`, `quarterly`, `yearly`), date range, target amount, and optional category filter.
- `GET /api/finance/budgets/:id` — Retrieve budget with dynamically computed `actualSpent`, `remainingAmount`, `utilizationPercent`, and status (`on_track`, `warning`, `exceeded`).
- `PATCH /api/finance/budgets/:id` — Update budget thresholds.
- `DELETE /api/finance/budgets/:id` — Delete budget.

### Financial Summaries & Reports
- `GET /api/finance/summary` — Organization-wide financial report: Total Income, Total Expenses, Net Operating Profit/Loss, Total Receivables (unpaid invoice balances), Overdue Invoices Count & Amount, monthly cash flow breakdown (`YYYY-MM`), category distributions with share percentages, and aggregate budget utilization.

---

## 14. Phase 7: Project Management Endpoints

The Project Management module (`/api/projects`) enables SME teams to plan, assign, organize, and track projects, tasks, subtasks, deadlines, and milestones:

### Summary & Overview
- `GET /api/projects/summary` — Aggregate project KPIs: total projects, active projects, completed projects, total tasks, completed tasks, in-progress tasks, overdue tasks, and delivery completion rate %.

### Projects
- `GET /api/projects` — Paginated projects listing with filters (`status`, `priority`, `ownerId`, `accountId`, `opportunityId`, `search`).
- `POST /api/projects` — Create project with name, description, priority, dates, team members, and CRM account / Sales deal associations.
- `GET /api/projects/:id` — Retrieve project details, task metrics, progress %, and member roster.
- `PATCH /api/projects/:id` — Update project metadata, status, dates, or ownership.
- `DELETE /api/projects/:id` — Soft-delete project and cascade soft-delete associated tasks, milestones, and comments.

### Project Members
- `GET /api/projects/:id/members` — List team members assigned to project.
- `POST /api/projects/:id/members` — Add member to project with role (`lead`, `contributor`, `viewer`).
- `DELETE /api/projects/:id/members/:userId` — Remove member from project (owner cannot be removed).

### Milestones
- `GET /api/projects/:id/milestones` — List milestones for a project with target dates and task completion progress.
- `POST /api/projects/:id/milestones` — Create a project milestone.
- `PATCH /api/projects/milestones/:id` — Update milestone attributes or mark as completed.
- `DELETE /api/projects/milestones/:id` — Soft-delete milestone and unassign its linked tasks.

### Tasks & Subtasks
- `GET /api/projects/tasks` — Paginated tasks listing with filters (`projectId`, `milestoneId`, `parentTaskId`, `status`, `priority`, `assigneeId`, `isOverdue`, `search`, `sortBy`, `sortOrder`).
- `POST /api/projects/tasks` — Create task or subtask (`parentTaskId`) with priority, assignee, due date, and estimated hours.
- `GET /api/projects/tasks/:id` — Get task details, subtask checklist items, and comment count.
- `PATCH /api/projects/tasks/:id` — Update task details.
- `PATCH /api/projects/tasks/:id/status` — Quick status transition (`todo`, `in_progress`, `in_review`, `completed`, `cancelled`) with automatic completion timestamp management.
- `DELETE /api/projects/tasks/:id` — Soft-delete task and cascade delete subtasks.

### Comments & Collaboration
- `GET /api/projects/:id/comments` — List comments for project or specific task (`taskId` query param).
- `POST /api/projects/:id/comments` — Post a discussion comment or status update.
- `DELETE /api/projects/comments/:id` — Delete comment (author or admin only).

---

## 15. Manual Verification Checklist (Phase 7 Project Management)

1. **Projects Directory & Metric KPI Strip:**
   - In the sidebar, click **Projects & Tasks**.
   - Notice the top metric cards: Total Projects, Active Projects, Completed Projects, Total Tasks, Overdue Tasks, and Delivery Rate %.
   - Click **New Project** and enter `Q4 Security Audit & Hardening`, priority `High`, select a target end date, and link a CRM Client Account (e.g. Acme Corp).
   - Click **Create Project**; observe the project card appear in the directory with calculated 0% progress and team members count.
2. **Project Detail & Kanban Board:**
   - Click on the newly created project card to enter the **Project Detail View**.
   - Notice the breadcrumb link (`← All Projects`), project header with progress bar, owner, linked account badge, and status switcher.
   - Switch to the **Kanban Board** tab showing columns: *To Do*, *In Progress*, *In Review*, and *Completed*.
   - Click **+** or **New Task** to create a task: title `Configure TLS 1.3 Cipher Suites`, priority `High`, due date tomorrow.
   - On the Kanban card, click the right arrow `>` to transition the card from *To Do* to *In Progress*, and then to *In Review* and *Completed*.
   - Observe the project progress bar update immediately to reflect task completion.
3. **Subtasks Checklist & Task Detail Dialog:**
   - Click on the task card to open the **Task Detail Dialog**.
   - In the Subtasks section, type `Verify HSTS header` and click **Add**.
   - Add a second subtask `Disable SSLv3`.
   - Check the checkbox next to `Verify HSTS header` — notice the line-through styling and updated completion counter (1 of 2 completed).
4. **Comments & Author Attribution:**
   - Inside the Task Detail Dialog, scroll to the Discussion section.
   - Enter `Testing complete in staging environment` and click **Post**.
   - Verify the comment appears with author full name, timestamp, and delete button.
5. **Project Milestones:**
   - In the Project Detail View, switch to the **Milestones** tab.
   - Click **Add Milestone**, enter `Phase 1 Penetration Testing`, set target date, and submit.
   - Observe the milestone card with its task completion ratio and progress bar.
   - Click **Mark as Complete** to toggle its delivery state.
6. **Project Team Roster:**
   - Click **Team** in the project header to open the **Project Team Members** dialog.
   - Select another user from the organization dropdown, set role to `Contributor`, and click **Add**.
   - Verify the member appears in the roster with their role badge.
7. **Organization-Wide All Tasks List & Kanban:**
   - Click `← All Projects` to return to the Projects module home.
   - Click the **All Tasks Kanban** tab to see tasks across all projects organized by delivery status.
   - Click the **Task List** tab to view the tabular task registry with search, priority filter, and overdue toggle.
8. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher.
   - Verify that all projects, tasks, milestones, and comments are strictly isolated to each organization.

---

## 16. Phase 8: Marketing Management Endpoints

The Marketing module (`/api/marketing`) enables SME teams to plan campaigns, allocate channel budgets, track marketing spend, and deterministically attribute CRM leads to originating campaigns:

### Summary & Performance Metrics
- `GET /api/marketing/summary` — Aggregate marketing KPIs: total campaigns, active campaigns, completed campaigns, planned campaigns, total budget, total actual cost, total remaining budget, average budget utilization %, total attributed leads, total converted leads, overall lead conversion rate %, channel performance breakdown, and status distribution counters.

### Campaign Management
- `GET /api/marketing/campaigns` — Paginated campaigns list with search and filters (`status`, `channel`, `type`, `sortBy`, `sortOrder`).
- `POST /api/marketing/campaigns` — Create marketing campaign with name, type, channel, status, objective, description, start/end dates, budget, actual cost, currency, UTM tracking parameters, and notes.
- `GET /api/marketing/campaigns/:id` — Retrieve campaign details with computed remaining budget, utilization %, total leads, converted leads, and pipeline revenue value.
- `PATCH /api/marketing/campaigns/:id` — Update campaign details, status, dates, or budget allocation.
- `DELETE /api/marketing/campaigns/:id` — Soft-delete marketing campaign and cascade-clear lead attribution associations.

### Lead Attribution & Traceability
- `GET /api/marketing/campaigns/:id/leads` — List all CRM leads attributed to a campaign with lead status, contact details, estimated deal value, and converted sales opportunity links.
- `POST /api/marketing/campaigns/:id/leads` — Attribute a CRM lead to a campaign with optional attribution notes. Validates organization tenant boundary and prevents duplicate association.
- `DELETE /api/marketing/campaigns/:id/leads/:leadId` — Remove lead attribution link from a campaign.

---

## 17. Manual Verification Checklist (Phase 8 Marketing Management)

1. **Marketing Performance Dashboard & KPI Strip:**
   - In the sidebar, click **Marketing**.
   - Notice the top metric cards: Total Campaigns, Allocated Budget, Actual Cost / Spent with utilization %, and Attributed CRM Leads with conversion rate %.
   - Inspect the **Campaign Lifecycle Breakdown** cards showing distribution across `Draft`, `Planned`, `Active`, `Completed`, and `Cancelled`.
   - Inspect the **Channel Performance & Attribution Distribution** table displaying metrics grouped by marketing channel (`Social Media`, `Email Marketing`, `Search`, `Paid Ads`, `Website`, `Referral`, `Events`, `Other`).
2. **Campaign Directory & Filtering:**
   - Switch to the **Campaign Directory** tab.
   - Click **New Campaign** to open the creation modal.
   - Enter `Q2 SaaS Growth Webinar`, select Channel `Events & Webinars`, Type `Event / Tradeshow`, Status `Active`, Budget `6000.00`, Actual Cost `1200.00`, Start Date today, End Date in 30 days, Objective `Generate 40 qualified demo requests`, and UTM parameters `source: webinar, medium: organic`.
   - Click **Create Campaign**; verify the campaign appears immediately in the directory with calculated 20% budget utilization and active status badge.
3. **Budget Tracking & Utilization Gauge:**
   - Click on the newly created campaign card or click the eye icon to open the **Campaign Detail Dialog**.
   - Observe the financial KPI cards: Allocated Budget ($6,000.00), Actual Cost ($1,200.00), Remaining Budget ($4,800.00), and the visual color-coded budget progress bar.
   - Test updating the campaign status using the quick status switcher buttons (`Planned` → `Active` → `Completed`).
4. **CRM Lead Attribution:**
   - In the Campaign Detail Dialog, scroll to the **Attributed CRM Leads** section.
   - In the "Attribute Lead" dropdown, select an existing CRM lead (e.g. Acme Cloud Upgrade / Alex Mercer).
   - Enter an attribution note (e.g. `Registered through webinar landing page`) and click **Attribute Lead**.
   - Verify that the lead appears in the table with contact info, status badge, attribution timestamp, and opportunity link.
   - Verify that the campaign's `totalLeads` and `convertedLeads` counters update dynamically.
5. **Channel Attribution Aggregation:**
   - Return to the **Performance Overview** tab.
   - Verify that the `Events & Webinars` channel row reflects the updated campaign count, budget, actual spend, and attributed lead count.
6. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher.
   - Verify that all marketing campaigns, budget numbers, and lead attributions are strictly isolated to each organization.

---

## 18. Phase 9: HR Management Endpoints

The HR module (`/api/hr`) provides employee directory, department, designation, attendance, and leave management for SME teams:

### Summary & Overview
- `GET /api/hr/summary` — Aggregate HR metrics: total employees, active employees, on-leave employees, terminated employees, departments count, designations count, pending leaves count, today's attendance summary (present, remote, half-day, absent, on-leave, presence rate %), department distribution breakdown, and recent leave requests.

### Departments
- `GET /api/hr/departments` — List departments with calculated employee counts and manager names.
- `POST /api/hr/departments` — Create department with name, code, description, and optional manager lead (Admin/Owner only).
- `GET /api/hr/departments/:id` — Get department details.
- `PATCH /api/hr/departments/:id` — Update department name, code, description, or manager (Admin/Owner only).
- `DELETE /api/hr/departments/:id` — Soft-delete department and unassign employee references (Admin/Owner only).

### Designations / Job Positions
- `GET /api/hr/designations` — List designations with department titles and employee counts.
- `POST /api/hr/designations` — Create job designation with title, code, department, and description (Admin/Owner only).
- `GET /api/hr/designations/:id` — Get designation details.
- `PATCH /api/hr/designations/:id` — Update designation details (Admin/Owner only).
- `DELETE /api/hr/designations/:id` — Soft-delete designation (Admin/Owner only).

### Employee Directory
- `GET /api/hr/employees` — Paginated employee directory with search (`name`, `email`, `employeeNumber`), filters (`departmentId`, `designationId`, `status`, `employmentType`), and sorting.
- `POST /api/hr/employees` — Create employee profile with employee ID, work email, department, designation, joining date, reporting manager, and optional platform user link (Admin/Owner only).
- `GET /api/hr/employees/me` — Retrieve current authenticated user's linked employee profile.
- `GET /api/hr/employees/:id` — Retrieve full employee profile with organizational alignment.
- `PATCH /api/hr/employees/:id` — Update employee profile attributes, status, or assignment (Admin/Owner only).
- `DELETE /api/hr/employees/:id` — Soft-delete / terminate employee record (Admin/Owner only).

### Attendance Tracking
- `GET /api/hr/attendance` — Paginated attendance logs with filters (`date`, `employeeId`, `status`, `month`).
- `POST /api/hr/attendance` — Record daily attendance (date, employeeId, status, checkInTime, checkOutTime, notes). Enforces unique constraint per employee/date. Regular members can only record for their own profile.
- `PATCH /api/hr/attendance/:id` — Update attendance record (Admin/Owner only).
- `DELETE /api/hr/attendance/:id` — Delete attendance record (Admin/Owner only).

### Leave Requests & Approvals
- `GET /api/hr/leaves` — Paginated leave requests with filters (`employeeId`, `status`, `leaveType`, `year`).
- `POST /api/hr/leaves` — Submit leave request with leave type, start/end date, days count, and reason. Validates date boundaries, checks for overlapping active requests, and notifies organization admins.
- `GET /api/hr/leaves/:id` — Get leave request details.
- `PATCH /api/hr/leaves/:id/status` — Approve or reject leave request with decision notes. Automatically marks employee `on_leave` if current date falls within approved window and notifies employee (Admin/Owner only).
- `DELETE /api/hr/leaves/:id` — Cancel pending leave request (Requester or Admin).

---

## 19. Manual Verification Checklist (Phase 9 HR Management)

1. **HR Executive Overview & Workforce KPI Strip:**
   - In the sidebar, click **Human Resources**.
   - Notice the top metric cards: Total Workforce, Departments & Roles count, Today's Presence Rate %, and Pending Leave Requests count.
   - Inspect the **Today's Workforce Attendance Status** card showing breakdown across `Office Present`, `Remote / WFH`, `On Leave`, and `Absent`.
   - Inspect the **Department Workforce Distribution** bars displaying employee distribution percentages per department.
2. **Departments & Designations Setup:**
   - Switch to the **Departments & Roles** tab.
   - Click **New Department**, enter name `Engineering`, code `ENG`, description `Product development & infrastructure`, and submit.
   - Click **New Designation**, enter title `Senior Backend Engineer`, code `SWE-III`, associate with `Engineering`, and submit.
   - Verify that department cards and designation table update dynamically.
3. **Employee Directory & Profile Management:**
   - Switch to the **Employee Directory** tab.
   - Click **Add Employee**.
   - Enter Employee ID `EMP-001`, First Name `Sarah`, Last Name `Connor`, Work Email `sarah.connor@acme.com`, select Department `Engineering` and Designation `Senior Backend Engineer`, Employment Type `Full Time`, Status `Active`, Joining Date today, and submit.
   - Verify that the employee appears in the directory table with their status badge and department pills.
   - Click on the row to open the **Employee Detail Dialog**.
   - Review the Profile tab, Attendance tab, and Leave History tab.
4. **Daily Attendance Logging:**
   - Switch to the **Daily Attendance** tab.
   - Click **Record Attendance**.
   - Select employee `Sarah Connor (EMP-001)`, Date today, Status `Present (In Office)`, check-in time `09:00`, check-out time `17:30`, and submit.
   - Verify that the record appears in the attendance table.
   - Try logging attendance again for `Sarah Connor` on the same date — observe the duplicate prevention error alert.
5. **Leave Request & Management Approval Workflow:**
   - Switch to the **Leave Management** tab.
   - Click **Request Leave**.
   - Select `Sarah Connor`, Leave Type `Annual Leave / Vacation`, Start Date tomorrow, End Date in 3 days, Days Count `3.0`, Reason `Annual family vacation`, and submit.
   - Verify that the request appears in the table with `Pending Review` status.
   - As Admin/Owner, click **Review** on the pending request card to open the approval modal.
   - Enter review note `Approved by Engineering Lead` and click **Approve**.
   - Verify that the status transitions to `Approved`, approver name is recorded, and an in-app notification is delivered to the Notification Drawer.
6. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher.
   - Verify that all employees, departments, designations, attendance records, and leave requests are strictly isolated to each organization.

---

## 13. Manual Verification Checklist (Phase 6 Operational Finance)

1. **Financial Overview & KPI Dashboards:**
   - In the sidebar, click **Finance & Invoices**.
   - Notice the top summary KPI cards: Total Income, Total Expenses, Net Operating Flow (+/- with profit/loss indicator), Receivables (unpaid invoice balances), and Overdue Invoices amount.
   - Inspect the **Monthly Cash Flow Breakdown** table showing monthly inflows, outflows, and net flow (`YYYY-MM`).
   - Inspect the **Expense by Category** and **Income by Category** distribution cards with color badges, transaction counts, and share percentages.
   - Inspect the **Operational Budget Health** card showing overall budget consumption and utilization %.
2. **Operational Invoicing & Overdue Detection:**
   - Switch to the **Invoices** tab.
   - Click **New Invoice**.
   - Select a customer account (e.g. Acme Corp), issue date, and due date.
   - Add line items with descriptions, quantities, and unit prices.
   - Add a discount amount and tax percentage (e.g. 10%). Observe the live recalculation of Subtotal, Discount, Tax Amount, and Balance Due.
   - Click **Create Invoice** and verify that a sequential invoice number is assigned (e.g. `INV-202611-1001`).
   - Click on the invoice row to open the **Invoice Detail Dialog** showing the printable bill layout, line items, and audit details.
3. **Lead-to-Cash Workflow (Quotation to Invoice):**
   - Click **New Invoice** and notice the "Import Approved Quotation" selector.
   - Select an approved sales quotation from Phase 5.
   - Verify that all line items, customer account, discount, and tax terms are automatically pre-filled without manual re-entry.
4. **Payment Recording & Transactional Ledger Reconciliation:**
   - On an issued invoice with a balance due, click **Record Payment** (or click inside the Invoice Detail Dialog).
   - Enter a payment amount greater than the balance due — observe the client-side and server-side overpayment rejection.
   - Click **Pay Full Balance** to fill the exact balance due, choose payment method (`bank_transfer`, `credit_card`, `check`, `cash`), and submit.
   - Verify that:
     - The invoice status transitions immediately to `Paid` (or `Partially Paid` if partial).
     - The `paidAmount` and `balanceDue` update with exact 2-decimal arithmetic.
     - A formal payment receipt is generated (`PAY-202611-1001`).
     - A matching `income` transaction is automatically added to the **Transactions Ledger**.
     - Total Income and Receivables update across the entire Finance Overview dashboard.
5. **Transactions Ledger & Category Spending:**
   - Switch to the **Transactions Ledger** tab.
   - Click **Log Expense**, select an expense category (e.g. "Software & Subscriptions" or "Office & Administrative"), enter amount, and submit.
   - Verify that the transaction is recorded with negative net flow impact and appears in the list.
   - Filter transactions by type (`Income`, `Expense`), category, or date range.
6. **Operational Budgets & Spending Limits:**
   - Switch to the **Budgets** tab.
   - Click **New Budget**, enter a name (e.g. "Q4 Software Tooling"), select a category, set a budget limit (e.g. $5,000.00), and choose Quarterly period.
   - Observe the progress bar, utilization %, and status indicator (`On Track` <= 80%, `Near Limit` 80-100%, `Exceeded` > 100%).
   - Log an expense matching that category and verify that `actualSpent` increases and `remainingAmount` decreases dynamically.
7. **Custom Financial Categories:**
   - Switch to the **Categories** tab.
   - Create a custom category with color picker and type (`income` or `expense`).
   - Verify that system default categories are protected against accidental deletion.
8. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher and confirm that all invoices, payments, transactions, budgets, and categories are strictly isolated to each organization.

---

## 11. Manual Verification Checklist (Phase 5 Sales)

1. **Deals Pipeline Kanban Board:**
   - In the sidebar, click **Sales & Deals**.
   - Notice the top summary banner showing active pipeline value, weighted forecast, won revenue, and open deals count.
   - On the **Deals Pipeline** tab, view the 6 stages: Prospecting (10%), Qualification (25%), Proposal (50%), Negotiation (75%), Closed Won (100%), and Closed Lost (0%).
   - Click **+** on any column or the top **New Opportunity** button to create a new deal with amount, expected close date, account, and win probability.
2. **Interactive Stage Transitions & Win/Loss Audit:**
   - On the Kanban card, use the quick navigation arrows to move deals forward or backward between stages.
   - Click on any deal card to open the **Opportunity Detail Dialog**.
   - Observe the interactive visual progress bar. Click a stage to transition the deal.
   - Transition to **Closed Won** or **Closed Lost** — observe the prompt asking for a mandatory win/loss reason. Enter a reason and confirm.
   - Switch to the **Stage History** sub-tab in the detail dialog to verify the timestamped transition audit log.
3. **Probabilistic Sales Forecasting:**
   - Click the **Forecasting** tab.
   - Verify the top KPI cards: Active Pipeline, Weighted Forecast (`Σ(Deal Value × Win Probability)`), Won Revenue, Lost Value, and Win Rate %.
   - Inspect the **Pipeline Distribution by Stage** table and progress bars.
   - Inspect the **Monthly Closing Projections** table showing deals grouped by closing month (`YYYY-MM`).
4. **Quotations & Commercial Proposals:**
   - Click the **Quotations & Proposals** tab (or click "New Quotation" from within a deal's detail modal).
   - Click **New Quotation**, select a target opportunity, add line items with quantities and unit prices, specify discount and tax %.
   - Verify live calculation of Subtotal, Discount, Tax Amount, and Grand Total.
   - Submit and verify the quotation appears with a generated quotation number (e.g. `QT-202611-1001`).
   - Click to inspect line items, and test status transitions (`draft` → `sent` → `approved` / `rejected`).
5. **Tenant Isolation & CRM Integration:**
   - Verify that deals converted from CRM leads in Phase 4 appear seamlessly in Phase 5 Sales without duplicate entries.
   - Switch organizations in the header switcher and verify all deals and quotations are strictly isolated to the active organization.

---

## 9. Manual Verification Checklist (Phase 4 CRM)

1. **Inbound Lead Creation & Duplicate Prevention:**
   - In the sidebar, click **CRM & Leads**.
   - Click **New Lead**.
   - Enter `Acme Cloud Upgrade`, First Name `Alex`, Last Name `Mercer`, Email `alex@acme.com`, Company `Acme Corp`, and Estimated Value `15000.00`.
   - Click **Create Lead**. Verify the lead appears in both the **List** view and the **Pipeline** stages view under **New Inbound**.
   - Click **New Lead** again and type `alex@acme.com` — observe the yellow duplicate detection warning alert indicating a matching lead exists.
2. **Visual Pipeline Stages & Lead Details:**
   - Switch to **Pipeline** view to observe cards grouped by status (`New`, `Contacted`, `Qualified`, `Unqualified`, `Converted`, `Lost`).
   - Click on the lead card to open the **Lead Detail** dialog.
   - Update the status to `Qualified` and assign the lead to a team member. Verify status badge and activity timeline update.
3. **Log Interactions & Scheduled Follow-ups:**
   - Inside the Lead Detail dialog, click **Log Activity**.
   - Select `Follow-up Reminder`, enter `Follow-up call on security requirements`, set a scheduled datetime, and submit.
   - Switch to the **Follow-ups & Activities** tab in CRM; observe the pending item and click **Complete** to verify state toggle.
4. **Lead Conversion Flow (Transactional):**
   - In the Lead Detail dialog, click **Convert Lead**.
   - In the conversion wizard, verify options to create or attach to Account, create Contact, and create Opportunity.
   - Click **Confirm & Convert**.
   - Verify that:
     - Lead status transitions to `Converted`.
     - The customer company appears in **Accounts & Companies**.
     - The contact appears in **Contacts**.
     - All prior lead activities and notes are preserved.
     - An in-app notification is delivered to the Notification Drawer.
5. **Soft Deletion & Tenant Boundary:**
   - Verify that soft-deleted records disappear from normal listing endpoints.
   - Verify that switching organizations in the header isolates all leads, contacts, and accounts completely.

---

## 8. Phase 4 Capabilities & Endpoints (CRM & Lead Management)

### Leads Management & Pipeline
- `GET /api/crm/leads` — Paginated list of leads with full-text search, status filter (`new`, `contacted`, `qualified`, `unqualified`, `converted`, `lost`), source filter, and owner assignment filter.
- `POST /api/crm/leads` — Create an inbound lead with title, contact info, source, estimated deal value, currency, and notes.
- `POST /api/crm/leads/check-duplicates` — Duplicate check across leads, contacts, and accounts matching email, phone, or company name.
- `GET /api/crm/leads/:id` — Retrieve lead details including interaction history and assigned team member.
- `PATCH /api/crm/leads/:id` — Update lead attributes and transition pipeline status (with automatic activity recording).
- `POST /api/crm/leads/:id/assign` — Reassign lead to an active organization team member and trigger in-app assignment notification.
- `POST /api/crm/leads/:id/convert` — Transactionally convert an eligible lead into an Account, Contact, and optional Sales Opportunity while preserving all prior interaction history.
- `DELETE /api/crm/leads/:id` — Soft-delete lead record (`deletedAt` set).

### Customer Contacts
- `GET /api/crm/contacts` — Paginated customer contacts directory with search and company filter.
- `POST /api/crm/contacts` — Create a new customer contact associated with a company account.
- `GET /api/crm/contacts/:id` — Retrieve contact details.
- `PATCH /api/crm/contacts/:id` — Update contact information.
- `DELETE /api/crm/contacts/:id` — Soft-delete contact.

### Accounts & Companies
- `GET /api/crm/accounts` — Paginated company accounts directory with industry filter.
- `POST /api/crm/accounts` — Register a corporate customer/account.
- `GET /api/crm/accounts/:id` — Retrieve account details and associated contact count.
- `PATCH /api/crm/accounts/:id` — Update account details.
- `DELETE /api/crm/accounts/:id` — Soft-delete account.

### CRM Activities & Follow-ups
- `GET /api/crm/activities` — Paginated CRM interaction timeline filtered by lead, contact, account, type (`note`, `call`, `meeting`, `follow_up`, `task`), or status (`pending`, `completed`).
- `POST /api/crm/activities` — Log a call/meeting/note or schedule a future follow-up with reminder notification.
- `PATCH /api/crm/activities/:id` — Update activity or mark follow-up as completed.

### Opportunities (Future Sales Integration Interface)
- `GET /api/crm/opportunities` — Paginated list of opportunities created during lead conversions, ready for Phase 5 sales pipeline integration.

---

## 9. Manual Verification Checklist (Phase 4 CRM)

1. **Inbound Lead Creation & Duplicate Prevention:**
   - In the sidebar, click **CRM & Leads**.
   - Click **New Lead**.
   - Enter `Acme Cloud Upgrade`, First Name `Alex`, Last Name `Mercer`, Email `alex@acme.com`, Company `Acme Corp`, and Estimated Value `15000.00`.
   - Click **Create Lead**. Verify the lead appears in both the **List** view and the **Pipeline** stages view under **New Inbound**.
   - Click **New Lead** again and type `alex@acme.com` — observe the yellow duplicate detection warning alert indicating a matching lead exists.
2. **Visual Pipeline Stages & Lead Details:**
   - Switch to **Pipeline** view to observe cards grouped by status (`New`, `Contacted`, `Qualified`, `Unqualified`, `Converted`, `Lost`).
   - Click on the lead card to open the **Lead Detail** dialog.
   - Update the status to `Qualified` and assign the lead to a team member. Verify status badge and activity timeline update.
3. **Log Interactions & Scheduled Follow-ups:**
   - Inside the Lead Detail dialog, click **Log Activity**.
   - Select `Follow-up Reminder`, enter `Follow-up call on security requirements`, set a scheduled datetime, and submit.
   - Switch to the **Follow-ups & Activities** tab in CRM; observe the pending item and click **Complete** to verify state toggle.
4. **Lead Conversion Flow (Transactional):**
   - In the Lead Detail dialog, click **Convert Lead**.
   - In the conversion wizard, verify options to create or attach to Account, create Contact, and create Opportunity.
   - Click **Confirm & Convert**.
   - Verify that:
     - Lead status transitions to `Converted`.
     - The customer company appears in **Accounts & Companies**.
     - The contact appears in **Contacts**.
     - All prior lead activities and notes are preserved.
     - An in-app notification is delivered to the Notification Drawer.
5. **Soft Deletion & Tenant Boundary:**
   - Verify that soft-deleted records disappear from normal listing endpoints.
   - Verify that switching organizations in the header isolates all leads, contacts, and accounts completely.

---

## 8. Manual Verification Checklist (Phase 3)

1. **In-App Notification Drawer:**
   - In the top header bar, locate the Bell icon.
   - Click the bell to toggle open the Notification Drawer.
   - Verify unread count badge, mark-as-read button, and "Mark all as read" capability.
2. **File Metadata & Private Signed URLs:**
   - In "Settings & Team", click the "Files & Storage" tab.
   - Click "Register File", enter file name and MIME type, select visibility scope (`organization` or `private`), and submit.
   - Verify the file appears in the list with calculated human-readable size.
   - Click "Access URL" to generate a time-limited HMAC-signed private download URL and copy it.
   - Test soft deletion by clicking the trash icon.
3. **Activity Timeline:**
   - Switch to the "Activity Timeline" tab.
   - Verify that actions (file registration, organization switching, member operations) appear in reverse-chronological order.
   - Test searching by action name and filtering by resource type.
4. **Security Audit Trail (Admin / Owner):**
   - Switch to the "Audit Logs" tab.
   - Verify client IP address attribution, timestamp, and sanitized security payloads.
   - Confirm standard `Member` users cannot view this tab or query the `/api/audit-logs` endpoint.
5. **Search & Pagination:**
   - Test the `PaginationBar` and `SearchFilterBar` controls across Files, Activities, and Audit Logs.


---

## 20. Phase 10: Executive Dashboard & Analytics Endpoints

The Executive Dashboard & Analytics module (`/api/analytics`) unifies verified business intelligence across all implemented platform modules (CRM, Sales, Finance, Projects, Marketing, and HR) with zero-mock calculations, strict multi-tenant scoping, and role-based confidentiality:

### Reconciled Executive Dashboard
- `GET /api/analytics/dashboard` — Aggregates cross-domain operational and financial metrics.
  - **Query parameters:** `dateRange` (`all`, `today`, `this_week`, `this_month`, `this_quarter`, `this_year`, `custom`), `startDate` (ISO YYYY-MM-DD), `endDate` (ISO YYYY-MM-DD).
  - **Domain Coverage:** CRM inbound leads & conversion rates, Sales pipeline funnel & weighted forecasts, Operational Finance cash flow & receivables, Project task completion & overdue rates, Marketing budget utilization & lead attribution, HR workforce headcount & attendance rates, plus recent organization-wide activity feed.
  - **Role-Aware Security:** Standard `member` users receive operational metrics with sensitive financial figures (`totalIncome`, `totalExpenses`, `netOperatingBalance`, `outstandingInvoicesAmount`, `overdueInvoicesAmount`, `monthlyCashFlow: []`) and sensitive HR details safely redacted to `null`, flagged with `isFinanceRestricted: true` / `isHrRestricted: true`. Full figures are visible to `owner` and `admin` roles.

### Cross-Domain Tabular Reports
- `GET /api/analytics/reports/:reportType` — Generates structured tabular reports with column definitions, formatted rows, and summary totals.
  - **Supported Report Types:**
    - `executive_summary`: Cross-domain synthesis across all 6 core business modules.
    - `sales_pipeline`: Detailed deal stages, amounts, probability weights, and closing horizons.
    - `financial_cashflow`: Verified transactions, categories, payment methods, and invoice balances.
    - `project_delivery`: Project health, completion progress, milestones, and open tasks.
    - `marketing_attribution`: Channel allocations, actual spend, budget variance, and attributed leads.
    - `workforce_overview`: Department staffing, designations, joining dates, and attendance records.
  - **Authorization:** `financial_cashflow` and `workforce_overview` return `403 Forbidden` for standard `member` users.

### Tabular CSV Data Export
- `GET /api/analytics/export/:reportType` — Streams downloadable CSV export of the requested report type.
  - **Headers:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename="<reportType>-report-<timestamp>.csv"`.
  - **Content:** Header row, properly escaped RFC 4180 CSV rows, and calculated summary totals.
  - **Authorization:** Enforces the same role-based confidentiality rules as the report endpoint.

---

## 21. Manual Verification Checklist (Phase 10 Executive Dashboard & Analytics)

1. **Executive Dashboard Navigation & Time Horizon Filtering:**
   - In the sidebar, click **Analytics & KPIs**.
   - Notice the top summary banner indicating "Phase 10 Active — Executive Dashboard & Analytics".
   - Use the time horizon pills (`All Time`, `Today`, `This Week`, `This Month`, `This Quarter`, `This Year`, `Custom`) to adjust filtering.
   - For `Custom`, choose start and end dates and verify that metrics update accordingly.
2. **Cross-Domain Reconciled KPI Metrics:**
   - Verify that CRM metrics (Inbound Leads, Conversion Rate, Top Lead Sources) reconcile directly with records created in Phase 4.
   - Verify that Sales metrics (Pipeline Value, Weighted Forecast, Win Rate, Stage Funnel) reconcile with deals in Phase 5.
   - Verify that Project metrics (Active Projects, Completion Rate, Tasks by Status) reflect Phase 7 tasks and milestones.
   - Verify that Marketing metrics (Budget Utilization, Attributed Leads, Channel Breakdown) reconcile with Phase 8 campaigns.
3. **Role-Aware Security & Financial Data Confidentiality:**
   - As an `Admin` or `Owner`, observe that Operational Finance figures (Income, Expenses, Net Cash Flow, Receivables, Overdue Invoices) and HR presence details are fully populated with exact values and trend charts.
   - Log in or switch to a user with `Member` role in the organization.
   - Visit the **Analytics & KPIs** dashboard and observe that the Finance card shows a locked shield banner ("Financial Metrics Restricted: Requires Owner or Admin permissions") and sensitive figures are masked.
4. **Cross-Domain Report Generation & Column Formats:**
   - Switch to the **Cross-Domain Reports & Exports** tab.
   - Select each report type in sequence:
     - `Executive Summary (Cross-Domain)`: Multi-domain syntheses with summary row.
     - `Sales Pipeline & Conversion`: Deal names, accounts, values, probabilities, and forecasts.
     - `Financial Cash Flow & Invoices`: Incomes, expenses, and invoice records with currency formatting.
     - `Project Delivery & Productivity`: Project progress, open tasks, and overdue indicators.
     - `Marketing Campaigns & Attribution`: Channels, budgets, spend, and verified attributed leads.
     - `Workforce & Attendance Overview`: Departments, positions, and attendance records.
   - Verify that non-admin members receive a clear, friendly 403 Forbidden alert when attempting to generate restricted financial or workforce reports.
5. **CSV Export Download:**
   - Select a report (e.g. `Executive Summary` or `Sales Pipeline & Conversion`).
   - Click the green **Export CSV** button.
   - Verify that the browser downloads a valid `.csv` file with matching columns, records, and summary line.
6. **KPI Methodology & Transparent Governance:**
   - Switch to the **KPI Methodology & Formulas** tab.
   - Review the documented formulas, primary source database entities, time-horizon filter criteria, and access control rules for all business indicators.
7. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher.
   - Verify that all analytics calculations, pipeline values, and exported reports strictly isolate to the currently active organization context.


---

## 20. Phase 10: Executive Dashboard & Analytics Endpoints

The Executive Dashboard & Analytics module (`/api/analytics`) unifies verified business intelligence across all implemented platform modules (CRM, Sales, Finance, Projects, Marketing, and HR) with zero-mock calculations, strict multi-tenant scoping, and role-based confidentiality:

### Reconciled Executive Dashboard
- `GET /api/analytics/dashboard` — Aggregates cross-domain operational and financial metrics.
  - **Query parameters:** `dateRange` (`all`, `today`, `this_week`, `this_month`, `this_quarter`, `this_year`, `custom`), `startDate` (ISO YYYY-MM-DD), `endDate` (ISO YYYY-MM-DD).
  - **Domain Coverage:** CRM inbound leads & conversion rates, Sales pipeline funnel & weighted forecasts, Operational Finance cash flow & receivables, Project task completion & overdue rates, Marketing budget utilization & lead attribution, HR workforce headcount & attendance rates, plus recent organization-wide activity feed.
  - **Role-Aware Security:** Standard `member` users receive operational metrics with sensitive financial figures (`totalIncome`, `totalExpenses`, `netOperatingBalance`, `outstandingInvoicesAmount`, `overdueInvoicesAmount`, `monthlyCashFlow: []`) and sensitive HR details safely redacted to `null`, flagged with `isFinanceRestricted: true` / `isHrRestricted: true`. Full figures are visible to `owner` and `admin` roles.

### Cross-Domain Tabular Reports
- `GET /api/analytics/reports/:reportType` — Generates structured tabular reports with column definitions, formatted rows, and summary totals.
  - **Supported Report Types:**
    - `executive_summary`: Cross-domain synthesis across all 6 core business modules.
    - `sales_pipeline`: Detailed deal stages, amounts, probability weights, and closing horizons.
    - `financial_cashflow`: Verified transactions, categories, payment methods, and invoice balances.
    - `project_delivery`: Project health, completion progress, milestones, and open tasks.
    - `marketing_attribution`: Channel allocations, actual spend, budget variance, and attributed leads.
    - `workforce_overview`: Department staffing, designations, joining dates, and attendance records.
  - **Authorization:** `financial_cashflow` and `workforce_overview` return `403 Forbidden` for standard `member` users.

### Tabular CSV Data Export
- `GET /api/analytics/export/:reportType` — Streams downloadable CSV export of the requested report type.
  - **Headers:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename="<reportType>-report-<timestamp>.csv"`.
  - **Content:** Header row, properly escaped RFC 4180 CSV rows, and calculated summary totals.
  - **Authorization:** Enforces the same role-based confidentiality rules as the report endpoint.

---

## 21. Manual Verification Checklist (Phase 10 Executive Dashboard & Analytics)

1. **Executive Dashboard Navigation & Time Horizon Filtering:**
   - In the sidebar, click **Analytics & KPIs**.
   - Notice the top summary banner indicating "Phase 10 Active — Executive Dashboard & Analytics".
   - Use the time horizon pills (`All Time`, `Today`, `This Week`, `This Month`, `This Quarter`, `This Year`, `Custom`) to adjust filtering.
   - For `Custom`, choose start and end dates and verify that metrics update accordingly.
2. **Cross-Domain Reconciled KPI Metrics:**
   - Verify that CRM metrics (Inbound Leads, Conversion Rate, Top Lead Sources) reconcile directly with records created in Phase 4.
   - Verify that Sales metrics (Pipeline Value, Weighted Forecast, Win Rate, Stage Funnel) reconcile with deals in Phase 5.
   - Verify that Project metrics (Active Projects, Completion Rate, Tasks by Status) reflect Phase 7 tasks and milestones.
   - Verify that Marketing metrics (Budget Utilization, Attributed Leads, Channel Breakdown) reconcile with Phase 8 campaigns.
3. **Role-Aware Security & Financial Data Confidentiality:**
   - As an `Admin` or `Owner`, observe that Operational Finance figures (Income, Expenses, Net Cash Flow, Receivables, Overdue Invoices) and HR presence details are fully populated with exact values and trend charts.
   - Log in or switch to a user with `Member` role in the organization.
   - Visit the **Analytics & KPIs** dashboard and observe that the Finance card shows a locked shield banner ("Financial Metrics Restricted: Requires Owner or Admin permissions") and sensitive figures are masked.
4. **Cross-Domain Report Generation & Column Formats:**
   - Switch to the **Cross-Domain Reports & Exports** tab.
   - Select each report type in sequence:
     - `Executive Summary (Cross-Domain)`: Multi-domain syntheses with summary row.
     - `Sales Pipeline & Conversion`: Deal names, accounts, values, probabilities, and forecasts.
     - `Financial Cash Flow & Invoices`: Incomes, expenses, and invoice records with currency formatting.
     - `Project Delivery & Productivity`: Project progress, open tasks, and overdue indicators.
     - `Marketing Campaigns & Attribution`: Channels, budgets, spend, and verified attributed leads.
     - `Workforce & Attendance Overview`: Departments, positions, and attendance records.
   - Verify that non-admin members receive a clear, friendly 403 Forbidden alert when attempting to generate restricted financial or workforce reports.
5. **CSV Export Download:**
   - Select a report (e.g. `Executive Summary` or `Sales Pipeline & Conversion`).
   - Click the green **Export CSV** button.
   - Verify that the browser downloads a valid `.csv` file with matching columns, records, and summary line.
6. **KPI Methodology & Transparent Governance:**
   - Switch to the **KPI Methodology & Formulas** tab.
   - Review the documented formulas, primary source database entities, time-horizon filter criteria, and access control rules for all business indicators.
7. **Multi-Tenant Boundary:**
   - Switch organizations in the top header switcher.
   - Verify that all analytics calculations, pipeline values, and exported reports strictly isolate to the currently active organization context.
