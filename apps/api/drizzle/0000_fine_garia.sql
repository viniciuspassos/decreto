CREATE TABLE "event_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"file_location" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "event_images_event_name_idx" ON "event_images" USING btree ("event_name");