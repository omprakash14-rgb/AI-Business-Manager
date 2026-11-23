CREATE TABLE "opportunity_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"from_stage" varchar(50),
	"to_stage" varchar(50) NOT NULL,
	"changed_by_user_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"description" varchar(255) NOT NULL,
	"quantity" numeric(12, 2) DEFAULT '1.00' NOT NULL,
	"unit_price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"account_id" uuid,
	"contact_id" uuid,
	"quotation_number" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"tax_percent" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"tax_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"valid_until" timestamp with time zone,
	"notes" text,
	"terms" text,
	"created_by_id" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "win_loss_reason" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "opportunity_stage_history" ADD CONSTRAINT "opportunity_stage_history_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_stage_history" ADD CONSTRAINT "opportunity_stage_history_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_stage_history" ADD CONSTRAINT "opportunity_stage_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_opp_history_opp_id" ON "opportunity_stage_history" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "idx_opp_history_org_id" ON "opportunity_stage_history" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_opp_history_created_at" ON "opportunity_stage_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_quotation_items_quotation_id" ON "quotation_items" USING btree ("quotation_id");--> statement-breakpoint
CREATE INDEX "idx_quotation_items_org_id" ON "quotation_items" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_quotations_org_id" ON "quotations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_quotations_opp_id" ON "quotations" USING btree ("organization_id","opportunity_id");--> statement-breakpoint
CREATE INDEX "idx_quotations_status" ON "quotations" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_quotations_number" ON "quotations" USING btree ("organization_id","quotation_number");--> statement-breakpoint
CREATE INDEX "idx_quotations_created_at" ON "quotations" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_quotations_deleted_at" ON "quotations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_opportunities_deleted_at" ON "opportunities" USING btree ("deleted_at");