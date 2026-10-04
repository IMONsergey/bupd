import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_blocks_editorial_text_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_projects_blocks_editorial_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_projects_blocks_editorial_text_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_projects_blocks_media_frame_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_projects_blocks_media_frame_aspect" AS ENUM('auto', 'landscape', 'classic', 'square', 'portrait');
  CREATE TYPE "public"."enum_projects_blocks_media_frame_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_projects_blocks_media_frame_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_projects_blocks_media_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_projects_blocks_media_grid_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_projects_blocks_media_grid_aspect" AS ENUM('auto', 'landscape', 'classic', 'square', 'portrait');
  CREATE TYPE "public"."enum_projects_blocks_media_grid_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_projects_blocks_text_columns_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_projects_blocks_text_columns_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_projects_blocks_project_facts_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_projects_blocks_project_facts_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_projects_blocks_section_break_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__projects_v_blocks_editorial_text_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__projects_v_blocks_editorial_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__projects_v_blocks_editorial_text_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__projects_v_blocks_media_frame_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__projects_v_blocks_media_frame_aspect" AS ENUM('auto', 'landscape', 'classic', 'square', 'portrait');
  CREATE TYPE "public"."enum__projects_v_blocks_media_frame_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__projects_v_blocks_media_frame_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__projects_v_blocks_media_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__projects_v_blocks_media_grid_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__projects_v_blocks_media_grid_aspect" AS ENUM('auto', 'landscape', 'classic', 'square', 'portrait');
  CREATE TYPE "public"."enum__projects_v_blocks_media_grid_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__projects_v_blocks_text_columns_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__projects_v_blocks_text_columns_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__projects_v_blocks_project_facts_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__projects_v_blocks_project_facts_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__projects_v_blocks_section_break_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_case_templates_blocks_editorial_text_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_case_templates_blocks_editorial_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_case_templates_blocks_editorial_text_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_case_templates_blocks_media_frame_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_case_templates_blocks_media_frame_aspect" AS ENUM('auto', 'landscape', 'classic', 'square', 'portrait');
  CREATE TYPE "public"."enum_case_templates_blocks_media_frame_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_case_templates_blocks_media_frame_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_case_templates_blocks_media_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_case_templates_blocks_media_grid_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_case_templates_blocks_media_grid_aspect" AS ENUM('auto', 'landscape', 'classic', 'square', 'portrait');
  CREATE TYPE "public"."enum_case_templates_blocks_media_grid_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_case_templates_blocks_text_columns_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_case_templates_blocks_text_columns_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_case_templates_blocks_project_facts_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum_case_templates_blocks_project_facts_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum_case_templates_blocks_section_break_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__case_templates_v_blocks_editorial_text_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__case_templates_v_blocks_editorial_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__case_templates_v_blocks_editorial_text_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__case_templates_v_blocks_media_frame_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__case_templates_v_blocks_media_frame_aspect" AS ENUM('auto', 'landscape', 'classic', 'square', 'portrait');
  CREATE TYPE "public"."enum__case_templates_v_blocks_media_frame_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__case_templates_v_blocks_media_frame_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__case_templates_v_blocks_media_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__case_templates_v_blocks_media_grid_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__case_templates_v_blocks_media_grid_aspect" AS ENUM('auto', 'landscape', 'classic', 'square', 'portrait');
  CREATE TYPE "public"."enum__case_templates_v_blocks_media_grid_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__case_templates_v_blocks_text_columns_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__case_templates_v_blocks_text_columns_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__case_templates_v_blocks_project_facts_width" AS ENUM('full', 'wide', 'reading');
  CREATE TYPE "public"."enum__case_templates_v_blocks_project_facts_spacing" AS ENUM('none', 'small', 'medium', 'large');
  CREATE TYPE "public"."enum__case_templates_v_blocks_section_break_width" AS ENUM('full', 'wide', 'reading');
  CREATE TABLE "projects_blocks_editorial_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "body" jsonb,
    "width" "enum_projects_blocks_editorial_text_width" DEFAULT 'wide',
    "align" "enum_projects_blocks_editorial_text_align" DEFAULT 'left',
    "spacing" "enum_projects_blocks_editorial_text_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "projects_blocks_media_frame" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "width" "enum_projects_blocks_media_frame_width" DEFAULT 'wide',
    "aspect" "enum_projects_blocks_media_frame_aspect" DEFAULT 'auto',
    "align" "enum_projects_blocks_media_frame_align" DEFAULT 'left',
    "spacing" "enum_projects_blocks_media_frame_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "projects_blocks_media_grid_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "projects_blocks_media_grid" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "columns" "enum_projects_blocks_media_grid_columns" DEFAULT '2',
    "gap" numeric DEFAULT 16,
    "width" "enum_projects_blocks_media_grid_width" DEFAULT 'wide',
    "aspect" "enum_projects_blocks_media_grid_aspect" DEFAULT 'auto',
    "spacing" "enum_projects_blocks_media_grid_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "projects_blocks_text_columns_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" varchar
  );

  CREATE TABLE "projects_blocks_text_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "width" "enum_projects_blocks_text_columns_width" DEFAULT 'wide',
    "spacing" "enum_projects_blocks_text_columns_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "projects_blocks_project_facts_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" varchar
  );

  CREATE TABLE "projects_blocks_project_facts" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "width" "enum_projects_blocks_project_facts_width" DEFAULT 'wide',
    "spacing" "enum_projects_blocks_project_facts_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "projects_blocks_section_break" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "line" boolean DEFAULT false,
    "height" numeric DEFAULT 80,
    "width" "enum_projects_blocks_section_break_width" DEFAULT 'wide',
    "block_name" varchar
  );

  CREATE TABLE "_projects_v_blocks_editorial_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "body" jsonb,
    "width" "enum__projects_v_blocks_editorial_text_width" DEFAULT 'wide',
    "align" "enum__projects_v_blocks_editorial_text_align" DEFAULT 'left',
    "spacing" "enum__projects_v_blocks_editorial_text_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_projects_v_blocks_media_frame" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "width" "enum__projects_v_blocks_media_frame_width" DEFAULT 'wide',
    "aspect" "enum__projects_v_blocks_media_frame_aspect" DEFAULT 'auto',
    "align" "enum__projects_v_blocks_media_frame_align" DEFAULT 'left',
    "spacing" "enum__projects_v_blocks_media_frame_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_projects_v_blocks_media_grid_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_projects_v_blocks_media_grid" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "columns" "enum__projects_v_blocks_media_grid_columns" DEFAULT '2',
    "gap" numeric DEFAULT 16,
    "width" "enum__projects_v_blocks_media_grid_width" DEFAULT 'wide',
    "aspect" "enum__projects_v_blocks_media_grid_aspect" DEFAULT 'auto',
    "spacing" "enum__projects_v_blocks_media_grid_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_projects_v_blocks_text_columns_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_projects_v_blocks_text_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "width" "enum__projects_v_blocks_text_columns_width" DEFAULT 'wide',
    "spacing" "enum__projects_v_blocks_text_columns_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_projects_v_blocks_project_facts_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_projects_v_blocks_project_facts" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "width" "enum__projects_v_blocks_project_facts_width" DEFAULT 'wide',
    "spacing" "enum__projects_v_blocks_project_facts_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_projects_v_blocks_section_break" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "line" boolean DEFAULT false,
    "height" numeric DEFAULT 80,
    "width" "enum__projects_v_blocks_section_break_width" DEFAULT 'wide',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "case_templates_blocks_editorial_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "body" jsonb,
    "width" "enum_case_templates_blocks_editorial_text_width" DEFAULT 'wide',
    "align" "enum_case_templates_blocks_editorial_text_align" DEFAULT 'left',
    "spacing" "enum_case_templates_blocks_editorial_text_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "case_templates_blocks_media_frame" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "width" "enum_case_templates_blocks_media_frame_width" DEFAULT 'wide',
    "aspect" "enum_case_templates_blocks_media_frame_aspect" DEFAULT 'auto',
    "align" "enum_case_templates_blocks_media_frame_align" DEFAULT 'left',
    "spacing" "enum_case_templates_blocks_media_frame_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "case_templates_blocks_media_grid_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "case_templates_blocks_media_grid" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "columns" "enum_case_templates_blocks_media_grid_columns" DEFAULT '2',
    "gap" numeric DEFAULT 16,
    "width" "enum_case_templates_blocks_media_grid_width" DEFAULT 'wide',
    "aspect" "enum_case_templates_blocks_media_grid_aspect" DEFAULT 'auto',
    "spacing" "enum_case_templates_blocks_media_grid_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "case_templates_blocks_text_columns_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" varchar
  );

  CREATE TABLE "case_templates_blocks_text_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "width" "enum_case_templates_blocks_text_columns_width" DEFAULT 'wide',
    "spacing" "enum_case_templates_blocks_text_columns_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "case_templates_blocks_project_facts_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" varchar
  );

  CREATE TABLE "case_templates_blocks_project_facts" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "width" "enum_case_templates_blocks_project_facts_width" DEFAULT 'wide',
    "spacing" "enum_case_templates_blocks_project_facts_spacing" DEFAULT 'medium',
    "block_name" varchar
  );

  CREATE TABLE "case_templates_blocks_section_break" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "line" boolean DEFAULT false,
    "height" numeric DEFAULT 80,
    "width" "enum_case_templates_blocks_section_break_width" DEFAULT 'wide',
    "block_name" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_editorial_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "body" jsonb,
    "width" "enum__case_templates_v_blocks_editorial_text_width" DEFAULT 'wide',
    "align" "enum__case_templates_v_blocks_editorial_text_align" DEFAULT 'left',
    "spacing" "enum__case_templates_v_blocks_editorial_text_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_media_frame" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "width" "enum__case_templates_v_blocks_media_frame_width" DEFAULT 'wide',
    "aspect" "enum__case_templates_v_blocks_media_frame_aspect" DEFAULT 'auto',
    "align" "enum__case_templates_v_blocks_media_frame_align" DEFAULT 'left',
    "spacing" "enum__case_templates_v_blocks_media_frame_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_media_grid_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_media_grid" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "columns" "enum__case_templates_v_blocks_media_grid_columns" DEFAULT '2',
    "gap" numeric DEFAULT 16,
    "width" "enum__case_templates_v_blocks_media_grid_width" DEFAULT 'wide',
    "aspect" "enum__case_templates_v_blocks_media_grid_aspect" DEFAULT 'auto',
    "spacing" "enum__case_templates_v_blocks_media_grid_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_text_columns_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_text_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "width" "enum__case_templates_v_blocks_text_columns_width" DEFAULT 'wide',
    "spacing" "enum__case_templates_v_blocks_text_columns_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_project_facts_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_project_facts" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "width" "enum__case_templates_v_blocks_project_facts_width" DEFAULT 'wide',
    "spacing" "enum__case_templates_v_blocks_project_facts_spacing" DEFAULT 'medium',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_case_templates_v_blocks_section_break" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "line" boolean DEFAULT false,
    "height" numeric DEFAULT 80,
    "width" "enum__case_templates_v_blocks_section_break_width" DEFAULT 'wide',
    "_uuid" varchar,
    "block_name" varchar
  );

  ALTER TABLE "projects" ADD COLUMN "page_background" varchar;
  ALTER TABLE "projects" ADD COLUMN "media_radius" numeric;
  ALTER TABLE "_projects_v" ADD COLUMN "version_page_background" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_media_radius" numeric;
  ALTER TABLE "articles" ADD COLUMN "page_background" varchar;
  ALTER TABLE "articles" ADD COLUMN "media_radius" numeric;
  ALTER TABLE "_articles_v" ADD COLUMN "version_page_background" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_media_radius" numeric;
  ALTER TABLE "projects_blocks_editorial_text" ADD CONSTRAINT "projects_blocks_editorial_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_frame" ADD CONSTRAINT "projects_blocks_media_frame_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_frame" ADD CONSTRAINT "projects_blocks_media_frame_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_grid_items" ADD CONSTRAINT "projects_blocks_media_grid_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_grid_items" ADD CONSTRAINT "projects_blocks_media_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_media_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_grid" ADD CONSTRAINT "projects_blocks_media_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text_columns_items" ADD CONSTRAINT "projects_blocks_text_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_text_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text_columns" ADD CONSTRAINT "projects_blocks_text_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_project_facts_items" ADD CONSTRAINT "projects_blocks_project_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_project_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_project_facts" ADD CONSTRAINT "projects_blocks_project_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_section_break" ADD CONSTRAINT "projects_blocks_section_break_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_editorial_text" ADD CONSTRAINT "_projects_v_blocks_editorial_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_frame" ADD CONSTRAINT "_projects_v_blocks_media_frame_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_frame" ADD CONSTRAINT "_projects_v_blocks_media_frame_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_grid_items" ADD CONSTRAINT "_projects_v_blocks_media_grid_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_grid_items" ADD CONSTRAINT "_projects_v_blocks_media_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_media_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_grid" ADD CONSTRAINT "_projects_v_blocks_media_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text_columns_items" ADD CONSTRAINT "_projects_v_blocks_text_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_text_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text_columns" ADD CONSTRAINT "_projects_v_blocks_text_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_project_facts_items" ADD CONSTRAINT "_projects_v_blocks_project_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_project_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_project_facts" ADD CONSTRAINT "_projects_v_blocks_project_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_section_break" ADD CONSTRAINT "_projects_v_blocks_section_break_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_editorial_text" ADD CONSTRAINT "case_templates_blocks_editorial_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_media_frame" ADD CONSTRAINT "case_templates_blocks_media_frame_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_media_frame" ADD CONSTRAINT "case_templates_blocks_media_frame_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_media_grid_items" ADD CONSTRAINT "case_templates_blocks_media_grid_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_media_grid_items" ADD CONSTRAINT "case_templates_blocks_media_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_media_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_media_grid" ADD CONSTRAINT "case_templates_blocks_media_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_text_columns_items" ADD CONSTRAINT "case_templates_blocks_text_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_text_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_text_columns" ADD CONSTRAINT "case_templates_blocks_text_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_project_facts_items" ADD CONSTRAINT "case_templates_blocks_project_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_project_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_project_facts" ADD CONSTRAINT "case_templates_blocks_project_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_section_break" ADD CONSTRAINT "case_templates_blocks_section_break_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_editorial_text" ADD CONSTRAINT "_case_templates_v_blocks_editorial_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_media_frame" ADD CONSTRAINT "_case_templates_v_blocks_media_frame_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_media_frame" ADD CONSTRAINT "_case_templates_v_blocks_media_frame_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_media_grid_items" ADD CONSTRAINT "_case_templates_v_blocks_media_grid_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_media_grid_items" ADD CONSTRAINT "_case_templates_v_blocks_media_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v_blocks_media_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_media_grid" ADD CONSTRAINT "_case_templates_v_blocks_media_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_text_columns_items" ADD CONSTRAINT "_case_templates_v_blocks_text_columns_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v_blocks_text_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_text_columns" ADD CONSTRAINT "_case_templates_v_blocks_text_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_project_facts_items" ADD CONSTRAINT "_case_templates_v_blocks_project_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v_blocks_project_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_project_facts" ADD CONSTRAINT "_case_templates_v_blocks_project_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_templates_v_blocks_section_break" ADD CONSTRAINT "_case_templates_v_blocks_section_break_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_templates_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_blocks_editorial_text_order_idx" ON "projects_blocks_editorial_text" USING btree ("_order");
  CREATE INDEX "projects_blocks_editorial_text_parent_id_idx" ON "projects_blocks_editorial_text" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_editorial_text_path_idx" ON "projects_blocks_editorial_text" USING btree ("_path");
  CREATE INDEX "projects_blocks_media_frame_order_idx" ON "projects_blocks_media_frame" USING btree ("_order");
  CREATE INDEX "projects_blocks_media_frame_parent_id_idx" ON "projects_blocks_media_frame" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_media_frame_path_idx" ON "projects_blocks_media_frame" USING btree ("_path");
  CREATE INDEX "projects_blocks_media_frame_media_idx" ON "projects_blocks_media_frame" USING btree ("media_id");
  CREATE INDEX "projects_blocks_media_grid_items_order_idx" ON "projects_blocks_media_grid_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_media_grid_items_parent_id_idx" ON "projects_blocks_media_grid_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_media_grid_items_media_idx" ON "projects_blocks_media_grid_items" USING btree ("media_id");
  CREATE INDEX "projects_blocks_media_grid_order_idx" ON "projects_blocks_media_grid" USING btree ("_order");
  CREATE INDEX "projects_blocks_media_grid_parent_id_idx" ON "projects_blocks_media_grid" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_media_grid_path_idx" ON "projects_blocks_media_grid" USING btree ("_path");
  CREATE INDEX "projects_blocks_text_columns_items_order_idx" ON "projects_blocks_text_columns_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_text_columns_items_parent_id_idx" ON "projects_blocks_text_columns_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_text_columns_order_idx" ON "projects_blocks_text_columns" USING btree ("_order");
  CREATE INDEX "projects_blocks_text_columns_parent_id_idx" ON "projects_blocks_text_columns" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_text_columns_path_idx" ON "projects_blocks_text_columns" USING btree ("_path");
  CREATE INDEX "projects_blocks_project_facts_items_order_idx" ON "projects_blocks_project_facts_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_project_facts_items_parent_id_idx" ON "projects_blocks_project_facts_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_project_facts_order_idx" ON "projects_blocks_project_facts" USING btree ("_order");
  CREATE INDEX "projects_blocks_project_facts_parent_id_idx" ON "projects_blocks_project_facts" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_project_facts_path_idx" ON "projects_blocks_project_facts" USING btree ("_path");
  CREATE INDEX "projects_blocks_section_break_order_idx" ON "projects_blocks_section_break" USING btree ("_order");
  CREATE INDEX "projects_blocks_section_break_parent_id_idx" ON "projects_blocks_section_break" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_section_break_path_idx" ON "projects_blocks_section_break" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_editorial_text_order_idx" ON "_projects_v_blocks_editorial_text" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_editorial_text_parent_id_idx" ON "_projects_v_blocks_editorial_text" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_editorial_text_path_idx" ON "_projects_v_blocks_editorial_text" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_media_frame_order_idx" ON "_projects_v_blocks_media_frame" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_media_frame_parent_id_idx" ON "_projects_v_blocks_media_frame" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_media_frame_path_idx" ON "_projects_v_blocks_media_frame" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_media_frame_media_idx" ON "_projects_v_blocks_media_frame" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_media_grid_items_order_idx" ON "_projects_v_blocks_media_grid_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_media_grid_items_parent_id_idx" ON "_projects_v_blocks_media_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_media_grid_items_media_idx" ON "_projects_v_blocks_media_grid_items" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_media_grid_order_idx" ON "_projects_v_blocks_media_grid" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_media_grid_parent_id_idx" ON "_projects_v_blocks_media_grid" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_media_grid_path_idx" ON "_projects_v_blocks_media_grid" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_text_columns_items_order_idx" ON "_projects_v_blocks_text_columns_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_text_columns_items_parent_id_idx" ON "_projects_v_blocks_text_columns_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_text_columns_order_idx" ON "_projects_v_blocks_text_columns" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_text_columns_parent_id_idx" ON "_projects_v_blocks_text_columns" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_text_columns_path_idx" ON "_projects_v_blocks_text_columns" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_project_facts_items_order_idx" ON "_projects_v_blocks_project_facts_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_project_facts_items_parent_id_idx" ON "_projects_v_blocks_project_facts_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_project_facts_order_idx" ON "_projects_v_blocks_project_facts" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_project_facts_parent_id_idx" ON "_projects_v_blocks_project_facts" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_project_facts_path_idx" ON "_projects_v_blocks_project_facts" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_section_break_order_idx" ON "_projects_v_blocks_section_break" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_section_break_parent_id_idx" ON "_projects_v_blocks_section_break" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_section_break_path_idx" ON "_projects_v_blocks_section_break" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_editorial_text_order_idx" ON "case_templates_blocks_editorial_text" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_editorial_text_parent_id_idx" ON "case_templates_blocks_editorial_text" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_editorial_text_path_idx" ON "case_templates_blocks_editorial_text" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_media_frame_order_idx" ON "case_templates_blocks_media_frame" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_media_frame_parent_id_idx" ON "case_templates_blocks_media_frame" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_media_frame_path_idx" ON "case_templates_blocks_media_frame" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_media_frame_media_idx" ON "case_templates_blocks_media_frame" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_media_grid_items_order_idx" ON "case_templates_blocks_media_grid_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_media_grid_items_parent_id_idx" ON "case_templates_blocks_media_grid_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_media_grid_items_media_idx" ON "case_templates_blocks_media_grid_items" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_media_grid_order_idx" ON "case_templates_blocks_media_grid" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_media_grid_parent_id_idx" ON "case_templates_blocks_media_grid" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_media_grid_path_idx" ON "case_templates_blocks_media_grid" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_text_columns_items_order_idx" ON "case_templates_blocks_text_columns_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_text_columns_items_parent_id_idx" ON "case_templates_blocks_text_columns_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_text_columns_order_idx" ON "case_templates_blocks_text_columns" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_text_columns_parent_id_idx" ON "case_templates_blocks_text_columns" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_text_columns_path_idx" ON "case_templates_blocks_text_columns" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_project_facts_items_order_idx" ON "case_templates_blocks_project_facts_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_project_facts_items_parent_id_idx" ON "case_templates_blocks_project_facts_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_project_facts_order_idx" ON "case_templates_blocks_project_facts" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_project_facts_parent_id_idx" ON "case_templates_blocks_project_facts" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_project_facts_path_idx" ON "case_templates_blocks_project_facts" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_section_break_order_idx" ON "case_templates_blocks_section_break" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_section_break_parent_id_idx" ON "case_templates_blocks_section_break" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_section_break_path_idx" ON "case_templates_blocks_section_break" USING btree ("_path");
  CREATE INDEX "_case_templates_v_blocks_editorial_text_order_idx" ON "_case_templates_v_blocks_editorial_text" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_editorial_text_parent_id_idx" ON "_case_templates_v_blocks_editorial_text" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_editorial_text_path_idx" ON "_case_templates_v_blocks_editorial_text" USING btree ("_path");
  CREATE INDEX "_case_templates_v_blocks_media_frame_order_idx" ON "_case_templates_v_blocks_media_frame" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_media_frame_parent_id_idx" ON "_case_templates_v_blocks_media_frame" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_media_frame_path_idx" ON "_case_templates_v_blocks_media_frame" USING btree ("_path");
  CREATE INDEX "_case_templates_v_blocks_media_frame_media_idx" ON "_case_templates_v_blocks_media_frame" USING btree ("media_id");
  CREATE INDEX "_case_templates_v_blocks_media_grid_items_order_idx" ON "_case_templates_v_blocks_media_grid_items" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_media_grid_items_parent_id_idx" ON "_case_templates_v_blocks_media_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_media_grid_items_media_idx" ON "_case_templates_v_blocks_media_grid_items" USING btree ("media_id");
  CREATE INDEX "_case_templates_v_blocks_media_grid_order_idx" ON "_case_templates_v_blocks_media_grid" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_media_grid_parent_id_idx" ON "_case_templates_v_blocks_media_grid" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_media_grid_path_idx" ON "_case_templates_v_blocks_media_grid" USING btree ("_path");
  CREATE INDEX "_case_templates_v_blocks_text_columns_items_order_idx" ON "_case_templates_v_blocks_text_columns_items" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_text_columns_items_parent_id_idx" ON "_case_templates_v_blocks_text_columns_items" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_text_columns_order_idx" ON "_case_templates_v_blocks_text_columns" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_text_columns_parent_id_idx" ON "_case_templates_v_blocks_text_columns" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_text_columns_path_idx" ON "_case_templates_v_blocks_text_columns" USING btree ("_path");
  CREATE INDEX "_case_templates_v_blocks_project_facts_items_order_idx" ON "_case_templates_v_blocks_project_facts_items" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_project_facts_items_parent_id_idx" ON "_case_templates_v_blocks_project_facts_items" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_project_facts_order_idx" ON "_case_templates_v_blocks_project_facts" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_project_facts_parent_id_idx" ON "_case_templates_v_blocks_project_facts" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_project_facts_path_idx" ON "_case_templates_v_blocks_project_facts" USING btree ("_path");
  CREATE INDEX "_case_templates_v_blocks_section_break_order_idx" ON "_case_templates_v_blocks_section_break" USING btree ("_order");
  CREATE INDEX "_case_templates_v_blocks_section_break_parent_id_idx" ON "_case_templates_v_blocks_section_break" USING btree ("_parent_id");
  CREATE INDEX "_case_templates_v_blocks_section_break_path_idx" ON "_case_templates_v_blocks_section_break" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_blocks_editorial_text" CASCADE;
  DROP TABLE "projects_blocks_media_frame" CASCADE;
  DROP TABLE "projects_blocks_media_grid_items" CASCADE;
  DROP TABLE "projects_blocks_media_grid" CASCADE;
  DROP TABLE "projects_blocks_text_columns_items" CASCADE;
  DROP TABLE "projects_blocks_text_columns" CASCADE;
  DROP TABLE "projects_blocks_project_facts_items" CASCADE;
  DROP TABLE "projects_blocks_project_facts" CASCADE;
  DROP TABLE "projects_blocks_section_break" CASCADE;
  DROP TABLE "_projects_v_blocks_editorial_text" CASCADE;
  DROP TABLE "_projects_v_blocks_media_frame" CASCADE;
  DROP TABLE "_projects_v_blocks_media_grid_items" CASCADE;
  DROP TABLE "_projects_v_blocks_media_grid" CASCADE;
  DROP TABLE "_projects_v_blocks_text_columns_items" CASCADE;
  DROP TABLE "_projects_v_blocks_text_columns" CASCADE;
  DROP TABLE "_projects_v_blocks_project_facts_items" CASCADE;
  DROP TABLE "_projects_v_blocks_project_facts" CASCADE;
  DROP TABLE "_projects_v_blocks_section_break" CASCADE;
  DROP TABLE "case_templates_blocks_editorial_text" CASCADE;
  DROP TABLE "case_templates_blocks_media_frame" CASCADE;
  DROP TABLE "case_templates_blocks_media_grid_items" CASCADE;
  DROP TABLE "case_templates_blocks_media_grid" CASCADE;
  DROP TABLE "case_templates_blocks_text_columns_items" CASCADE;
  DROP TABLE "case_templates_blocks_text_columns" CASCADE;
  DROP TABLE "case_templates_blocks_project_facts_items" CASCADE;
  DROP TABLE "case_templates_blocks_project_facts" CASCADE;
  DROP TABLE "case_templates_blocks_section_break" CASCADE;
  DROP TABLE "_case_templates_v_blocks_editorial_text" CASCADE;
  DROP TABLE "_case_templates_v_blocks_media_frame" CASCADE;
  DROP TABLE "_case_templates_v_blocks_media_grid_items" CASCADE;
  DROP TABLE "_case_templates_v_blocks_media_grid" CASCADE;
  DROP TABLE "_case_templates_v_blocks_text_columns_items" CASCADE;
  DROP TABLE "_case_templates_v_blocks_text_columns" CASCADE;
  DROP TABLE "_case_templates_v_blocks_project_facts_items" CASCADE;
  DROP TABLE "_case_templates_v_blocks_project_facts" CASCADE;
  DROP TABLE "_case_templates_v_blocks_section_break" CASCADE;
  ALTER TABLE "projects" DROP COLUMN "page_background";
  ALTER TABLE "projects" DROP COLUMN "media_radius";
  ALTER TABLE "_projects_v" DROP COLUMN "version_page_background";
  ALTER TABLE "_projects_v" DROP COLUMN "version_media_radius";
  ALTER TABLE "articles" DROP COLUMN "page_background";
  ALTER TABLE "articles" DROP COLUMN "media_radius";
  ALTER TABLE "_articles_v" DROP COLUMN "version_page_background";
  ALTER TABLE "_articles_v" DROP COLUMN "version_media_radius";
  DROP TYPE "public"."enum_projects_blocks_editorial_text_width";
  DROP TYPE "public"."enum_projects_blocks_editorial_text_align";
  DROP TYPE "public"."enum_projects_blocks_editorial_text_spacing";
  DROP TYPE "public"."enum_projects_blocks_media_frame_width";
  DROP TYPE "public"."enum_projects_blocks_media_frame_aspect";
  DROP TYPE "public"."enum_projects_blocks_media_frame_align";
  DROP TYPE "public"."enum_projects_blocks_media_frame_spacing";
  DROP TYPE "public"."enum_projects_blocks_media_grid_columns";
  DROP TYPE "public"."enum_projects_blocks_media_grid_width";
  DROP TYPE "public"."enum_projects_blocks_media_grid_aspect";
  DROP TYPE "public"."enum_projects_blocks_media_grid_spacing";
  DROP TYPE "public"."enum_projects_blocks_text_columns_width";
  DROP TYPE "public"."enum_projects_blocks_text_columns_spacing";
  DROP TYPE "public"."enum_projects_blocks_project_facts_width";
  DROP TYPE "public"."enum_projects_blocks_project_facts_spacing";
  DROP TYPE "public"."enum_projects_blocks_section_break_width";
  DROP TYPE "public"."enum__projects_v_blocks_editorial_text_width";
  DROP TYPE "public"."enum__projects_v_blocks_editorial_text_align";
  DROP TYPE "public"."enum__projects_v_blocks_editorial_text_spacing";
  DROP TYPE "public"."enum__projects_v_blocks_media_frame_width";
  DROP TYPE "public"."enum__projects_v_blocks_media_frame_aspect";
  DROP TYPE "public"."enum__projects_v_blocks_media_frame_align";
  DROP TYPE "public"."enum__projects_v_blocks_media_frame_spacing";
  DROP TYPE "public"."enum__projects_v_blocks_media_grid_columns";
  DROP TYPE "public"."enum__projects_v_blocks_media_grid_width";
  DROP TYPE "public"."enum__projects_v_blocks_media_grid_aspect";
  DROP TYPE "public"."enum__projects_v_blocks_media_grid_spacing";
  DROP TYPE "public"."enum__projects_v_blocks_text_columns_width";
  DROP TYPE "public"."enum__projects_v_blocks_text_columns_spacing";
  DROP TYPE "public"."enum__projects_v_blocks_project_facts_width";
  DROP TYPE "public"."enum__projects_v_blocks_project_facts_spacing";
  DROP TYPE "public"."enum__projects_v_blocks_section_break_width";
  DROP TYPE "public"."enum_case_templates_blocks_editorial_text_width";
  DROP TYPE "public"."enum_case_templates_blocks_editorial_text_align";
  DROP TYPE "public"."enum_case_templates_blocks_editorial_text_spacing";
  DROP TYPE "public"."enum_case_templates_blocks_media_frame_width";
  DROP TYPE "public"."enum_case_templates_blocks_media_frame_aspect";
  DROP TYPE "public"."enum_case_templates_blocks_media_frame_align";
  DROP TYPE "public"."enum_case_templates_blocks_media_frame_spacing";
  DROP TYPE "public"."enum_case_templates_blocks_media_grid_columns";
  DROP TYPE "public"."enum_case_templates_blocks_media_grid_width";
  DROP TYPE "public"."enum_case_templates_blocks_media_grid_aspect";
  DROP TYPE "public"."enum_case_templates_blocks_media_grid_spacing";
  DROP TYPE "public"."enum_case_templates_blocks_text_columns_width";
  DROP TYPE "public"."enum_case_templates_blocks_text_columns_spacing";
  DROP TYPE "public"."enum_case_templates_blocks_project_facts_width";
  DROP TYPE "public"."enum_case_templates_blocks_project_facts_spacing";
  DROP TYPE "public"."enum_case_templates_blocks_section_break_width";
  DROP TYPE "public"."enum__case_templates_v_blocks_editorial_text_width";
  DROP TYPE "public"."enum__case_templates_v_blocks_editorial_text_align";
  DROP TYPE "public"."enum__case_templates_v_blocks_editorial_text_spacing";
  DROP TYPE "public"."enum__case_templates_v_blocks_media_frame_width";
  DROP TYPE "public"."enum__case_templates_v_blocks_media_frame_aspect";
  DROP TYPE "public"."enum__case_templates_v_blocks_media_frame_align";
  DROP TYPE "public"."enum__case_templates_v_blocks_media_frame_spacing";
  DROP TYPE "public"."enum__case_templates_v_blocks_media_grid_columns";
  DROP TYPE "public"."enum__case_templates_v_blocks_media_grid_width";
  DROP TYPE "public"."enum__case_templates_v_blocks_media_grid_aspect";
  DROP TYPE "public"."enum__case_templates_v_blocks_media_grid_spacing";
  DROP TYPE "public"."enum__case_templates_v_blocks_text_columns_width";
  DROP TYPE "public"."enum__case_templates_v_blocks_text_columns_spacing";
  DROP TYPE "public"."enum__case_templates_v_blocks_project_facts_width";
  DROP TYPE "public"."enum__case_templates_v_blocks_project_facts_spacing";
  DROP TYPE "public"."enum__case_templates_v_blocks_section_break_width";`)
}
