import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_workflow_status" AS ENUM('draft', 'review', 'ready', 'paused');
  CREATE TYPE "public"."enum__projects_v_version_workflow_status" AS ENUM('draft', 'review', 'ready', 'paused');
  CREATE TYPE "public"."enum_case_templates_blocks_case_hero_layout" AS ENUM('editorial', 'media-first', 'fullscreen');
  CREATE TYPE "public"."enum_case_templates_blocks_case_hero_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_manifesto_size" AS ENUM('m', 'l', 'xl', 'display');
  CREATE TYPE "public"."enum_case_templates_blocks_manifesto_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_case_templates_blocks_manifesto_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_full_bleed_media_height" AS ENUM('auto', '70vh', 'screen', '120vh');
  CREATE TYPE "public"."enum_case_templates_blocks_full_bleed_media_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_case_templates_blocks_full_bleed_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_split_media_ratio" AS ENUM('1-1', '1-2', '2-1');
  CREATE TYPE "public"."enum_case_templates_blocks_split_media_gap" AS ENUM('none', 'xs', 's', 'm');
  CREATE TYPE "public"."enum_case_templates_blocks_split_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_media_mosaic_items_span" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_case_templates_blocks_media_mosaic_layout" AS ENUM('editorial', 'grid', 'rail', 'staggered');
  CREATE TYPE "public"."enum_case_templates_blocks_media_mosaic_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_sticky_story_pin" AS ENUM('copy', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_sticky_story_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_metrics_style" AS ENUM('rail', 'cards', 'oversized');
  CREATE TYPE "public"."enum_case_templates_blocks_metrics_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_before_after_mode" AS ENUM('drag', 'toggle', 'split');
  CREATE TYPE "public"."enum_case_templates_blocks_before_after_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_quote_size" AS ENUM('l', 'xl', 'display');
  CREATE TYPE "public"."enum_case_templates_blocks_quote_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_process_mode" AS ENUM('timeline', 'accordion', 'sticky');
  CREATE TYPE "public"."enum_case_templates_blocks_process_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_gallery_mode" AS ENUM('drag', 'cursor', 'stack', 'filmstrip');
  CREATE TYPE "public"."enum_case_templates_blocks_gallery_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_device_showcase_device" AS ENUM('none', 'browser', 'phone', 'screen', 'print');
  CREATE TYPE "public"."enum_case_templates_blocks_device_showcase_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_credits_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_next_project_mode" AS ENUM('cover', 'minimal');
  CREATE TYPE "public"."enum_case_templates_blocks_next_project_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_horizontal_story_mode" AS ENUM('snap', 'scrub');
  CREATE TYPE "public"."enum_case_templates_blocks_horizontal_story_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_layered_media_mode" AS ENUM('stack', 'parallax', 'float');
  CREATE TYPE "public"."enum_case_templates_blocks_layered_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_typography_takeover_mode" AS ENUM('center', 'edge', 'marquee');
  CREATE TYPE "public"."enum_case_templates_blocks_typography_takeover_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_case_templates_blocks_typography_takeover_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_video_chapter_mode" AS ENUM('inline', 'full', 'sticky');
  CREATE TYPE "public"."enum_case_templates_blocks_video_chapter_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_comparison_mode" AS ENUM('columns', 'table', 'cards');
  CREATE TYPE "public"."enum_case_templates_blocks_comparison_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_artifact_stack_mode" AS ENUM('fan', 'stack', 'spread');
  CREATE TYPE "public"."enum_case_templates_blocks_artifact_stack_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_text_media_layout" AS ENUM('text-left', 'text-right', 'balanced');
  CREATE TYPE "public"."enum_case_templates_blocks_text_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_cta_mode" AS ENUM('minimal', 'statement', 'media');
  CREATE TYPE "public"."enum_case_templates_blocks_cta_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_case_templates_page_theme" AS ENUM('dark', 'light');
  CREATE TABLE "case_templates_blocks_case_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"dek" varchar,
  	"media_id" integer NOT NULL,
  	"layout" "enum_case_templates_blocks_case_hero_layout" DEFAULT 'editorial',
  	"theme" "enum_case_templates_blocks_case_hero_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_manifesto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"text" varchar NOT NULL,
  	"size" "enum_case_templates_blocks_manifesto_size" DEFAULT 'xl',
  	"align" "enum_case_templates_blocks_manifesto_align" DEFAULT 'left',
  	"theme" "enum_case_templates_blocks_manifesto_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_full_bleed_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"caption" varchar,
  	"height" "enum_case_templates_blocks_full_bleed_media_height" DEFAULT 'screen',
  	"fit" "enum_case_templates_blocks_full_bleed_media_fit" DEFAULT 'cover',
  	"theme" "enum_case_templates_blocks_full_bleed_media_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_split_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_id" integer NOT NULL,
  	"right_id" integer NOT NULL,
  	"ratio" "enum_case_templates_blocks_split_media_ratio" DEFAULT '1-1',
  	"gap" "enum_case_templates_blocks_split_media_gap" DEFAULT 's',
  	"theme" "enum_case_templates_blocks_split_media_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_media_mosaic_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"caption" varchar,
  	"span" "enum_case_templates_blocks_media_mosaic_items_span" DEFAULT '1'
  );
  
  CREATE TABLE "case_templates_blocks_media_mosaic" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_case_templates_blocks_media_mosaic_layout" DEFAULT 'editorial',
  	"theme" "enum_case_templates_blocks_media_mosaic_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_sticky_story_frames" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "case_templates_blocks_sticky_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"chapter" varchar,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"pin" "enum_case_templates_blocks_sticky_story_pin" DEFAULT 'copy',
  	"theme" "enum_case_templates_blocks_sticky_story_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_metrics_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "case_templates_blocks_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_case_templates_blocks_metrics_style" DEFAULT 'rail',
  	"theme" "enum_case_templates_blocks_metrics_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"before_id" integer NOT NULL,
  	"after_id" integer NOT NULL,
  	"before_label" varchar DEFAULT 'До',
  	"after_label" varchar DEFAULT 'После',
  	"mode" "enum_case_templates_blocks_before_after_mode" DEFAULT 'drag',
  	"theme" "enum_case_templates_blocks_before_after_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"author" varchar,
  	"role" varchar,
  	"size" "enum_case_templates_blocks_quote_size" DEFAULT 'xl',
  	"theme" "enum_case_templates_blocks_quote_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "case_templates_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_case_templates_blocks_process_mode" DEFAULT 'timeline',
  	"theme" "enum_case_templates_blocks_process_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "case_templates_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_case_templates_blocks_gallery_mode" DEFAULT 'drag',
  	"theme" "enum_case_templates_blocks_gallery_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_device_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"device" "enum_case_templates_blocks_device_showcase_device" DEFAULT 'none',
  	"caption" varchar,
  	"float" boolean DEFAULT true,
  	"theme" "enum_case_templates_blocks_device_showcase_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_credits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "case_templates_blocks_credits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Команда',
  	"theme" "enum_case_templates_blocks_credits_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_next_project" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"project_id" integer NOT NULL,
  	"label" varchar DEFAULT 'Следующий проект',
  	"mode" "enum_case_templates_blocks_next_project_mode" DEFAULT 'cover',
  	"theme" "enum_case_templates_blocks_next_project_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_horizontal_story_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"title" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "case_templates_blocks_horizontal_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_case_templates_blocks_horizontal_story_mode" DEFAULT 'snap',
  	"theme" "enum_case_templates_blocks_horizontal_story_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_layered_media_layers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"x" numeric DEFAULT 50,
  	"y" numeric DEFAULT 50,
  	"width" numeric DEFAULT 60,
  	"depth" numeric DEFAULT 1
  );
  
  CREATE TABLE "case_templates_blocks_layered_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_case_templates_blocks_layered_media_mode" DEFAULT 'parallax',
  	"theme" "enum_case_templates_blocks_layered_media_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_typography_takeover" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"text" varchar NOT NULL,
  	"mode" "enum_case_templates_blocks_typography_takeover_mode" DEFAULT 'center',
  	"accent_word" varchar,
  	"align" "enum_case_templates_blocks_typography_takeover_align" DEFAULT 'left',
  	"theme" "enum_case_templates_blocks_typography_takeover_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_video_chapter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer NOT NULL,
  	"poster_id" integer,
  	"title" varchar,
  	"caption" varchar,
  	"mode" "enum_case_templates_blocks_video_chapter_mode" DEFAULT 'inline',
  	"autoplay" boolean DEFAULT true,
  	"loop" boolean DEFAULT true,
  	"theme" "enum_case_templates_blocks_video_chapter_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_comparison_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"value" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "case_templates_blocks_comparison" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_case_templates_blocks_comparison_mode" DEFAULT 'columns',
  	"theme" "enum_case_templates_blocks_comparison_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_artifact_stack_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "case_templates_blocks_artifact_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_case_templates_blocks_artifact_stack_mode" DEFAULT 'fan',
  	"theme" "enum_case_templates_blocks_artifact_stack_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_text_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar NOT NULL,
  	"body" jsonb,
  	"media_id" integer NOT NULL,
  	"layout" "enum_case_templates_blocks_text_media_layout" DEFAULT 'text-left',
  	"theme" "enum_case_templates_blocks_text_media_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"button_label" varchar DEFAULT 'Обсудить проект',
  	"button_u_r_l" varchar DEFAULT '/contact',
  	"media_id" integer,
  	"mode" "enum_case_templates_blocks_cta_mode" DEFAULT 'statement',
  	"theme" "enum_case_templates_blocks_cta_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "case_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"page_theme" "enum_case_templates_page_theme" DEFAULT 'dark',
  	"accent" varchar DEFAULT '#ffffff',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "projects" ALTER COLUMN "kind" SET DATA TYPE text;
  ALTER TABLE "projects" ALTER COLUMN "kind" SET DEFAULT 'project'::text;
  DROP TYPE "public"."enum_projects_kind";
  CREATE TYPE "public"."enum_projects_kind" AS ENUM('project');
  ALTER TABLE "projects" ALTER COLUMN "kind" SET DEFAULT 'project'::"public"."enum_projects_kind";
  ALTER TABLE "projects" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_projects_kind" USING "kind"::"public"."enum_projects_kind";
  ALTER TABLE "_projects_v" ALTER COLUMN "version_kind" SET DATA TYPE text;
  ALTER TABLE "_projects_v" ALTER COLUMN "version_kind" SET DEFAULT 'project'::text;
  DROP TYPE "public"."enum__projects_v_version_kind";
  CREATE TYPE "public"."enum__projects_v_version_kind" AS ENUM('project');
  ALTER TABLE "_projects_v" ALTER COLUMN "version_kind" SET DEFAULT 'project'::"public"."enum__projects_v_version_kind";
  ALTER TABLE "_projects_v" ALTER COLUMN "version_kind" SET DATA TYPE "public"."enum__projects_v_version_kind" USING "version_kind"::"public"."enum__projects_v_version_kind";
  ALTER TABLE "projects" ADD COLUMN "workflow_status" "enum_projects_workflow_status" DEFAULT 'draft';
  ALTER TABLE "projects" ADD COLUMN "owner_id" integer;
  ALTER TABLE "projects" ADD COLUMN "deadline" timestamp(3) with time zone;
  ALTER TABLE "_projects_v" ADD COLUMN "version_workflow_status" "enum__projects_v_version_workflow_status" DEFAULT 'draft';
  ALTER TABLE "_projects_v" ADD COLUMN "version_owner_id" integer;
  ALTER TABLE "_projects_v" ADD COLUMN "version_deadline" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "case_templates_id" integer;
  ALTER TABLE "case_templates_blocks_case_hero" ADD CONSTRAINT "case_templates_blocks_case_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_case_hero" ADD CONSTRAINT "case_templates_blocks_case_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_manifesto" ADD CONSTRAINT "case_templates_blocks_manifesto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_full_bleed_media" ADD CONSTRAINT "case_templates_blocks_full_bleed_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_full_bleed_media" ADD CONSTRAINT "case_templates_blocks_full_bleed_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_split_media" ADD CONSTRAINT "case_templates_blocks_split_media_left_id_media_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_split_media" ADD CONSTRAINT "case_templates_blocks_split_media_right_id_media_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_split_media" ADD CONSTRAINT "case_templates_blocks_split_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_media_mosaic_items" ADD CONSTRAINT "case_templates_blocks_media_mosaic_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_media_mosaic_items" ADD CONSTRAINT "case_templates_blocks_media_mosaic_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_media_mosaic"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_media_mosaic" ADD CONSTRAINT "case_templates_blocks_media_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_sticky_story_frames" ADD CONSTRAINT "case_templates_blocks_sticky_story_frames_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_sticky_story_frames" ADD CONSTRAINT "case_templates_blocks_sticky_story_frames_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_sticky_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_sticky_story" ADD CONSTRAINT "case_templates_blocks_sticky_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_metrics_items" ADD CONSTRAINT "case_templates_blocks_metrics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_metrics" ADD CONSTRAINT "case_templates_blocks_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_before_after" ADD CONSTRAINT "case_templates_blocks_before_after_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_before_after" ADD CONSTRAINT "case_templates_blocks_before_after_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_before_after" ADD CONSTRAINT "case_templates_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_quote" ADD CONSTRAINT "case_templates_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_process_steps" ADD CONSTRAINT "case_templates_blocks_process_steps_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_process_steps" ADD CONSTRAINT "case_templates_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_process" ADD CONSTRAINT "case_templates_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_gallery_items" ADD CONSTRAINT "case_templates_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_gallery_items" ADD CONSTRAINT "case_templates_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_gallery" ADD CONSTRAINT "case_templates_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_device_showcase" ADD CONSTRAINT "case_templates_blocks_device_showcase_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_device_showcase" ADD CONSTRAINT "case_templates_blocks_device_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_credits_items" ADD CONSTRAINT "case_templates_blocks_credits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_credits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_credits" ADD CONSTRAINT "case_templates_blocks_credits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_next_project" ADD CONSTRAINT "case_templates_blocks_next_project_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_next_project" ADD CONSTRAINT "case_templates_blocks_next_project_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_horizontal_story_scenes" ADD CONSTRAINT "case_templates_blocks_horizontal_story_scenes_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_horizontal_story_scenes" ADD CONSTRAINT "case_templates_blocks_horizontal_story_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_horizontal_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_horizontal_story" ADD CONSTRAINT "case_templates_blocks_horizontal_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_layered_media_layers" ADD CONSTRAINT "case_templates_blocks_layered_media_layers_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_layered_media_layers" ADD CONSTRAINT "case_templates_blocks_layered_media_layers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_layered_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_layered_media" ADD CONSTRAINT "case_templates_blocks_layered_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_typography_takeover" ADD CONSTRAINT "case_templates_blocks_typography_takeover_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_video_chapter" ADD CONSTRAINT "case_templates_blocks_video_chapter_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_video_chapter" ADD CONSTRAINT "case_templates_blocks_video_chapter_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_video_chapter" ADD CONSTRAINT "case_templates_blocks_video_chapter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_comparison_items" ADD CONSTRAINT "case_templates_blocks_comparison_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_comparison"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_comparison" ADD CONSTRAINT "case_templates_blocks_comparison_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_artifact_stack_items" ADD CONSTRAINT "case_templates_blocks_artifact_stack_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_artifact_stack_items" ADD CONSTRAINT "case_templates_blocks_artifact_stack_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates_blocks_artifact_stack"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_artifact_stack" ADD CONSTRAINT "case_templates_blocks_artifact_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_text_media" ADD CONSTRAINT "case_templates_blocks_text_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_text_media" ADD CONSTRAINT "case_templates_blocks_text_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_cta" ADD CONSTRAINT "case_templates_blocks_cta_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_templates_blocks_cta" ADD CONSTRAINT "case_templates_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "case_templates_blocks_case_hero_order_idx" ON "case_templates_blocks_case_hero" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_case_hero_parent_id_idx" ON "case_templates_blocks_case_hero" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_case_hero_path_idx" ON "case_templates_blocks_case_hero" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_case_hero_media_idx" ON "case_templates_blocks_case_hero" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_manifesto_order_idx" ON "case_templates_blocks_manifesto" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_manifesto_parent_id_idx" ON "case_templates_blocks_manifesto" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_manifesto_path_idx" ON "case_templates_blocks_manifesto" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_full_bleed_media_order_idx" ON "case_templates_blocks_full_bleed_media" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_full_bleed_media_parent_id_idx" ON "case_templates_blocks_full_bleed_media" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_full_bleed_media_path_idx" ON "case_templates_blocks_full_bleed_media" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_full_bleed_media_media_idx" ON "case_templates_blocks_full_bleed_media" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_split_media_order_idx" ON "case_templates_blocks_split_media" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_split_media_parent_id_idx" ON "case_templates_blocks_split_media" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_split_media_path_idx" ON "case_templates_blocks_split_media" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_split_media_left_idx" ON "case_templates_blocks_split_media" USING btree ("left_id");
  CREATE INDEX "case_templates_blocks_split_media_right_idx" ON "case_templates_blocks_split_media" USING btree ("right_id");
  CREATE INDEX "case_templates_blocks_media_mosaic_items_order_idx" ON "case_templates_blocks_media_mosaic_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_media_mosaic_items_parent_id_idx" ON "case_templates_blocks_media_mosaic_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_media_mosaic_items_media_idx" ON "case_templates_blocks_media_mosaic_items" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_media_mosaic_order_idx" ON "case_templates_blocks_media_mosaic" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_media_mosaic_parent_id_idx" ON "case_templates_blocks_media_mosaic" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_media_mosaic_path_idx" ON "case_templates_blocks_media_mosaic" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_sticky_story_frames_order_idx" ON "case_templates_blocks_sticky_story_frames" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_sticky_story_frames_parent_id_idx" ON "case_templates_blocks_sticky_story_frames" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_sticky_story_frames_media_idx" ON "case_templates_blocks_sticky_story_frames" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_sticky_story_order_idx" ON "case_templates_blocks_sticky_story" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_sticky_story_parent_id_idx" ON "case_templates_blocks_sticky_story" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_sticky_story_path_idx" ON "case_templates_blocks_sticky_story" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_metrics_items_order_idx" ON "case_templates_blocks_metrics_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_metrics_items_parent_id_idx" ON "case_templates_blocks_metrics_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_metrics_order_idx" ON "case_templates_blocks_metrics" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_metrics_parent_id_idx" ON "case_templates_blocks_metrics" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_metrics_path_idx" ON "case_templates_blocks_metrics" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_before_after_order_idx" ON "case_templates_blocks_before_after" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_before_after_parent_id_idx" ON "case_templates_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_before_after_path_idx" ON "case_templates_blocks_before_after" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_before_after_before_idx" ON "case_templates_blocks_before_after" USING btree ("before_id");
  CREATE INDEX "case_templates_blocks_before_after_after_idx" ON "case_templates_blocks_before_after" USING btree ("after_id");
  CREATE INDEX "case_templates_blocks_quote_order_idx" ON "case_templates_blocks_quote" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_quote_parent_id_idx" ON "case_templates_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_quote_path_idx" ON "case_templates_blocks_quote" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_process_steps_order_idx" ON "case_templates_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_process_steps_parent_id_idx" ON "case_templates_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_process_steps_media_idx" ON "case_templates_blocks_process_steps" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_process_order_idx" ON "case_templates_blocks_process" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_process_parent_id_idx" ON "case_templates_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_process_path_idx" ON "case_templates_blocks_process" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_gallery_items_order_idx" ON "case_templates_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_gallery_items_parent_id_idx" ON "case_templates_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_gallery_items_media_idx" ON "case_templates_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_gallery_order_idx" ON "case_templates_blocks_gallery" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_gallery_parent_id_idx" ON "case_templates_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_gallery_path_idx" ON "case_templates_blocks_gallery" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_device_showcase_order_idx" ON "case_templates_blocks_device_showcase" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_device_showcase_parent_id_idx" ON "case_templates_blocks_device_showcase" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_device_showcase_path_idx" ON "case_templates_blocks_device_showcase" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_device_showcase_media_idx" ON "case_templates_blocks_device_showcase" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_credits_items_order_idx" ON "case_templates_blocks_credits_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_credits_items_parent_id_idx" ON "case_templates_blocks_credits_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_credits_order_idx" ON "case_templates_blocks_credits" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_credits_parent_id_idx" ON "case_templates_blocks_credits" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_credits_path_idx" ON "case_templates_blocks_credits" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_next_project_order_idx" ON "case_templates_blocks_next_project" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_next_project_parent_id_idx" ON "case_templates_blocks_next_project" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_next_project_path_idx" ON "case_templates_blocks_next_project" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_next_project_project_idx" ON "case_templates_blocks_next_project" USING btree ("project_id");
  CREATE INDEX "case_templates_blocks_horizontal_story_scenes_order_idx" ON "case_templates_blocks_horizontal_story_scenes" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_horizontal_story_scenes_parent_id_idx" ON "case_templates_blocks_horizontal_story_scenes" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_horizontal_story_scenes_media_idx" ON "case_templates_blocks_horizontal_story_scenes" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_horizontal_story_order_idx" ON "case_templates_blocks_horizontal_story" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_horizontal_story_parent_id_idx" ON "case_templates_blocks_horizontal_story" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_horizontal_story_path_idx" ON "case_templates_blocks_horizontal_story" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_layered_media_layers_order_idx" ON "case_templates_blocks_layered_media_layers" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_layered_media_layers_parent_id_idx" ON "case_templates_blocks_layered_media_layers" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_layered_media_layers_media_idx" ON "case_templates_blocks_layered_media_layers" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_layered_media_order_idx" ON "case_templates_blocks_layered_media" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_layered_media_parent_id_idx" ON "case_templates_blocks_layered_media" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_layered_media_path_idx" ON "case_templates_blocks_layered_media" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_typography_takeover_order_idx" ON "case_templates_blocks_typography_takeover" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_typography_takeover_parent_id_idx" ON "case_templates_blocks_typography_takeover" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_typography_takeover_path_idx" ON "case_templates_blocks_typography_takeover" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_video_chapter_order_idx" ON "case_templates_blocks_video_chapter" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_video_chapter_parent_id_idx" ON "case_templates_blocks_video_chapter" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_video_chapter_path_idx" ON "case_templates_blocks_video_chapter" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_video_chapter_video_idx" ON "case_templates_blocks_video_chapter" USING btree ("video_id");
  CREATE INDEX "case_templates_blocks_video_chapter_poster_idx" ON "case_templates_blocks_video_chapter" USING btree ("poster_id");
  CREATE INDEX "case_templates_blocks_comparison_items_order_idx" ON "case_templates_blocks_comparison_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_comparison_items_parent_id_idx" ON "case_templates_blocks_comparison_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_comparison_order_idx" ON "case_templates_blocks_comparison" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_comparison_parent_id_idx" ON "case_templates_blocks_comparison" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_comparison_path_idx" ON "case_templates_blocks_comparison" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_artifact_stack_items_order_idx" ON "case_templates_blocks_artifact_stack_items" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_artifact_stack_items_parent_id_idx" ON "case_templates_blocks_artifact_stack_items" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_artifact_stack_items_media_idx" ON "case_templates_blocks_artifact_stack_items" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_artifact_stack_order_idx" ON "case_templates_blocks_artifact_stack" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_artifact_stack_parent_id_idx" ON "case_templates_blocks_artifact_stack" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_artifact_stack_path_idx" ON "case_templates_blocks_artifact_stack" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_text_media_order_idx" ON "case_templates_blocks_text_media" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_text_media_parent_id_idx" ON "case_templates_blocks_text_media" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_text_media_path_idx" ON "case_templates_blocks_text_media" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_text_media_media_idx" ON "case_templates_blocks_text_media" USING btree ("media_id");
  CREATE INDEX "case_templates_blocks_cta_order_idx" ON "case_templates_blocks_cta" USING btree ("_order");
  CREATE INDEX "case_templates_blocks_cta_parent_id_idx" ON "case_templates_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "case_templates_blocks_cta_path_idx" ON "case_templates_blocks_cta" USING btree ("_path");
  CREATE INDEX "case_templates_blocks_cta_media_idx" ON "case_templates_blocks_cta" USING btree ("media_id");
  CREATE UNIQUE INDEX "case_templates_slug_idx" ON "case_templates" USING btree ("slug");
  CREATE INDEX "case_templates_updated_at_idx" ON "case_templates" USING btree ("updated_at");
  CREATE INDEX "case_templates_created_at_idx" ON "case_templates" USING btree ("created_at");
  ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_templates_fk" FOREIGN KEY ("case_templates_id") REFERENCES "public"."case_templates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_owner_idx" ON "projects" USING btree ("owner_id");
  CREATE INDEX "_projects_v_version_version_owner_idx" ON "_projects_v" USING btree ("version_owner_id");
  CREATE INDEX "payload_locked_documents_rels_case_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("case_templates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_projects_kind" ADD VALUE 'template';
  ALTER TYPE "public"."enum__projects_v_version_kind" ADD VALUE 'template';
  ALTER TABLE "case_templates_blocks_case_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_manifesto" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_full_bleed_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_split_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_media_mosaic_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_media_mosaic" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_sticky_story_frames" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_sticky_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_metrics_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_device_showcase" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_credits_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_credits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_next_project" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_horizontal_story_scenes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_horizontal_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_layered_media_layers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_layered_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_typography_takeover" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_video_chapter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_comparison_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_comparison" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_artifact_stack_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_artifact_stack" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_text_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_templates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "case_templates_blocks_case_hero" CASCADE;
  DROP TABLE "case_templates_blocks_manifesto" CASCADE;
  DROP TABLE "case_templates_blocks_full_bleed_media" CASCADE;
  DROP TABLE "case_templates_blocks_split_media" CASCADE;
  DROP TABLE "case_templates_blocks_media_mosaic_items" CASCADE;
  DROP TABLE "case_templates_blocks_media_mosaic" CASCADE;
  DROP TABLE "case_templates_blocks_sticky_story_frames" CASCADE;
  DROP TABLE "case_templates_blocks_sticky_story" CASCADE;
  DROP TABLE "case_templates_blocks_metrics_items" CASCADE;
  DROP TABLE "case_templates_blocks_metrics" CASCADE;
  DROP TABLE "case_templates_blocks_before_after" CASCADE;
  DROP TABLE "case_templates_blocks_quote" CASCADE;
  DROP TABLE "case_templates_blocks_process_steps" CASCADE;
  DROP TABLE "case_templates_blocks_process" CASCADE;
  DROP TABLE "case_templates_blocks_gallery_items" CASCADE;
  DROP TABLE "case_templates_blocks_gallery" CASCADE;
  DROP TABLE "case_templates_blocks_device_showcase" CASCADE;
  DROP TABLE "case_templates_blocks_credits_items" CASCADE;
  DROP TABLE "case_templates_blocks_credits" CASCADE;
  DROP TABLE "case_templates_blocks_next_project" CASCADE;
  DROP TABLE "case_templates_blocks_horizontal_story_scenes" CASCADE;
  DROP TABLE "case_templates_blocks_horizontal_story" CASCADE;
  DROP TABLE "case_templates_blocks_layered_media_layers" CASCADE;
  DROP TABLE "case_templates_blocks_layered_media" CASCADE;
  DROP TABLE "case_templates_blocks_typography_takeover" CASCADE;
  DROP TABLE "case_templates_blocks_video_chapter" CASCADE;
  DROP TABLE "case_templates_blocks_comparison_items" CASCADE;
  DROP TABLE "case_templates_blocks_comparison" CASCADE;
  DROP TABLE "case_templates_blocks_artifact_stack_items" CASCADE;
  DROP TABLE "case_templates_blocks_artifact_stack" CASCADE;
  DROP TABLE "case_templates_blocks_text_media" CASCADE;
  DROP TABLE "case_templates_blocks_cta" CASCADE;
  DROP TABLE "case_templates" CASCADE;
  ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_id_users_id_fk";
  
  ALTER TABLE "_projects_v" DROP CONSTRAINT "_projects_v_version_owner_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_case_templates_fk";
  
  DROP INDEX "projects_owner_idx";
  DROP INDEX "_projects_v_version_version_owner_idx";
  DROP INDEX "payload_locked_documents_rels_case_templates_id_idx";
  ALTER TABLE "projects" DROP COLUMN "workflow_status";
  ALTER TABLE "projects" DROP COLUMN "owner_id";
  ALTER TABLE "projects" DROP COLUMN "deadline";
  ALTER TABLE "_projects_v" DROP COLUMN "version_workflow_status";
  ALTER TABLE "_projects_v" DROP COLUMN "version_owner_id";
  ALTER TABLE "_projects_v" DROP COLUMN "version_deadline";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "case_templates_id";
  DROP TYPE "public"."enum_projects_workflow_status";
  DROP TYPE "public"."enum__projects_v_version_workflow_status";
  DROP TYPE "public"."enum_case_templates_blocks_case_hero_layout";
  DROP TYPE "public"."enum_case_templates_blocks_case_hero_theme";
  DROP TYPE "public"."enum_case_templates_blocks_manifesto_size";
  DROP TYPE "public"."enum_case_templates_blocks_manifesto_align";
  DROP TYPE "public"."enum_case_templates_blocks_manifesto_theme";
  DROP TYPE "public"."enum_case_templates_blocks_full_bleed_media_height";
  DROP TYPE "public"."enum_case_templates_blocks_full_bleed_media_fit";
  DROP TYPE "public"."enum_case_templates_blocks_full_bleed_media_theme";
  DROP TYPE "public"."enum_case_templates_blocks_split_media_ratio";
  DROP TYPE "public"."enum_case_templates_blocks_split_media_gap";
  DROP TYPE "public"."enum_case_templates_blocks_split_media_theme";
  DROP TYPE "public"."enum_case_templates_blocks_media_mosaic_items_span";
  DROP TYPE "public"."enum_case_templates_blocks_media_mosaic_layout";
  DROP TYPE "public"."enum_case_templates_blocks_media_mosaic_theme";
  DROP TYPE "public"."enum_case_templates_blocks_sticky_story_pin";
  DROP TYPE "public"."enum_case_templates_blocks_sticky_story_theme";
  DROP TYPE "public"."enum_case_templates_blocks_metrics_style";
  DROP TYPE "public"."enum_case_templates_blocks_metrics_theme";
  DROP TYPE "public"."enum_case_templates_blocks_before_after_mode";
  DROP TYPE "public"."enum_case_templates_blocks_before_after_theme";
  DROP TYPE "public"."enum_case_templates_blocks_quote_size";
  DROP TYPE "public"."enum_case_templates_blocks_quote_theme";
  DROP TYPE "public"."enum_case_templates_blocks_process_mode";
  DROP TYPE "public"."enum_case_templates_blocks_process_theme";
  DROP TYPE "public"."enum_case_templates_blocks_gallery_mode";
  DROP TYPE "public"."enum_case_templates_blocks_gallery_theme";
  DROP TYPE "public"."enum_case_templates_blocks_device_showcase_device";
  DROP TYPE "public"."enum_case_templates_blocks_device_showcase_theme";
  DROP TYPE "public"."enum_case_templates_blocks_credits_theme";
  DROP TYPE "public"."enum_case_templates_blocks_next_project_mode";
  DROP TYPE "public"."enum_case_templates_blocks_next_project_theme";
  DROP TYPE "public"."enum_case_templates_blocks_horizontal_story_mode";
  DROP TYPE "public"."enum_case_templates_blocks_horizontal_story_theme";
  DROP TYPE "public"."enum_case_templates_blocks_layered_media_mode";
  DROP TYPE "public"."enum_case_templates_blocks_layered_media_theme";
  DROP TYPE "public"."enum_case_templates_blocks_typography_takeover_mode";
  DROP TYPE "public"."enum_case_templates_blocks_typography_takeover_align";
  DROP TYPE "public"."enum_case_templates_blocks_typography_takeover_theme";
  DROP TYPE "public"."enum_case_templates_blocks_video_chapter_mode";
  DROP TYPE "public"."enum_case_templates_blocks_video_chapter_theme";
  DROP TYPE "public"."enum_case_templates_blocks_comparison_mode";
  DROP TYPE "public"."enum_case_templates_blocks_comparison_theme";
  DROP TYPE "public"."enum_case_templates_blocks_artifact_stack_mode";
  DROP TYPE "public"."enum_case_templates_blocks_artifact_stack_theme";
  DROP TYPE "public"."enum_case_templates_blocks_text_media_layout";
  DROP TYPE "public"."enum_case_templates_blocks_text_media_theme";
  DROP TYPE "public"."enum_case_templates_blocks_cta_mode";
  DROP TYPE "public"."enum_case_templates_blocks_cta_theme";
  DROP TYPE "public"."enum_case_templates_page_theme";`)
}
