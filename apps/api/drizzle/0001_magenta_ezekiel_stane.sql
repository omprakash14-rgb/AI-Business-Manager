CREATE TABLE "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"actor_id" uuid,
	"resource_type" varchar(50) NOT NULL,
	"resource_id" varchar(100) NOT NULL,
	"action" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"uploaded_by_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_key" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"storage_provider" varchar(50) DEFAULT 'local-private' NOT NULL,
	"visibility" varchar(30) DEFAULT 'organization' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "files_file_key_unique" UNIQUE("file_key")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"type" varchar(50) DEFAULT 'system' NOT NULL,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_org_id" ON "activity_events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_activity_resource" ON "activity_events" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "idx_activity_created_at" ON "activity_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_files_org_id" ON "files" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_files_file_key" ON "files" USING btree ("file_key");--> statement-breakpoint
CREATE INDEX "idx_files_deleted_at" ON "files" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_org_user_read" ON "notifications" USING btree ("organization_id","user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");