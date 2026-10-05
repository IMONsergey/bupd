import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "last_edited_by" varchar;
  ALTER TABLE "projects" ADD COLUMN "portfolio_order" numeric DEFAULT 100;
  ALTER TABLE "projects" ADD COLUMN "role" varchar;
  ALTER TABLE "projects" ADD COLUMN "audience" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_last_edited_by" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_portfolio_order" numeric DEFAULT 100;
  ALTER TABLE "_projects_v" ADD COLUMN "version_role" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_audience" varchar;
  ALTER TABLE "articles" ADD COLUMN "last_edited_by" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_last_edited_by" varchar;
  ALTER TABLE "leads" ADD COLUMN "submission_key" varchar;
  ALTER TABLE "leads" ADD COLUMN "submission_hash" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "public_content" jsonb;
  CREATE UNIQUE INDEX "leads_submission_key_idx" ON "leads" USING btree ("submission_key");
`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "leads_submission_key_idx";

  ALTER TABLE "projects" DROP COLUMN "last_edited_by";
  ALTER TABLE "projects" DROP COLUMN "portfolio_order";
  ALTER TABLE "projects" DROP COLUMN "role";
  ALTER TABLE "projects" DROP COLUMN "audience";
  ALTER TABLE "_projects_v" DROP COLUMN "version_last_edited_by";
  ALTER TABLE "_projects_v" DROP COLUMN "version_portfolio_order";
  ALTER TABLE "_projects_v" DROP COLUMN "version_role";
  ALTER TABLE "_projects_v" DROP COLUMN "version_audience";
  ALTER TABLE "articles" DROP COLUMN "last_edited_by";
  ALTER TABLE "_articles_v" DROP COLUMN "version_last_edited_by";
  ALTER TABLE "leads" DROP COLUMN "submission_key";
  ALTER TABLE "leads" DROP COLUMN "submission_hash";
  ALTER TABLE "site_settings" DROP COLUMN "public_content";`)
}
