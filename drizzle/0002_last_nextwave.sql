ALTER TYPE "public"."job_status" ADD VALUE 'scraping' BEFORE 'valid';--> statement-breakpoint
ALTER TYPE "public"."job_status" ADD VALUE 'tailoring' BEFORE 'invalid';--> statement-breakpoint
ALTER TYPE "public"."job_status" ADD VALUE 'complete' BEFORE 'invalid';--> statement-breakpoint
ALTER TABLE "job" DROP CONSTRAINT "job_url_unique";--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "title" varchar;--> statement-breakpoint
ALTER TABLE "job" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_url_user_id_unique" UNIQUE("url","user_id");