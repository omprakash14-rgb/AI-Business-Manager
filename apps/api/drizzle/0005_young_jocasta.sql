CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(30) DEFAULT 'contributor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_user_uniq" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" text,
	"target_date" timestamp with time zone,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'planning' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"owner_id" uuid NOT NULL,
	"start_date" timestamp with time zone,
	"target_end_date" timestamp with time zone,
	"actual_end_date" timestamp with time zone,
	"account_id" uuid,
	"opportunity_id" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"task_id" uuid,
	"author_id" uuid NOT NULL,
	"content" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"milestone_id" uuid,
	"parent_task_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'todo' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"assignee_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"start_date" timestamp with time zone,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"estimated_hours" numeric(6, 2),
	"order_index" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_milestone_id_project_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."project_milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pm_project" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_pm_user" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pm_org" ON "project_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_milestones_project" ON "project_milestones" USING btree ("organization_id","project_id");--> statement-breakpoint
CREATE INDEX "idx_milestones_status" ON "project_milestones" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_milestones_deleted" ON "project_milestones" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_projects_org" ON "projects" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_projects_owner" ON "projects" USING btree ("organization_id","owner_id");--> statement-breakpoint
CREATE INDEX "idx_projects_account" ON "projects" USING btree ("organization_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_projects_opportunity" ON "projects" USING btree ("organization_id","opportunity_id");--> statement-breakpoint
CREATE INDEX "idx_projects_deleted" ON "projects" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_comments_task" ON "task_comments" USING btree ("organization_id","task_id");--> statement-breakpoint
CREATE INDEX "idx_comments_project" ON "task_comments" USING btree ("organization_id","project_id");--> statement-breakpoint
CREATE INDEX "idx_comments_deleted" ON "task_comments" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_project" ON "tasks" USING btree ("organization_id","project_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_milestone" ON "tasks" USING btree ("organization_id","milestone_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_parent" ON "tasks" USING btree ("organization_id","parent_task_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_tasks_assignee" ON "tasks" USING btree ("organization_id","assignee_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_due" ON "tasks" USING btree ("organization_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_tasks_deleted" ON "tasks" USING btree ("deleted_at");