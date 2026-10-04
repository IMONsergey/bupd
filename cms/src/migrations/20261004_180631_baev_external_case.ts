import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_body_mode" AS ENUM('blocks', 'embed');
  CREATE TYPE "public"."enum__projects_v_version_body_mode" AS ENUM('blocks', 'embed');
  ALTER TABLE "projects" ADD COLUMN "body_mode" "enum_projects_body_mode" DEFAULT 'blocks';
  ALTER TABLE "projects" ADD COLUMN "embed_u_r_l" varchar;
  ALTER TABLE "projects" ADD COLUMN "embed_height" numeric DEFAULT 6000;
  ALTER TABLE "projects" ADD COLUMN "embed_mobile_height" numeric DEFAULT 9000;
  ALTER TABLE "projects" ADD COLUMN "embed_auto_height" boolean DEFAULT false;
  ALTER TABLE "_projects_v" ADD COLUMN "version_body_mode" "enum__projects_v_version_body_mode" DEFAULT 'blocks';
  ALTER TABLE "_projects_v" ADD COLUMN "version_embed_u_r_l" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_embed_height" numeric DEFAULT 6000;
  ALTER TABLE "_projects_v" ADD COLUMN "version_embed_mobile_height" numeric DEFAULT 9000;
  ALTER TABLE "_projects_v" ADD COLUMN "version_embed_auto_height" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "body_mode";
  ALTER TABLE "projects" DROP COLUMN "embed_u_r_l";
  ALTER TABLE "projects" DROP COLUMN "embed_height";
  ALTER TABLE "projects" DROP COLUMN "embed_mobile_height";
  ALTER TABLE "projects" DROP COLUMN "embed_auto_height";
  ALTER TABLE "_projects_v" DROP COLUMN "version_body_mode";
  ALTER TABLE "_projects_v" DROP COLUMN "version_embed_u_r_l";
  ALTER TABLE "_projects_v" DROP COLUMN "version_embed_height";
  ALTER TABLE "_projects_v" DROP COLUMN "version_embed_mobile_height";
  ALTER TABLE "_projects_v" DROP COLUMN "version_embed_auto_height";
  DROP TYPE "public"."enum_projects_body_mode";
  DROP TYPE "public"."enum__projects_v_version_body_mode";`)
}
