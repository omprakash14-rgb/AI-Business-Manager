CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"status" varchar(50) DEFAULT 'present' NOT NULL,
	"check_in_time" timestamp with time zone,
	"check_out_time" timestamp with time zone,
	"notes" text,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_emp_date_uniq" UNIQUE("organization_id","employee_id","date")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(20),
	"description" text,
	"manager_id" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "designations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"department_id" uuid,
	"title" varchar(100) NOT NULL,
	"code" varchar(20),
	"description" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"employee_number" varchar(50) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"work_email" varchar(255) NOT NULL,
	"work_phone" varchar(50),
	"department_id" uuid,
	"designation_id" uuid,
	"reporting_manager_id" uuid,
	"employment_type" varchar(50) DEFAULT 'full_time' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"joining_date" timestamp with time zone NOT NULL,
	"termination_date" timestamp with time zone,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "emp_org_number_uniq" UNIQUE("organization_id","employee_number")
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type" varchar(50) NOT NULL,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10) NOT NULL,
	"days_count" numeric(4, 1) NOT NULL,
	"reason" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"approved_by_id" uuid,
	"approval_notes" text,
	"decided_at" timestamp with time zone,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designations" ADD CONSTRAINT "designations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designations" ADD CONSTRAINT "designations_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_designation_id_designations_id_fk" FOREIGN KEY ("designation_id") REFERENCES "public"."designations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_attendance_org_date" ON "attendance_records" USING btree ("organization_id","date");--> statement-breakpoint
CREATE INDEX "idx_attendance_emp" ON "attendance_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_departments_org" ON "departments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_departments_name" ON "departments" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "idx_departments_deleted" ON "departments" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_designations_org" ON "designations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_designations_dept" ON "designations" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "idx_designations_deleted" ON "designations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_employees_org" ON "employees" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_employees_user" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_employees_dept" ON "employees" USING btree ("organization_id","department_id");--> statement-breakpoint
CREATE INDEX "idx_employees_status" ON "employees" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_employees_deleted" ON "employees" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_leaves_org" ON "leave_requests" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_leaves_emp" ON "leave_requests" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_leaves_status" ON "leave_requests" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_leaves_dates" ON "leave_requests" USING btree ("organization_id","start_date","end_date");