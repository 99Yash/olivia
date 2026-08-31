CREATE TABLE "company_design_cache" (
	"domain" varchar(255) PRIMARY KEY NOT NULL,
	"profile" jsonb NOT NULL,
	"refreshed_at" timestamp DEFAULT now() NOT NULL
);
