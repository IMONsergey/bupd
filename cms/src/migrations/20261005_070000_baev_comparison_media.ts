import {type MigrateUpArgs,type MigrateDownArgs,sql} from '@payloadcms/db-postgres'
export async function up({db}:MigrateUpArgs):Promise<void>{await db.execute(sql`ALTER TABLE "media" ADD COLUMN "source_protected" boolean DEFAULT false; UPDATE "media" SET "source_protected"=true;`)}
export async function down({db}:MigrateDownArgs):Promise<void>{await db.execute(sql`ALTER TABLE "media" DROP COLUMN "source_protected";`)}
