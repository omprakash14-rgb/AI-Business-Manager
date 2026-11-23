CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"category_id" uuid,
	"period" varchar(20) DEFAULT 'quarterly' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"budget_amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"description" text,
	"created_by_user_id" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"color" varchar(20) DEFAULT '#64748b' NOT NULL,
	"description" varchar(255),
	"is_default" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"category_id" uuid NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"description" varchar(255) NOT NULL,
	"counterparty" varchar(255),
	"reference" varchar(100),
	"payment_method" varchar(50) DEFAULT 'bank_transfer' NOT NULL,
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"account_id" uuid,
	"invoice_id" uuid,
	"notes" text,
	"recorded_by_user_id" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"description" varchar(255) NOT NULL,
	"quantity" numeric(12, 2) DEFAULT '1.00' NOT NULL,
	"unit_price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"account_id" uuid NOT NULL,
	"contact_id" uuid,
	"opportunity_id" uuid,
	"quotation_id" uuid,
	"issue_date" timestamp with time zone DEFAULT now() NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"tax_percent" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"tax_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"paid_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"balance_due" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"terms" text,
	"created_by_user_id" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"payment_number" varchar(50) NOT NULL,
	"invoice_id" uuid,
	"account_id" uuid,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"payment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"payment_method" varchar(50) DEFAULT 'bank_transfer' NOT NULL,
	"reference" varchar(100),
	"notes" text,
	"status" varchar(50) DEFAULT 'completed' NOT NULL,
	"recorded_by_user_id" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_financial_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."financial_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_category_id_financial_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."financial_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_recorded_by_user_id_users_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_recorded_by_user_id_users_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_budgets_org" ON "budgets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_budgets_category" ON "budgets" USING btree ("organization_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_budgets_period" ON "budgets" USING btree ("organization_id","period");--> statement-breakpoint
CREATE INDEX "idx_budgets_dates" ON "budgets" USING btree ("organization_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_budgets_deleted" ON "budgets" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_fin_categories_org" ON "financial_categories" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_fin_categories_type" ON "financial_categories" USING btree ("organization_id","type");--> statement-breakpoint
CREATE INDEX "idx_fin_categories_deleted" ON "financial_categories" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_fin_tx_org" ON "financial_transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_fin_tx_type" ON "financial_transactions" USING btree ("organization_id","type");--> statement-breakpoint
CREATE INDEX "idx_fin_tx_category" ON "financial_transactions" USING btree ("organization_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_fin_tx_date" ON "financial_transactions" USING btree ("organization_id","date");--> statement-breakpoint
CREATE INDEX "idx_fin_tx_status" ON "financial_transactions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_fin_tx_account" ON "financial_transactions" USING btree ("organization_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_fin_tx_deleted" ON "financial_transactions" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_invoice_items_invoice" ON "invoice_line_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_items_org" ON "invoice_line_items" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_org" ON "invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_number" ON "invoices" USING btree ("organization_id","invoice_number");--> statement-breakpoint
CREATE INDEX "idx_invoices_account" ON "invoices" USING btree ("organization_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_invoices_due_date" ON "invoices" USING btree ("organization_id","due_date");--> statement-breakpoint
CREATE INDEX "idx_invoices_deleted" ON "invoices" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_payments_org" ON "payment_records" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_payments_invoice" ON "payment_records" USING btree ("organization_id","invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payments_account" ON "payment_records" USING btree ("organization_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_payments_date" ON "payment_records" USING btree ("organization_id","payment_date");--> statement-breakpoint
CREATE INDEX "idx_payments_deleted" ON "payment_records" USING btree ("deleted_at");