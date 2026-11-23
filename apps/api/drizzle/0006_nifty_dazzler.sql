CREATE TABLE "campaign_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_lead_uniq" UNIQUE("campaign_id","lead_id")
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"type" varchar(50) DEFAULT 'inbound' NOT NULL,
	"channel" varchar(50) DEFAULT 'website' NOT NULL,
	"status" varchar(50) DEFAULT 'planned' NOT NULL,
	"objective" varchar(255),
	"description" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"budget" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"actual_cost" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"owner_id" uuid NOT NULL,
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign_leads" ADD CONSTRAINT "campaign_leads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_leads" ADD CONSTRAINT "campaign_leads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_leads" ADD CONSTRAINT "campaign_leads_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cl_campaign" ON "campaign_leads" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "idx_cl_lead" ON "campaign_leads" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_cl_org" ON "campaign_leads" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_campaigns_org" ON "campaigns" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_campaigns_status" ON "campaigns" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_campaigns_channel" ON "campaigns" USING btree ("organization_id","channel");--> statement-breakpoint
CREATE INDEX "idx_campaigns_dates" ON "campaigns" USING btree ("organization_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "idx_campaigns_deleted" ON "campaigns" USING btree ("deleted_at");