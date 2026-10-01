import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_blocks_case_hero_layout" AS ENUM('editorial', 'media-first', 'fullscreen');
  CREATE TYPE "public"."enum_projects_blocks_case_hero_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_manifesto_size" AS ENUM('m', 'l', 'xl', 'display');
  CREATE TYPE "public"."enum_projects_blocks_manifesto_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_projects_blocks_manifesto_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_full_bleed_media_height" AS ENUM('auto', '70vh', 'screen', '120vh');
  CREATE TYPE "public"."enum_projects_blocks_full_bleed_media_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_projects_blocks_full_bleed_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_split_media_ratio" AS ENUM('1-1', '1-2', '2-1');
  CREATE TYPE "public"."enum_projects_blocks_split_media_gap" AS ENUM('none', 'xs', 's', 'm');
  CREATE TYPE "public"."enum_projects_blocks_split_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_media_mosaic_items_span" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_projects_blocks_media_mosaic_layout" AS ENUM('editorial', 'grid', 'rail', 'staggered');
  CREATE TYPE "public"."enum_projects_blocks_media_mosaic_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_sticky_story_pin" AS ENUM('copy', 'media');
  CREATE TYPE "public"."enum_projects_blocks_sticky_story_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_metrics_style" AS ENUM('rail', 'cards', 'oversized');
  CREATE TYPE "public"."enum_projects_blocks_metrics_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_before_after_mode" AS ENUM('drag', 'toggle', 'split');
  CREATE TYPE "public"."enum_projects_blocks_before_after_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_quote_size" AS ENUM('l', 'xl', 'display');
  CREATE TYPE "public"."enum_projects_blocks_quote_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_process_mode" AS ENUM('timeline', 'accordion', 'sticky');
  CREATE TYPE "public"."enum_projects_blocks_process_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_gallery_mode" AS ENUM('drag', 'cursor', 'stack', 'filmstrip');
  CREATE TYPE "public"."enum_projects_blocks_gallery_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_device_showcase_device" AS ENUM('none', 'browser', 'phone', 'screen', 'print');
  CREATE TYPE "public"."enum_projects_blocks_device_showcase_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_credits_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_next_project_mode" AS ENUM('cover', 'minimal');
  CREATE TYPE "public"."enum_projects_blocks_next_project_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_horizontal_story_mode" AS ENUM('snap', 'scrub');
  CREATE TYPE "public"."enum_projects_blocks_horizontal_story_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_layered_media_mode" AS ENUM('stack', 'parallax', 'float');
  CREATE TYPE "public"."enum_projects_blocks_layered_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_typography_takeover_mode" AS ENUM('center', 'edge', 'marquee');
  CREATE TYPE "public"."enum_projects_blocks_typography_takeover_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_projects_blocks_typography_takeover_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_video_chapter_mode" AS ENUM('inline', 'full', 'sticky');
  CREATE TYPE "public"."enum_projects_blocks_video_chapter_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_comparison_mode" AS ENUM('columns', 'table', 'cards');
  CREATE TYPE "public"."enum_projects_blocks_comparison_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_artifact_stack_mode" AS ENUM('fan', 'stack', 'spread');
  CREATE TYPE "public"."enum_projects_blocks_artifact_stack_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_text_media_layout" AS ENUM('text-left', 'text-right', 'balanced');
  CREATE TYPE "public"."enum_projects_blocks_text_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_blocks_cta_mode" AS ENUM('minimal', 'statement', 'media');
  CREATE TYPE "public"."enum_projects_blocks_cta_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_projects_kind" AS ENUM('project', 'template');
  CREATE TYPE "public"."enum_projects_page_theme" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_blocks_case_hero_layout" AS ENUM('editorial', 'media-first', 'fullscreen');
  CREATE TYPE "public"."enum__projects_v_blocks_case_hero_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_manifesto_size" AS ENUM('m', 'l', 'xl', 'display');
  CREATE TYPE "public"."enum__projects_v_blocks_manifesto_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__projects_v_blocks_manifesto_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_full_bleed_media_height" AS ENUM('auto', '70vh', 'screen', '120vh');
  CREATE TYPE "public"."enum__projects_v_blocks_full_bleed_media_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__projects_v_blocks_full_bleed_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_split_media_ratio" AS ENUM('1-1', '1-2', '2-1');
  CREATE TYPE "public"."enum__projects_v_blocks_split_media_gap" AS ENUM('none', 'xs', 's', 'm');
  CREATE TYPE "public"."enum__projects_v_blocks_split_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_media_mosaic_items_span" AS ENUM('1', '2');
  CREATE TYPE "public"."enum__projects_v_blocks_media_mosaic_layout" AS ENUM('editorial', 'grid', 'rail', 'staggered');
  CREATE TYPE "public"."enum__projects_v_blocks_media_mosaic_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_sticky_story_pin" AS ENUM('copy', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_sticky_story_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_metrics_style" AS ENUM('rail', 'cards', 'oversized');
  CREATE TYPE "public"."enum__projects_v_blocks_metrics_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_before_after_mode" AS ENUM('drag', 'toggle', 'split');
  CREATE TYPE "public"."enum__projects_v_blocks_before_after_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_quote_size" AS ENUM('l', 'xl', 'display');
  CREATE TYPE "public"."enum__projects_v_blocks_quote_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_process_mode" AS ENUM('timeline', 'accordion', 'sticky');
  CREATE TYPE "public"."enum__projects_v_blocks_process_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_gallery_mode" AS ENUM('drag', 'cursor', 'stack', 'filmstrip');
  CREATE TYPE "public"."enum__projects_v_blocks_gallery_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_device_showcase_device" AS ENUM('none', 'browser', 'phone', 'screen', 'print');
  CREATE TYPE "public"."enum__projects_v_blocks_device_showcase_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_credits_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_next_project_mode" AS ENUM('cover', 'minimal');
  CREATE TYPE "public"."enum__projects_v_blocks_next_project_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_horizontal_story_mode" AS ENUM('snap', 'scrub');
  CREATE TYPE "public"."enum__projects_v_blocks_horizontal_story_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_layered_media_mode" AS ENUM('stack', 'parallax', 'float');
  CREATE TYPE "public"."enum__projects_v_blocks_layered_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_typography_takeover_mode" AS ENUM('center', 'edge', 'marquee');
  CREATE TYPE "public"."enum__projects_v_blocks_typography_takeover_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__projects_v_blocks_typography_takeover_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_video_chapter_mode" AS ENUM('inline', 'full', 'sticky');
  CREATE TYPE "public"."enum__projects_v_blocks_video_chapter_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_comparison_mode" AS ENUM('columns', 'table', 'cards');
  CREATE TYPE "public"."enum__projects_v_blocks_comparison_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_artifact_stack_mode" AS ENUM('fan', 'stack', 'spread');
  CREATE TYPE "public"."enum__projects_v_blocks_artifact_stack_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_text_media_layout" AS ENUM('text-left', 'text-right', 'balanced');
  CREATE TYPE "public"."enum__projects_v_blocks_text_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_cta_mode" AS ENUM('minimal', 'statement', 'media');
  CREATE TYPE "public"."enum__projects_v_blocks_cta_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__projects_v_version_kind" AS ENUM('project', 'template');
  CREATE TYPE "public"."enum__projects_v_version_page_theme" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_kind" AS ENUM('project', 'site', 'cover', 'brand', 'motion');
  CREATE TYPE "public"."enum_leads_service" AS ENUM('presentation', 'strategy', 'branding', 'web', 'conference', 'other');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');
  CREATE TYPE "public"."enum_leads_source" AS ENUM('site', 'referral', 'outbound', 'event', 'other');
  CREATE TYPE "public"."enum_deals_stage" AS ENUM('discovery', 'brief', 'estimate', 'proposal', 'negotiation', 'won', 'lost');
  CREATE TYPE "public"."enum_deals_currency" AS ENUM('RUB', 'USD', 'EUR', 'AED');
  CREATE TYPE "public"."enum_activities_type" AS ENUM('task', 'call', 'email', 'meeting', 'note');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'sales');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "projects_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "projects_blocks_case_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"dek" varchar,
  	"media_id" integer,
  	"layout" "enum_projects_blocks_case_hero_layout" DEFAULT 'editorial',
  	"theme" "enum_projects_blocks_case_hero_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_manifesto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"text" varchar,
  	"size" "enum_projects_blocks_manifesto_size" DEFAULT 'xl',
  	"align" "enum_projects_blocks_manifesto_align" DEFAULT 'left',
  	"theme" "enum_projects_blocks_manifesto_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_full_bleed_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"height" "enum_projects_blocks_full_bleed_media_height" DEFAULT 'screen',
  	"fit" "enum_projects_blocks_full_bleed_media_fit" DEFAULT 'cover',
  	"theme" "enum_projects_blocks_full_bleed_media_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_split_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_id" integer,
  	"right_id" integer,
  	"ratio" "enum_projects_blocks_split_media_ratio" DEFAULT '1-1',
  	"gap" "enum_projects_blocks_split_media_gap" DEFAULT 's',
  	"theme" "enum_projects_blocks_split_media_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_media_mosaic_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"span" "enum_projects_blocks_media_mosaic_items_span" DEFAULT '1'
  );
  
  CREATE TABLE "projects_blocks_media_mosaic" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_projects_blocks_media_mosaic_layout" DEFAULT 'editorial',
  	"theme" "enum_projects_blocks_media_mosaic_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_sticky_story_frames" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "projects_blocks_sticky_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"chapter" varchar,
  	"title" varchar,
  	"body" varchar,
  	"pin" "enum_projects_blocks_sticky_story_pin" DEFAULT 'copy',
  	"theme" "enum_projects_blocks_sticky_story_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_metrics_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "projects_blocks_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_projects_blocks_metrics_style" DEFAULT 'rail',
  	"theme" "enum_projects_blocks_metrics_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"before_label" varchar DEFAULT 'До',
  	"after_label" varchar DEFAULT 'После',
  	"mode" "enum_projects_blocks_before_after_mode" DEFAULT 'drag',
  	"theme" "enum_projects_blocks_before_after_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"author" varchar,
  	"role" varchar,
  	"size" "enum_projects_blocks_quote_size" DEFAULT 'xl',
  	"theme" "enum_projects_blocks_quote_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "projects_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_projects_blocks_process_mode" DEFAULT 'timeline',
  	"theme" "enum_projects_blocks_process_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "projects_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_projects_blocks_gallery_mode" DEFAULT 'drag',
  	"theme" "enum_projects_blocks_gallery_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_device_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"device" "enum_projects_blocks_device_showcase_device" DEFAULT 'none',
  	"caption" varchar,
  	"float" boolean DEFAULT true,
  	"theme" "enum_projects_blocks_device_showcase_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_credits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "projects_blocks_credits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Команда',
  	"theme" "enum_projects_blocks_credits_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_next_project" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"label" varchar DEFAULT 'Следующий проект',
  	"mode" "enum_projects_blocks_next_project_mode" DEFAULT 'cover',
  	"theme" "enum_projects_blocks_next_project_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_horizontal_story_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "projects_blocks_horizontal_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_projects_blocks_horizontal_story_mode" DEFAULT 'snap',
  	"theme" "enum_projects_blocks_horizontal_story_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_layered_media_layers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"x" numeric DEFAULT 50,
  	"y" numeric DEFAULT 50,
  	"width" numeric DEFAULT 60,
  	"depth" numeric DEFAULT 1
  );
  
  CREATE TABLE "projects_blocks_layered_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_projects_blocks_layered_media_mode" DEFAULT 'parallax',
  	"theme" "enum_projects_blocks_layered_media_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_typography_takeover" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"text" varchar,
  	"mode" "enum_projects_blocks_typography_takeover_mode" DEFAULT 'center',
  	"accent_word" varchar,
  	"align" "enum_projects_blocks_typography_takeover_align" DEFAULT 'left',
  	"theme" "enum_projects_blocks_typography_takeover_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_video_chapter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"poster_id" integer,
  	"title" varchar,
  	"caption" varchar,
  	"mode" "enum_projects_blocks_video_chapter_mode" DEFAULT 'inline',
  	"autoplay" boolean DEFAULT true,
  	"loop" boolean DEFAULT true,
  	"theme" "enum_projects_blocks_video_chapter_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_comparison_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"value" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "projects_blocks_comparison" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum_projects_blocks_comparison_mode" DEFAULT 'columns',
  	"theme" "enum_projects_blocks_comparison_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_artifact_stack_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"label" varchar
  );
  
  CREATE TABLE "projects_blocks_artifact_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"mode" "enum_projects_blocks_artifact_stack_mode" DEFAULT 'fan',
  	"theme" "enum_projects_blocks_artifact_stack_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_text_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"layout" "enum_projects_blocks_text_media_layout" DEFAULT 'text-left',
  	"theme" "enum_projects_blocks_text_media_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"button_label" varchar DEFAULT 'Обсудить проект',
  	"button_u_r_l" varchar DEFAULT '/contact',
  	"media_id" integer,
  	"mode" "enum_projects_blocks_cta_mode" DEFAULT 'statement',
  	"theme" "enum_projects_blocks_cta_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"kind" "enum_projects_kind" DEFAULT 'project',
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"client" varchar,
  	"year" numeric,
  	"summary" varchar,
  	"cover_id" integer,
  	"og_image_id" integer,
  	"accent" varchar DEFAULT '#ffffff',
  	"page_theme" "enum_projects_page_theme" DEFAULT 'dark',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"canonical_u_r_l" varchar,
  	"no_index" boolean DEFAULT false,
  	"internal_notes" varchar,
  	"source_u_r_l" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_projects_v_version_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_case_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"dek" varchar,
  	"media_id" integer,
  	"layout" "enum__projects_v_blocks_case_hero_layout" DEFAULT 'editorial',
  	"theme" "enum__projects_v_blocks_case_hero_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_manifesto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"text" varchar,
  	"size" "enum__projects_v_blocks_manifesto_size" DEFAULT 'xl',
  	"align" "enum__projects_v_blocks_manifesto_align" DEFAULT 'left',
  	"theme" "enum__projects_v_blocks_manifesto_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_full_bleed_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"height" "enum__projects_v_blocks_full_bleed_media_height" DEFAULT 'screen',
  	"fit" "enum__projects_v_blocks_full_bleed_media_fit" DEFAULT 'cover',
  	"theme" "enum__projects_v_blocks_full_bleed_media_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_split_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_id" integer,
  	"right_id" integer,
  	"ratio" "enum__projects_v_blocks_split_media_ratio" DEFAULT '1-1',
  	"gap" "enum__projects_v_blocks_split_media_gap" DEFAULT 's',
  	"theme" "enum__projects_v_blocks_split_media_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_media_mosaic_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"span" "enum__projects_v_blocks_media_mosaic_items_span" DEFAULT '1',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_media_mosaic" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__projects_v_blocks_media_mosaic_layout" DEFAULT 'editorial',
  	"theme" "enum__projects_v_blocks_media_mosaic_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_sticky_story_frames" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_sticky_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"chapter" varchar,
  	"title" varchar,
  	"body" varchar,
  	"pin" "enum__projects_v_blocks_sticky_story_pin" DEFAULT 'copy',
  	"theme" "enum__projects_v_blocks_sticky_story_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_metrics_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__projects_v_blocks_metrics_style" DEFAULT 'rail',
  	"theme" "enum__projects_v_blocks_metrics_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"before_label" varchar DEFAULT 'До',
  	"after_label" varchar DEFAULT 'После',
  	"mode" "enum__projects_v_blocks_before_after_mode" DEFAULT 'drag',
  	"theme" "enum__projects_v_blocks_before_after_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"author" varchar,
  	"role" varchar,
  	"size" "enum__projects_v_blocks_quote_size" DEFAULT 'xl',
  	"theme" "enum__projects_v_blocks_quote_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"title" varchar,
  	"body" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum__projects_v_blocks_process_mode" DEFAULT 'timeline',
  	"theme" "enum__projects_v_blocks_process_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_gallery_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"mode" "enum__projects_v_blocks_gallery_mode" DEFAULT 'drag',
  	"theme" "enum__projects_v_blocks_gallery_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_device_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"device" "enum__projects_v_blocks_device_showcase_device" DEFAULT 'none',
  	"caption" varchar,
  	"float" boolean DEFAULT true,
  	"theme" "enum__projects_v_blocks_device_showcase_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_credits_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_credits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Команда',
  	"theme" "enum__projects_v_blocks_credits_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_next_project" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"project_id" integer,
  	"label" varchar DEFAULT 'Следующий проект',
  	"mode" "enum__projects_v_blocks_next_project_mode" DEFAULT 'cover',
  	"theme" "enum__projects_v_blocks_next_project_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_horizontal_story_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_horizontal_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum__projects_v_blocks_horizontal_story_mode" DEFAULT 'snap',
  	"theme" "enum__projects_v_blocks_horizontal_story_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_layered_media_layers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"x" numeric DEFAULT 50,
  	"y" numeric DEFAULT 50,
  	"width" numeric DEFAULT 60,
  	"depth" numeric DEFAULT 1,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_layered_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"mode" "enum__projects_v_blocks_layered_media_mode" DEFAULT 'parallax',
  	"theme" "enum__projects_v_blocks_layered_media_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_typography_takeover" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"text" varchar,
  	"mode" "enum__projects_v_blocks_typography_takeover_mode" DEFAULT 'center',
  	"accent_word" varchar,
  	"align" "enum__projects_v_blocks_typography_takeover_align" DEFAULT 'left',
  	"theme" "enum__projects_v_blocks_typography_takeover_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_video_chapter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video_id" integer,
  	"poster_id" integer,
  	"title" varchar,
  	"caption" varchar,
  	"mode" "enum__projects_v_blocks_video_chapter_mode" DEFAULT 'inline',
  	"autoplay" boolean DEFAULT true,
  	"loop" boolean DEFAULT true,
  	"theme" "enum__projects_v_blocks_video_chapter_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_comparison_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"value" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_comparison" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"mode" "enum__projects_v_blocks_comparison_mode" DEFAULT 'columns',
  	"theme" "enum__projects_v_blocks_comparison_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_artifact_stack_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_artifact_stack" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"mode" "enum__projects_v_blocks_artifact_stack_mode" DEFAULT 'fan',
  	"theme" "enum__projects_v_blocks_artifact_stack_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_text_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"layout" "enum__projects_v_blocks_text_media_layout" DEFAULT 'text-left',
  	"theme" "enum__projects_v_blocks_text_media_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"button_label" varchar DEFAULT 'Обсудить проект',
  	"button_u_r_l" varchar DEFAULT '/contact',
  	"media_id" integer,
  	"mode" "enum__projects_v_blocks_cta_mode" DEFAULT 'statement',
  	"theme" "enum__projects_v_blocks_cta_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_kind" "enum__projects_v_version_kind" DEFAULT 'project',
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_client" varchar,
  	"version_year" numeric,
  	"version_summary" varchar,
  	"version_cover_id" integer,
  	"version_og_image_id" integer,
  	"version_accent" varchar DEFAULT '#ffffff',
  	"version_page_theme" "enum__projects_v_version_page_theme" DEFAULT 'dark',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_canonical_u_r_l" varchar,
  	"version_no_index" boolean DEFAULT false,
  	"version_internal_notes" varchar,
  	"version_source_u_r_l" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "media_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"kind" "enum_media_kind" DEFAULT 'project',
  	"credit" varchar,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_wide_url" varchar,
  	"sizes_wide_width" numeric,
  	"sizes_wide_height" numeric,
  	"sizes_wide_mime_type" varchar,
  	"sizes_wide_filesize" numeric,
  	"sizes_wide_filename" varchar,
  	"sizes_xl_url" varchar,
  	"sizes_xl_width" numeric,
  	"sizes_xl_height" numeric,
  	"sizes_xl_mime_type" varchar,
  	"sizes_xl_filesize" numeric,
  	"sizes_xl_filename" varchar
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"company_name" varchar,
  	"company_id" integer,
  	"message" varchar,
  	"service" "enum_leads_service",
  	"budget" numeric,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"source" "enum_leads_source" DEFAULT 'site',
  	"owner_id" integer,
  	"next_action_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"related_project_id" integer,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"utm_content" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "companies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"domain" varchar,
  	"industry" varchar,
  	"owner_id" integer,
  	"city" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "deals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"company_id" integer NOT NULL,
  	"lead_id" integer,
  	"stage" "enum_deals_stage" DEFAULT 'discovery' NOT NULL,
  	"probability" numeric DEFAULT 50,
  	"value" numeric,
  	"currency" "enum_deals_currency" DEFAULT 'RUB',
  	"owner_id" integer,
  	"next_action_at" timestamp(3) with time zone,
  	"project_id" integer,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_activities_type" DEFAULT 'task' NOT NULL,
  	"done" boolean DEFAULT false,
  	"title" varchar NOT NULL,
  	"body" varchar,
  	"lead_id" integer,
  	"company_id" integer,
  	"deal_id" integer,
  	"due_at" timestamp(3) with time zone,
  	"owner_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'admin' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"media_id" integer,
  	"leads_id" integer,
  	"companies_id" integer,
  	"deals_id" integer,
  	"activities_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'BAEV',
  	"site_u_r_l" varchar,
  	"default_description" varchar,
  	"default_o_g_id" integer,
  	"email" varchar,
  	"telegram" varchar,
  	"phone" varchar,
  	"lead_webhook_u_r_l" varchar,
  	"analytics_id" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "projects_categories" ADD CONSTRAINT "projects_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_case_hero" ADD CONSTRAINT "projects_blocks_case_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_case_hero" ADD CONSTRAINT "projects_blocks_case_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_manifesto" ADD CONSTRAINT "projects_blocks_manifesto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_full_bleed_media" ADD CONSTRAINT "projects_blocks_full_bleed_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_full_bleed_media" ADD CONSTRAINT "projects_blocks_full_bleed_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_split_media" ADD CONSTRAINT "projects_blocks_split_media_left_id_media_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_split_media" ADD CONSTRAINT "projects_blocks_split_media_right_id_media_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_split_media" ADD CONSTRAINT "projects_blocks_split_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_mosaic_items" ADD CONSTRAINT "projects_blocks_media_mosaic_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_mosaic_items" ADD CONSTRAINT "projects_blocks_media_mosaic_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_media_mosaic"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_media_mosaic" ADD CONSTRAINT "projects_blocks_media_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_sticky_story_frames" ADD CONSTRAINT "projects_blocks_sticky_story_frames_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_sticky_story_frames" ADD CONSTRAINT "projects_blocks_sticky_story_frames_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_sticky_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_sticky_story" ADD CONSTRAINT "projects_blocks_sticky_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_metrics_items" ADD CONSTRAINT "projects_blocks_metrics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_metrics" ADD CONSTRAINT "projects_blocks_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_before_after" ADD CONSTRAINT "projects_blocks_before_after_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_before_after" ADD CONSTRAINT "projects_blocks_before_after_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_before_after" ADD CONSTRAINT "projects_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_quote" ADD CONSTRAINT "projects_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_process_steps" ADD CONSTRAINT "projects_blocks_process_steps_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_process_steps" ADD CONSTRAINT "projects_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_process" ADD CONSTRAINT "projects_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_gallery_items" ADD CONSTRAINT "projects_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_gallery_items" ADD CONSTRAINT "projects_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_gallery" ADD CONSTRAINT "projects_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_device_showcase" ADD CONSTRAINT "projects_blocks_device_showcase_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_device_showcase" ADD CONSTRAINT "projects_blocks_device_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_credits_items" ADD CONSTRAINT "projects_blocks_credits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_credits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_credits" ADD CONSTRAINT "projects_blocks_credits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_next_project" ADD CONSTRAINT "projects_blocks_next_project_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_next_project" ADD CONSTRAINT "projects_blocks_next_project_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_horizontal_story_scenes" ADD CONSTRAINT "projects_blocks_horizontal_story_scenes_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_horizontal_story_scenes" ADD CONSTRAINT "projects_blocks_horizontal_story_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_horizontal_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_horizontal_story" ADD CONSTRAINT "projects_blocks_horizontal_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_layered_media_layers" ADD CONSTRAINT "projects_blocks_layered_media_layers_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_layered_media_layers" ADD CONSTRAINT "projects_blocks_layered_media_layers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_layered_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_layered_media" ADD CONSTRAINT "projects_blocks_layered_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_typography_takeover" ADD CONSTRAINT "projects_blocks_typography_takeover_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_video_chapter" ADD CONSTRAINT "projects_blocks_video_chapter_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_video_chapter" ADD CONSTRAINT "projects_blocks_video_chapter_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_video_chapter" ADD CONSTRAINT "projects_blocks_video_chapter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_comparison_items" ADD CONSTRAINT "projects_blocks_comparison_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_comparison"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_comparison" ADD CONSTRAINT "projects_blocks_comparison_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_artifact_stack_items" ADD CONSTRAINT "projects_blocks_artifact_stack_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_artifact_stack_items" ADD CONSTRAINT "projects_blocks_artifact_stack_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_artifact_stack"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_artifact_stack" ADD CONSTRAINT "projects_blocks_artifact_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text_media" ADD CONSTRAINT "projects_blocks_text_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_text_media" ADD CONSTRAINT "projects_blocks_text_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_cta" ADD CONSTRAINT "projects_blocks_cta_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_cta" ADD CONSTRAINT "projects_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_categories" ADD CONSTRAINT "_projects_v_version_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_case_hero" ADD CONSTRAINT "_projects_v_blocks_case_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_case_hero" ADD CONSTRAINT "_projects_v_blocks_case_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_manifesto" ADD CONSTRAINT "_projects_v_blocks_manifesto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_full_bleed_media" ADD CONSTRAINT "_projects_v_blocks_full_bleed_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_full_bleed_media" ADD CONSTRAINT "_projects_v_blocks_full_bleed_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_split_media" ADD CONSTRAINT "_projects_v_blocks_split_media_left_id_media_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_split_media" ADD CONSTRAINT "_projects_v_blocks_split_media_right_id_media_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_split_media" ADD CONSTRAINT "_projects_v_blocks_split_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_mosaic_items" ADD CONSTRAINT "_projects_v_blocks_media_mosaic_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_mosaic_items" ADD CONSTRAINT "_projects_v_blocks_media_mosaic_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_media_mosaic"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_media_mosaic" ADD CONSTRAINT "_projects_v_blocks_media_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_sticky_story_frames" ADD CONSTRAINT "_projects_v_blocks_sticky_story_frames_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_sticky_story_frames" ADD CONSTRAINT "_projects_v_blocks_sticky_story_frames_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_sticky_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_sticky_story" ADD CONSTRAINT "_projects_v_blocks_sticky_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_metrics_items" ADD CONSTRAINT "_projects_v_blocks_metrics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_metrics" ADD CONSTRAINT "_projects_v_blocks_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_before_after" ADD CONSTRAINT "_projects_v_blocks_before_after_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_before_after" ADD CONSTRAINT "_projects_v_blocks_before_after_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_before_after" ADD CONSTRAINT "_projects_v_blocks_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_quote" ADD CONSTRAINT "_projects_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_process_steps" ADD CONSTRAINT "_projects_v_blocks_process_steps_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_process_steps" ADD CONSTRAINT "_projects_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_process" ADD CONSTRAINT "_projects_v_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_gallery_items" ADD CONSTRAINT "_projects_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_gallery_items" ADD CONSTRAINT "_projects_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_gallery" ADD CONSTRAINT "_projects_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_device_showcase" ADD CONSTRAINT "_projects_v_blocks_device_showcase_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_device_showcase" ADD CONSTRAINT "_projects_v_blocks_device_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_credits_items" ADD CONSTRAINT "_projects_v_blocks_credits_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_credits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_credits" ADD CONSTRAINT "_projects_v_blocks_credits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_next_project" ADD CONSTRAINT "_projects_v_blocks_next_project_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_next_project" ADD CONSTRAINT "_projects_v_blocks_next_project_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_horizontal_story_scenes" ADD CONSTRAINT "_projects_v_blocks_horizontal_story_scenes_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_horizontal_story_scenes" ADD CONSTRAINT "_projects_v_blocks_horizontal_story_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_horizontal_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_horizontal_story" ADD CONSTRAINT "_projects_v_blocks_horizontal_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_layered_media_layers" ADD CONSTRAINT "_projects_v_blocks_layered_media_layers_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_layered_media_layers" ADD CONSTRAINT "_projects_v_blocks_layered_media_layers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_layered_media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_layered_media" ADD CONSTRAINT "_projects_v_blocks_layered_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_typography_takeover" ADD CONSTRAINT "_projects_v_blocks_typography_takeover_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_video_chapter" ADD CONSTRAINT "_projects_v_blocks_video_chapter_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_video_chapter" ADD CONSTRAINT "_projects_v_blocks_video_chapter_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_video_chapter" ADD CONSTRAINT "_projects_v_blocks_video_chapter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_comparison_items" ADD CONSTRAINT "_projects_v_blocks_comparison_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_comparison"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_comparison" ADD CONSTRAINT "_projects_v_blocks_comparison_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_artifact_stack_items" ADD CONSTRAINT "_projects_v_blocks_artifact_stack_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_artifact_stack_items" ADD CONSTRAINT "_projects_v_blocks_artifact_stack_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_artifact_stack"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_artifact_stack" ADD CONSTRAINT "_projects_v_blocks_artifact_stack_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text_media" ADD CONSTRAINT "_projects_v_blocks_text_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text_media" ADD CONSTRAINT "_projects_v_blocks_text_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_cta" ADD CONSTRAINT "_projects_v_blocks_cta_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_cta" ADD CONSTRAINT "_projects_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "deals" ADD CONSTRAINT "deals_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_companies_fk" FOREIGN KEY ("companies_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_deals_fk" FOREIGN KEY ("deals_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_o_g_id_media_id_fk" FOREIGN KEY ("default_o_g_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_categories_order_idx" ON "projects_categories" USING btree ("_order");
  CREATE INDEX "projects_categories_parent_id_idx" ON "projects_categories" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_case_hero_order_idx" ON "projects_blocks_case_hero" USING btree ("_order");
  CREATE INDEX "projects_blocks_case_hero_parent_id_idx" ON "projects_blocks_case_hero" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_case_hero_path_idx" ON "projects_blocks_case_hero" USING btree ("_path");
  CREATE INDEX "projects_blocks_case_hero_media_idx" ON "projects_blocks_case_hero" USING btree ("media_id");
  CREATE INDEX "projects_blocks_manifesto_order_idx" ON "projects_blocks_manifesto" USING btree ("_order");
  CREATE INDEX "projects_blocks_manifesto_parent_id_idx" ON "projects_blocks_manifesto" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_manifesto_path_idx" ON "projects_blocks_manifesto" USING btree ("_path");
  CREATE INDEX "projects_blocks_full_bleed_media_order_idx" ON "projects_blocks_full_bleed_media" USING btree ("_order");
  CREATE INDEX "projects_blocks_full_bleed_media_parent_id_idx" ON "projects_blocks_full_bleed_media" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_full_bleed_media_path_idx" ON "projects_blocks_full_bleed_media" USING btree ("_path");
  CREATE INDEX "projects_blocks_full_bleed_media_media_idx" ON "projects_blocks_full_bleed_media" USING btree ("media_id");
  CREATE INDEX "projects_blocks_split_media_order_idx" ON "projects_blocks_split_media" USING btree ("_order");
  CREATE INDEX "projects_blocks_split_media_parent_id_idx" ON "projects_blocks_split_media" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_split_media_path_idx" ON "projects_blocks_split_media" USING btree ("_path");
  CREATE INDEX "projects_blocks_split_media_left_idx" ON "projects_blocks_split_media" USING btree ("left_id");
  CREATE INDEX "projects_blocks_split_media_right_idx" ON "projects_blocks_split_media" USING btree ("right_id");
  CREATE INDEX "projects_blocks_media_mosaic_items_order_idx" ON "projects_blocks_media_mosaic_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_media_mosaic_items_parent_id_idx" ON "projects_blocks_media_mosaic_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_media_mosaic_items_media_idx" ON "projects_blocks_media_mosaic_items" USING btree ("media_id");
  CREATE INDEX "projects_blocks_media_mosaic_order_idx" ON "projects_blocks_media_mosaic" USING btree ("_order");
  CREATE INDEX "projects_blocks_media_mosaic_parent_id_idx" ON "projects_blocks_media_mosaic" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_media_mosaic_path_idx" ON "projects_blocks_media_mosaic" USING btree ("_path");
  CREATE INDEX "projects_blocks_sticky_story_frames_order_idx" ON "projects_blocks_sticky_story_frames" USING btree ("_order");
  CREATE INDEX "projects_blocks_sticky_story_frames_parent_id_idx" ON "projects_blocks_sticky_story_frames" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_sticky_story_frames_media_idx" ON "projects_blocks_sticky_story_frames" USING btree ("media_id");
  CREATE INDEX "projects_blocks_sticky_story_order_idx" ON "projects_blocks_sticky_story" USING btree ("_order");
  CREATE INDEX "projects_blocks_sticky_story_parent_id_idx" ON "projects_blocks_sticky_story" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_sticky_story_path_idx" ON "projects_blocks_sticky_story" USING btree ("_path");
  CREATE INDEX "projects_blocks_metrics_items_order_idx" ON "projects_blocks_metrics_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_metrics_items_parent_id_idx" ON "projects_blocks_metrics_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_metrics_order_idx" ON "projects_blocks_metrics" USING btree ("_order");
  CREATE INDEX "projects_blocks_metrics_parent_id_idx" ON "projects_blocks_metrics" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_metrics_path_idx" ON "projects_blocks_metrics" USING btree ("_path");
  CREATE INDEX "projects_blocks_before_after_order_idx" ON "projects_blocks_before_after" USING btree ("_order");
  CREATE INDEX "projects_blocks_before_after_parent_id_idx" ON "projects_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_before_after_path_idx" ON "projects_blocks_before_after" USING btree ("_path");
  CREATE INDEX "projects_blocks_before_after_before_idx" ON "projects_blocks_before_after" USING btree ("before_id");
  CREATE INDEX "projects_blocks_before_after_after_idx" ON "projects_blocks_before_after" USING btree ("after_id");
  CREATE INDEX "projects_blocks_quote_order_idx" ON "projects_blocks_quote" USING btree ("_order");
  CREATE INDEX "projects_blocks_quote_parent_id_idx" ON "projects_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_quote_path_idx" ON "projects_blocks_quote" USING btree ("_path");
  CREATE INDEX "projects_blocks_process_steps_order_idx" ON "projects_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "projects_blocks_process_steps_parent_id_idx" ON "projects_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_process_steps_media_idx" ON "projects_blocks_process_steps" USING btree ("media_id");
  CREATE INDEX "projects_blocks_process_order_idx" ON "projects_blocks_process" USING btree ("_order");
  CREATE INDEX "projects_blocks_process_parent_id_idx" ON "projects_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_process_path_idx" ON "projects_blocks_process" USING btree ("_path");
  CREATE INDEX "projects_blocks_gallery_items_order_idx" ON "projects_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_gallery_items_parent_id_idx" ON "projects_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_gallery_items_media_idx" ON "projects_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "projects_blocks_gallery_order_idx" ON "projects_blocks_gallery" USING btree ("_order");
  CREATE INDEX "projects_blocks_gallery_parent_id_idx" ON "projects_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_gallery_path_idx" ON "projects_blocks_gallery" USING btree ("_path");
  CREATE INDEX "projects_blocks_device_showcase_order_idx" ON "projects_blocks_device_showcase" USING btree ("_order");
  CREATE INDEX "projects_blocks_device_showcase_parent_id_idx" ON "projects_blocks_device_showcase" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_device_showcase_path_idx" ON "projects_blocks_device_showcase" USING btree ("_path");
  CREATE INDEX "projects_blocks_device_showcase_media_idx" ON "projects_blocks_device_showcase" USING btree ("media_id");
  CREATE INDEX "projects_blocks_credits_items_order_idx" ON "projects_blocks_credits_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_credits_items_parent_id_idx" ON "projects_blocks_credits_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_credits_order_idx" ON "projects_blocks_credits" USING btree ("_order");
  CREATE INDEX "projects_blocks_credits_parent_id_idx" ON "projects_blocks_credits" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_credits_path_idx" ON "projects_blocks_credits" USING btree ("_path");
  CREATE INDEX "projects_blocks_next_project_order_idx" ON "projects_blocks_next_project" USING btree ("_order");
  CREATE INDEX "projects_blocks_next_project_parent_id_idx" ON "projects_blocks_next_project" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_next_project_path_idx" ON "projects_blocks_next_project" USING btree ("_path");
  CREATE INDEX "projects_blocks_next_project_project_idx" ON "projects_blocks_next_project" USING btree ("project_id");
  CREATE INDEX "projects_blocks_horizontal_story_scenes_order_idx" ON "projects_blocks_horizontal_story_scenes" USING btree ("_order");
  CREATE INDEX "projects_blocks_horizontal_story_scenes_parent_id_idx" ON "projects_blocks_horizontal_story_scenes" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_horizontal_story_scenes_media_idx" ON "projects_blocks_horizontal_story_scenes" USING btree ("media_id");
  CREATE INDEX "projects_blocks_horizontal_story_order_idx" ON "projects_blocks_horizontal_story" USING btree ("_order");
  CREATE INDEX "projects_blocks_horizontal_story_parent_id_idx" ON "projects_blocks_horizontal_story" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_horizontal_story_path_idx" ON "projects_blocks_horizontal_story" USING btree ("_path");
  CREATE INDEX "projects_blocks_layered_media_layers_order_idx" ON "projects_blocks_layered_media_layers" USING btree ("_order");
  CREATE INDEX "projects_blocks_layered_media_layers_parent_id_idx" ON "projects_blocks_layered_media_layers" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_layered_media_layers_media_idx" ON "projects_blocks_layered_media_layers" USING btree ("media_id");
  CREATE INDEX "projects_blocks_layered_media_order_idx" ON "projects_blocks_layered_media" USING btree ("_order");
  CREATE INDEX "projects_blocks_layered_media_parent_id_idx" ON "projects_blocks_layered_media" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_layered_media_path_idx" ON "projects_blocks_layered_media" USING btree ("_path");
  CREATE INDEX "projects_blocks_typography_takeover_order_idx" ON "projects_blocks_typography_takeover" USING btree ("_order");
  CREATE INDEX "projects_blocks_typography_takeover_parent_id_idx" ON "projects_blocks_typography_takeover" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_typography_takeover_path_idx" ON "projects_blocks_typography_takeover" USING btree ("_path");
  CREATE INDEX "projects_blocks_video_chapter_order_idx" ON "projects_blocks_video_chapter" USING btree ("_order");
  CREATE INDEX "projects_blocks_video_chapter_parent_id_idx" ON "projects_blocks_video_chapter" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_video_chapter_path_idx" ON "projects_blocks_video_chapter" USING btree ("_path");
  CREATE INDEX "projects_blocks_video_chapter_video_idx" ON "projects_blocks_video_chapter" USING btree ("video_id");
  CREATE INDEX "projects_blocks_video_chapter_poster_idx" ON "projects_blocks_video_chapter" USING btree ("poster_id");
  CREATE INDEX "projects_blocks_comparison_items_order_idx" ON "projects_blocks_comparison_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_comparison_items_parent_id_idx" ON "projects_blocks_comparison_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_comparison_order_idx" ON "projects_blocks_comparison" USING btree ("_order");
  CREATE INDEX "projects_blocks_comparison_parent_id_idx" ON "projects_blocks_comparison" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_comparison_path_idx" ON "projects_blocks_comparison" USING btree ("_path");
  CREATE INDEX "projects_blocks_artifact_stack_items_order_idx" ON "projects_blocks_artifact_stack_items" USING btree ("_order");
  CREATE INDEX "projects_blocks_artifact_stack_items_parent_id_idx" ON "projects_blocks_artifact_stack_items" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_artifact_stack_items_media_idx" ON "projects_blocks_artifact_stack_items" USING btree ("media_id");
  CREATE INDEX "projects_blocks_artifact_stack_order_idx" ON "projects_blocks_artifact_stack" USING btree ("_order");
  CREATE INDEX "projects_blocks_artifact_stack_parent_id_idx" ON "projects_blocks_artifact_stack" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_artifact_stack_path_idx" ON "projects_blocks_artifact_stack" USING btree ("_path");
  CREATE INDEX "projects_blocks_text_media_order_idx" ON "projects_blocks_text_media" USING btree ("_order");
  CREATE INDEX "projects_blocks_text_media_parent_id_idx" ON "projects_blocks_text_media" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_text_media_path_idx" ON "projects_blocks_text_media" USING btree ("_path");
  CREATE INDEX "projects_blocks_text_media_media_idx" ON "projects_blocks_text_media" USING btree ("media_id");
  CREATE INDEX "projects_blocks_cta_order_idx" ON "projects_blocks_cta" USING btree ("_order");
  CREATE INDEX "projects_blocks_cta_parent_id_idx" ON "projects_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_cta_path_idx" ON "projects_blocks_cta" USING btree ("_path");
  CREATE INDEX "projects_blocks_cta_media_idx" ON "projects_blocks_cta" USING btree ("media_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE INDEX "projects_og_image_idx" ON "projects" USING btree ("og_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "_projects_v_version_categories_order_idx" ON "_projects_v_version_categories" USING btree ("_order");
  CREATE INDEX "_projects_v_version_categories_parent_id_idx" ON "_projects_v_version_categories" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_case_hero_order_idx" ON "_projects_v_blocks_case_hero" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_case_hero_parent_id_idx" ON "_projects_v_blocks_case_hero" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_case_hero_path_idx" ON "_projects_v_blocks_case_hero" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_case_hero_media_idx" ON "_projects_v_blocks_case_hero" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_manifesto_order_idx" ON "_projects_v_blocks_manifesto" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_manifesto_parent_id_idx" ON "_projects_v_blocks_manifesto" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_manifesto_path_idx" ON "_projects_v_blocks_manifesto" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_full_bleed_media_order_idx" ON "_projects_v_blocks_full_bleed_media" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_full_bleed_media_parent_id_idx" ON "_projects_v_blocks_full_bleed_media" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_full_bleed_media_path_idx" ON "_projects_v_blocks_full_bleed_media" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_full_bleed_media_media_idx" ON "_projects_v_blocks_full_bleed_media" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_split_media_order_idx" ON "_projects_v_blocks_split_media" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_split_media_parent_id_idx" ON "_projects_v_blocks_split_media" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_split_media_path_idx" ON "_projects_v_blocks_split_media" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_split_media_left_idx" ON "_projects_v_blocks_split_media" USING btree ("left_id");
  CREATE INDEX "_projects_v_blocks_split_media_right_idx" ON "_projects_v_blocks_split_media" USING btree ("right_id");
  CREATE INDEX "_projects_v_blocks_media_mosaic_items_order_idx" ON "_projects_v_blocks_media_mosaic_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_media_mosaic_items_parent_id_idx" ON "_projects_v_blocks_media_mosaic_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_media_mosaic_items_media_idx" ON "_projects_v_blocks_media_mosaic_items" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_media_mosaic_order_idx" ON "_projects_v_blocks_media_mosaic" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_media_mosaic_parent_id_idx" ON "_projects_v_blocks_media_mosaic" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_media_mosaic_path_idx" ON "_projects_v_blocks_media_mosaic" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_sticky_story_frames_order_idx" ON "_projects_v_blocks_sticky_story_frames" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_sticky_story_frames_parent_id_idx" ON "_projects_v_blocks_sticky_story_frames" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_sticky_story_frames_media_idx" ON "_projects_v_blocks_sticky_story_frames" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_sticky_story_order_idx" ON "_projects_v_blocks_sticky_story" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_sticky_story_parent_id_idx" ON "_projects_v_blocks_sticky_story" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_sticky_story_path_idx" ON "_projects_v_blocks_sticky_story" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_metrics_items_order_idx" ON "_projects_v_blocks_metrics_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_metrics_items_parent_id_idx" ON "_projects_v_blocks_metrics_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_metrics_order_idx" ON "_projects_v_blocks_metrics" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_metrics_parent_id_idx" ON "_projects_v_blocks_metrics" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_metrics_path_idx" ON "_projects_v_blocks_metrics" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_before_after_order_idx" ON "_projects_v_blocks_before_after" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_before_after_parent_id_idx" ON "_projects_v_blocks_before_after" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_before_after_path_idx" ON "_projects_v_blocks_before_after" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_before_after_before_idx" ON "_projects_v_blocks_before_after" USING btree ("before_id");
  CREATE INDEX "_projects_v_blocks_before_after_after_idx" ON "_projects_v_blocks_before_after" USING btree ("after_id");
  CREATE INDEX "_projects_v_blocks_quote_order_idx" ON "_projects_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_quote_parent_id_idx" ON "_projects_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_quote_path_idx" ON "_projects_v_blocks_quote" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_process_steps_order_idx" ON "_projects_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_process_steps_parent_id_idx" ON "_projects_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_process_steps_media_idx" ON "_projects_v_blocks_process_steps" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_process_order_idx" ON "_projects_v_blocks_process" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_process_parent_id_idx" ON "_projects_v_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_process_path_idx" ON "_projects_v_blocks_process" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_gallery_items_order_idx" ON "_projects_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_gallery_items_parent_id_idx" ON "_projects_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_gallery_items_media_idx" ON "_projects_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_gallery_order_idx" ON "_projects_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_gallery_parent_id_idx" ON "_projects_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_gallery_path_idx" ON "_projects_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_device_showcase_order_idx" ON "_projects_v_blocks_device_showcase" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_device_showcase_parent_id_idx" ON "_projects_v_blocks_device_showcase" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_device_showcase_path_idx" ON "_projects_v_blocks_device_showcase" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_device_showcase_media_idx" ON "_projects_v_blocks_device_showcase" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_credits_items_order_idx" ON "_projects_v_blocks_credits_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_credits_items_parent_id_idx" ON "_projects_v_blocks_credits_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_credits_order_idx" ON "_projects_v_blocks_credits" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_credits_parent_id_idx" ON "_projects_v_blocks_credits" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_credits_path_idx" ON "_projects_v_blocks_credits" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_next_project_order_idx" ON "_projects_v_blocks_next_project" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_next_project_parent_id_idx" ON "_projects_v_blocks_next_project" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_next_project_path_idx" ON "_projects_v_blocks_next_project" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_next_project_project_idx" ON "_projects_v_blocks_next_project" USING btree ("project_id");
  CREATE INDEX "_projects_v_blocks_horizontal_story_scenes_order_idx" ON "_projects_v_blocks_horizontal_story_scenes" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_horizontal_story_scenes_parent_id_idx" ON "_projects_v_blocks_horizontal_story_scenes" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_horizontal_story_scenes_media_idx" ON "_projects_v_blocks_horizontal_story_scenes" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_horizontal_story_order_idx" ON "_projects_v_blocks_horizontal_story" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_horizontal_story_parent_id_idx" ON "_projects_v_blocks_horizontal_story" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_horizontal_story_path_idx" ON "_projects_v_blocks_horizontal_story" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_layered_media_layers_order_idx" ON "_projects_v_blocks_layered_media_layers" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_layered_media_layers_parent_id_idx" ON "_projects_v_blocks_layered_media_layers" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_layered_media_layers_media_idx" ON "_projects_v_blocks_layered_media_layers" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_layered_media_order_idx" ON "_projects_v_blocks_layered_media" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_layered_media_parent_id_idx" ON "_projects_v_blocks_layered_media" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_layered_media_path_idx" ON "_projects_v_blocks_layered_media" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_typography_takeover_order_idx" ON "_projects_v_blocks_typography_takeover" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_typography_takeover_parent_id_idx" ON "_projects_v_blocks_typography_takeover" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_typography_takeover_path_idx" ON "_projects_v_blocks_typography_takeover" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_video_chapter_order_idx" ON "_projects_v_blocks_video_chapter" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_video_chapter_parent_id_idx" ON "_projects_v_blocks_video_chapter" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_video_chapter_path_idx" ON "_projects_v_blocks_video_chapter" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_video_chapter_video_idx" ON "_projects_v_blocks_video_chapter" USING btree ("video_id");
  CREATE INDEX "_projects_v_blocks_video_chapter_poster_idx" ON "_projects_v_blocks_video_chapter" USING btree ("poster_id");
  CREATE INDEX "_projects_v_blocks_comparison_items_order_idx" ON "_projects_v_blocks_comparison_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_comparison_items_parent_id_idx" ON "_projects_v_blocks_comparison_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_comparison_order_idx" ON "_projects_v_blocks_comparison" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_comparison_parent_id_idx" ON "_projects_v_blocks_comparison" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_comparison_path_idx" ON "_projects_v_blocks_comparison" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_artifact_stack_items_order_idx" ON "_projects_v_blocks_artifact_stack_items" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_artifact_stack_items_parent_id_idx" ON "_projects_v_blocks_artifact_stack_items" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_artifact_stack_items_media_idx" ON "_projects_v_blocks_artifact_stack_items" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_artifact_stack_order_idx" ON "_projects_v_blocks_artifact_stack" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_artifact_stack_parent_id_idx" ON "_projects_v_blocks_artifact_stack" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_artifact_stack_path_idx" ON "_projects_v_blocks_artifact_stack" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_text_media_order_idx" ON "_projects_v_blocks_text_media" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_text_media_parent_id_idx" ON "_projects_v_blocks_text_media" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_text_media_path_idx" ON "_projects_v_blocks_text_media" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_text_media_media_idx" ON "_projects_v_blocks_text_media" USING btree ("media_id");
  CREATE INDEX "_projects_v_blocks_cta_order_idx" ON "_projects_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_cta_parent_id_idx" ON "_projects_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_cta_path_idx" ON "_projects_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_cta_media_idx" ON "_projects_v_blocks_cta" USING btree ("media_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_cover_idx" ON "_projects_v" USING btree ("version_cover_id");
  CREATE INDEX "_projects_v_version_version_og_image_idx" ON "_projects_v" USING btree ("version_og_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "media_tags_order_idx" ON "media_tags" USING btree ("_order");
  CREATE INDEX "media_tags_parent_id_idx" ON "media_tags" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_wide_sizes_wide_filename_idx" ON "media" USING btree ("sizes_wide_filename");
  CREATE INDEX "media_sizes_xl_sizes_xl_filename_idx" ON "media" USING btree ("sizes_xl_filename");
  CREATE INDEX "leads_company_idx" ON "leads" USING btree ("company_id");
  CREATE INDEX "leads_owner_idx" ON "leads" USING btree ("owner_id");
  CREATE INDEX "leads_related_project_idx" ON "leads" USING btree ("related_project_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "companies_owner_idx" ON "companies" USING btree ("owner_id");
  CREATE INDEX "companies_updated_at_idx" ON "companies" USING btree ("updated_at");
  CREATE INDEX "companies_created_at_idx" ON "companies" USING btree ("created_at");
  CREATE INDEX "deals_company_idx" ON "deals" USING btree ("company_id");
  CREATE INDEX "deals_lead_idx" ON "deals" USING btree ("lead_id");
  CREATE INDEX "deals_owner_idx" ON "deals" USING btree ("owner_id");
  CREATE INDEX "deals_project_idx" ON "deals" USING btree ("project_id");
  CREATE INDEX "deals_updated_at_idx" ON "deals" USING btree ("updated_at");
  CREATE INDEX "deals_created_at_idx" ON "deals" USING btree ("created_at");
  CREATE INDEX "activities_lead_idx" ON "activities" USING btree ("lead_id");
  CREATE INDEX "activities_company_idx" ON "activities" USING btree ("company_id");
  CREATE INDEX "activities_deal_idx" ON "activities" USING btree ("deal_id");
  CREATE INDEX "activities_owner_idx" ON "activities" USING btree ("owner_id");
  CREATE INDEX "activities_updated_at_idx" ON "activities" USING btree ("updated_at");
  CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_companies_id_idx" ON "payload_locked_documents_rels" USING btree ("companies_id");
  CREATE INDEX "payload_locked_documents_rels_deals_id_idx" ON "payload_locked_documents_rels" USING btree ("deals_id");
  CREATE INDEX "payload_locked_documents_rels_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("activities_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_default_o_g_idx" ON "site_settings" USING btree ("default_o_g_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_categories" CASCADE;
  DROP TABLE "projects_blocks_case_hero" CASCADE;
  DROP TABLE "projects_blocks_manifesto" CASCADE;
  DROP TABLE "projects_blocks_full_bleed_media" CASCADE;
  DROP TABLE "projects_blocks_split_media" CASCADE;
  DROP TABLE "projects_blocks_media_mosaic_items" CASCADE;
  DROP TABLE "projects_blocks_media_mosaic" CASCADE;
  DROP TABLE "projects_blocks_sticky_story_frames" CASCADE;
  DROP TABLE "projects_blocks_sticky_story" CASCADE;
  DROP TABLE "projects_blocks_metrics_items" CASCADE;
  DROP TABLE "projects_blocks_metrics" CASCADE;
  DROP TABLE "projects_blocks_before_after" CASCADE;
  DROP TABLE "projects_blocks_quote" CASCADE;
  DROP TABLE "projects_blocks_process_steps" CASCADE;
  DROP TABLE "projects_blocks_process" CASCADE;
  DROP TABLE "projects_blocks_gallery_items" CASCADE;
  DROP TABLE "projects_blocks_gallery" CASCADE;
  DROP TABLE "projects_blocks_device_showcase" CASCADE;
  DROP TABLE "projects_blocks_credits_items" CASCADE;
  DROP TABLE "projects_blocks_credits" CASCADE;
  DROP TABLE "projects_blocks_next_project" CASCADE;
  DROP TABLE "projects_blocks_horizontal_story_scenes" CASCADE;
  DROP TABLE "projects_blocks_horizontal_story" CASCADE;
  DROP TABLE "projects_blocks_layered_media_layers" CASCADE;
  DROP TABLE "projects_blocks_layered_media" CASCADE;
  DROP TABLE "projects_blocks_typography_takeover" CASCADE;
  DROP TABLE "projects_blocks_video_chapter" CASCADE;
  DROP TABLE "projects_blocks_comparison_items" CASCADE;
  DROP TABLE "projects_blocks_comparison" CASCADE;
  DROP TABLE "projects_blocks_artifact_stack_items" CASCADE;
  DROP TABLE "projects_blocks_artifact_stack" CASCADE;
  DROP TABLE "projects_blocks_text_media" CASCADE;
  DROP TABLE "projects_blocks_cta" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "_projects_v_version_categories" CASCADE;
  DROP TABLE "_projects_v_blocks_case_hero" CASCADE;
  DROP TABLE "_projects_v_blocks_manifesto" CASCADE;
  DROP TABLE "_projects_v_blocks_full_bleed_media" CASCADE;
  DROP TABLE "_projects_v_blocks_split_media" CASCADE;
  DROP TABLE "_projects_v_blocks_media_mosaic_items" CASCADE;
  DROP TABLE "_projects_v_blocks_media_mosaic" CASCADE;
  DROP TABLE "_projects_v_blocks_sticky_story_frames" CASCADE;
  DROP TABLE "_projects_v_blocks_sticky_story" CASCADE;
  DROP TABLE "_projects_v_blocks_metrics_items" CASCADE;
  DROP TABLE "_projects_v_blocks_metrics" CASCADE;
  DROP TABLE "_projects_v_blocks_before_after" CASCADE;
  DROP TABLE "_projects_v_blocks_quote" CASCADE;
  DROP TABLE "_projects_v_blocks_process_steps" CASCADE;
  DROP TABLE "_projects_v_blocks_process" CASCADE;
  DROP TABLE "_projects_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_projects_v_blocks_gallery" CASCADE;
  DROP TABLE "_projects_v_blocks_device_showcase" CASCADE;
  DROP TABLE "_projects_v_blocks_credits_items" CASCADE;
  DROP TABLE "_projects_v_blocks_credits" CASCADE;
  DROP TABLE "_projects_v_blocks_next_project" CASCADE;
  DROP TABLE "_projects_v_blocks_horizontal_story_scenes" CASCADE;
  DROP TABLE "_projects_v_blocks_horizontal_story" CASCADE;
  DROP TABLE "_projects_v_blocks_layered_media_layers" CASCADE;
  DROP TABLE "_projects_v_blocks_layered_media" CASCADE;
  DROP TABLE "_projects_v_blocks_typography_takeover" CASCADE;
  DROP TABLE "_projects_v_blocks_video_chapter" CASCADE;
  DROP TABLE "_projects_v_blocks_comparison_items" CASCADE;
  DROP TABLE "_projects_v_blocks_comparison" CASCADE;
  DROP TABLE "_projects_v_blocks_artifact_stack_items" CASCADE;
  DROP TABLE "_projects_v_blocks_artifact_stack" CASCADE;
  DROP TABLE "_projects_v_blocks_text_media" CASCADE;
  DROP TABLE "_projects_v_blocks_cta" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "media_tags" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "companies" CASCADE;
  DROP TABLE "deals" CASCADE;
  DROP TABLE "activities" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_projects_blocks_case_hero_layout";
  DROP TYPE "public"."enum_projects_blocks_case_hero_theme";
  DROP TYPE "public"."enum_projects_blocks_manifesto_size";
  DROP TYPE "public"."enum_projects_blocks_manifesto_align";
  DROP TYPE "public"."enum_projects_blocks_manifesto_theme";
  DROP TYPE "public"."enum_projects_blocks_full_bleed_media_height";
  DROP TYPE "public"."enum_projects_blocks_full_bleed_media_fit";
  DROP TYPE "public"."enum_projects_blocks_full_bleed_media_theme";
  DROP TYPE "public"."enum_projects_blocks_split_media_ratio";
  DROP TYPE "public"."enum_projects_blocks_split_media_gap";
  DROP TYPE "public"."enum_projects_blocks_split_media_theme";
  DROP TYPE "public"."enum_projects_blocks_media_mosaic_items_span";
  DROP TYPE "public"."enum_projects_blocks_media_mosaic_layout";
  DROP TYPE "public"."enum_projects_blocks_media_mosaic_theme";
  DROP TYPE "public"."enum_projects_blocks_sticky_story_pin";
  DROP TYPE "public"."enum_projects_blocks_sticky_story_theme";
  DROP TYPE "public"."enum_projects_blocks_metrics_style";
  DROP TYPE "public"."enum_projects_blocks_metrics_theme";
  DROP TYPE "public"."enum_projects_blocks_before_after_mode";
  DROP TYPE "public"."enum_projects_blocks_before_after_theme";
  DROP TYPE "public"."enum_projects_blocks_quote_size";
  DROP TYPE "public"."enum_projects_blocks_quote_theme";
  DROP TYPE "public"."enum_projects_blocks_process_mode";
  DROP TYPE "public"."enum_projects_blocks_process_theme";
  DROP TYPE "public"."enum_projects_blocks_gallery_mode";
  DROP TYPE "public"."enum_projects_blocks_gallery_theme";
  DROP TYPE "public"."enum_projects_blocks_device_showcase_device";
  DROP TYPE "public"."enum_projects_blocks_device_showcase_theme";
  DROP TYPE "public"."enum_projects_blocks_credits_theme";
  DROP TYPE "public"."enum_projects_blocks_next_project_mode";
  DROP TYPE "public"."enum_projects_blocks_next_project_theme";
  DROP TYPE "public"."enum_projects_blocks_horizontal_story_mode";
  DROP TYPE "public"."enum_projects_blocks_horizontal_story_theme";
  DROP TYPE "public"."enum_projects_blocks_layered_media_mode";
  DROP TYPE "public"."enum_projects_blocks_layered_media_theme";
  DROP TYPE "public"."enum_projects_blocks_typography_takeover_mode";
  DROP TYPE "public"."enum_projects_blocks_typography_takeover_align";
  DROP TYPE "public"."enum_projects_blocks_typography_takeover_theme";
  DROP TYPE "public"."enum_projects_blocks_video_chapter_mode";
  DROP TYPE "public"."enum_projects_blocks_video_chapter_theme";
  DROP TYPE "public"."enum_projects_blocks_comparison_mode";
  DROP TYPE "public"."enum_projects_blocks_comparison_theme";
  DROP TYPE "public"."enum_projects_blocks_artifact_stack_mode";
  DROP TYPE "public"."enum_projects_blocks_artifact_stack_theme";
  DROP TYPE "public"."enum_projects_blocks_text_media_layout";
  DROP TYPE "public"."enum_projects_blocks_text_media_theme";
  DROP TYPE "public"."enum_projects_blocks_cta_mode";
  DROP TYPE "public"."enum_projects_blocks_cta_theme";
  DROP TYPE "public"."enum_projects_kind";
  DROP TYPE "public"."enum_projects_page_theme";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_blocks_case_hero_layout";
  DROP TYPE "public"."enum__projects_v_blocks_case_hero_theme";
  DROP TYPE "public"."enum__projects_v_blocks_manifesto_size";
  DROP TYPE "public"."enum__projects_v_blocks_manifesto_align";
  DROP TYPE "public"."enum__projects_v_blocks_manifesto_theme";
  DROP TYPE "public"."enum__projects_v_blocks_full_bleed_media_height";
  DROP TYPE "public"."enum__projects_v_blocks_full_bleed_media_fit";
  DROP TYPE "public"."enum__projects_v_blocks_full_bleed_media_theme";
  DROP TYPE "public"."enum__projects_v_blocks_split_media_ratio";
  DROP TYPE "public"."enum__projects_v_blocks_split_media_gap";
  DROP TYPE "public"."enum__projects_v_blocks_split_media_theme";
  DROP TYPE "public"."enum__projects_v_blocks_media_mosaic_items_span";
  DROP TYPE "public"."enum__projects_v_blocks_media_mosaic_layout";
  DROP TYPE "public"."enum__projects_v_blocks_media_mosaic_theme";
  DROP TYPE "public"."enum__projects_v_blocks_sticky_story_pin";
  DROP TYPE "public"."enum__projects_v_blocks_sticky_story_theme";
  DROP TYPE "public"."enum__projects_v_blocks_metrics_style";
  DROP TYPE "public"."enum__projects_v_blocks_metrics_theme";
  DROP TYPE "public"."enum__projects_v_blocks_before_after_mode";
  DROP TYPE "public"."enum__projects_v_blocks_before_after_theme";
  DROP TYPE "public"."enum__projects_v_blocks_quote_size";
  DROP TYPE "public"."enum__projects_v_blocks_quote_theme";
  DROP TYPE "public"."enum__projects_v_blocks_process_mode";
  DROP TYPE "public"."enum__projects_v_blocks_process_theme";
  DROP TYPE "public"."enum__projects_v_blocks_gallery_mode";
  DROP TYPE "public"."enum__projects_v_blocks_gallery_theme";
  DROP TYPE "public"."enum__projects_v_blocks_device_showcase_device";
  DROP TYPE "public"."enum__projects_v_blocks_device_showcase_theme";
  DROP TYPE "public"."enum__projects_v_blocks_credits_theme";
  DROP TYPE "public"."enum__projects_v_blocks_next_project_mode";
  DROP TYPE "public"."enum__projects_v_blocks_next_project_theme";
  DROP TYPE "public"."enum__projects_v_blocks_horizontal_story_mode";
  DROP TYPE "public"."enum__projects_v_blocks_horizontal_story_theme";
  DROP TYPE "public"."enum__projects_v_blocks_layered_media_mode";
  DROP TYPE "public"."enum__projects_v_blocks_layered_media_theme";
  DROP TYPE "public"."enum__projects_v_blocks_typography_takeover_mode";
  DROP TYPE "public"."enum__projects_v_blocks_typography_takeover_align";
  DROP TYPE "public"."enum__projects_v_blocks_typography_takeover_theme";
  DROP TYPE "public"."enum__projects_v_blocks_video_chapter_mode";
  DROP TYPE "public"."enum__projects_v_blocks_video_chapter_theme";
  DROP TYPE "public"."enum__projects_v_blocks_comparison_mode";
  DROP TYPE "public"."enum__projects_v_blocks_comparison_theme";
  DROP TYPE "public"."enum__projects_v_blocks_artifact_stack_mode";
  DROP TYPE "public"."enum__projects_v_blocks_artifact_stack_theme";
  DROP TYPE "public"."enum__projects_v_blocks_text_media_layout";
  DROP TYPE "public"."enum__projects_v_blocks_text_media_theme";
  DROP TYPE "public"."enum__projects_v_blocks_cta_mode";
  DROP TYPE "public"."enum__projects_v_blocks_cta_theme";
  DROP TYPE "public"."enum__projects_v_version_kind";
  DROP TYPE "public"."enum__projects_v_version_page_theme";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_media_kind";
  DROP TYPE "public"."enum_leads_service";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_source";
  DROP TYPE "public"."enum_deals_stage";
  DROP TYPE "public"."enum_deals_currency";
  DROP TYPE "public"."enum_activities_type";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
