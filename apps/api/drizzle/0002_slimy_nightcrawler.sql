CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"industry" varchar(100),
	"website" varchar(255),
	"phone" varchar(50),
	"email" varchar(255),
	"address" text,
	"assigned_to_id" uuid,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"account_id" uuid,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"job_title" varchar(100),
	"assigned_to_id" uuid,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid,
	"contact_id" uuid,
	"account_id" uuid,
	"type" varchar(50) DEFAULT 'note' NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text,
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"assigned_to_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) DEFAULT '' NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"company_name" varchar(200),
	"source" varchar(50) DEFAULT 'website' NOT NULL,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"assigned_to_id" uuid,
	"notes" text,
	"estimated_value" numeric(15, 2),
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"converted_at" timestamp with time zone,
	"converted_account_id" uuid,
	"converted_contact_id" uuid,
	"converted_opportunity_id" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"account_id" uuid,
	"contact_id" uuid,
	"lead_id" uuid,
	"amount" numeric(15, 2),
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"stage" varchar(50) DEFAULT 'prospecting' NOT NULL,
	"probability" integer DEFAULT 20 NOT NULL,
	"expected_close_date" timestamp with time zone,
	"assigned_to_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_account_id_accounts_id_fk" FOREIGN KEY ("converted_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_contact_id_contacts_id_fk" FOREIGN KEY ("converted_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounts_org_id" ON "accounts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_accounts_name" ON "accounts" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "idx_accounts_created_at" ON "accounts" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_accounts_deleted_at" ON "accounts" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_contacts_org_id" ON "contacts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_contacts_account_id" ON "contacts" USING btree ("organization_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_contacts_email" ON "contacts" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "idx_contacts_created_at" ON "contacts" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_contacts_deleted_at" ON "contacts" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_org_id" ON "crm_activities" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_lead" ON "crm_activities" USING btree ("organization_id","lead_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_contact" ON "crm_activities" USING btree ("organization_id","contact_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_account" ON "crm_activities" USING btree ("organization_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_scheduled" ON "crm_activities" USING btree ("organization_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_created_at" ON "crm_activities" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_leads_org_id" ON "leads" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_leads_status" ON "leads" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_leads_assigned_to" ON "leads" USING btree ("organization_id","assigned_to_id");--> statement-breakpoint
CREATE INDEX "idx_leads_email" ON "leads" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "idx_leads_created_at" ON "leads" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_leads_deleted_at" ON "leads" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_opportunities_org_id" ON "opportunities" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_opportunities_stage" ON "opportunities" USING btree ("organization_id","stage");--> statement-breakpoint
CREATE INDEX "idx_opportunities_account" ON "opportunities" USING btree ("organization_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_opportunities_created_at" ON "opportunities" USING btree ("organization_id","created_at");