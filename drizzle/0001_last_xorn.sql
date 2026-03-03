CREATE TYPE "public"."job_status" AS ENUM('pending', 'valid', 'invalid', 'error');--> statement-breakpoint
CREATE TYPE "public"."resume_status" AS ENUM('pending', 'complete', 'error');--> statement-breakpoint
CREATE TABLE "job" (
	"id" text PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"content" text,
	"analyzed_at" timestamp,
	"invalid_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "job_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "resume" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"url" varchar NOT NULL,
	"job_id" text,
	"status" "resume_status" DEFAULT 'pending' NOT NULL,
	"analysis" jsonb NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "resume" ADD CONSTRAINT "resume_job_id_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume" ADD CONSTRAINT "resume_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;