ALTER TABLE "rabs" ALTER COLUMN "number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rabs" ADD COLUMN "profit_percent" numeric(5, 2) DEFAULT '0';