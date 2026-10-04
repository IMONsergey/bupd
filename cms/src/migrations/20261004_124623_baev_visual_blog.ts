import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_blocks_article_text_width" AS ENUM('reading', 'wide');
  CREATE TYPE "public"."enum_articles_blocks_article_text_theme" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_articles_blocks_full_bleed_media_height" AS ENUM('auto', '70vh', 'screen', '120vh');
  CREATE TYPE "public"."enum_articles_blocks_full_bleed_media_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_articles_blocks_full_bleed_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_split_media_ratio" AS ENUM('1-1', '1-2', '2-1');
  CREATE TYPE "public"."enum_articles_blocks_split_media_gap" AS ENUM('none', 'xs', 's', 'm');
  CREATE TYPE "public"."enum_articles_blocks_split_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_media_mosaic_items_span" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_articles_blocks_media_mosaic_layout" AS ENUM('editorial', 'grid', 'rail', 'staggered');
  CREATE TYPE "public"."enum_articles_blocks_media_mosaic_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_metrics_style" AS ENUM('rail', 'cards', 'oversized');
  CREATE TYPE "public"."enum_articles_blocks_metrics_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_quote_size" AS ENUM('l', 'xl', 'display');
  CREATE TYPE "public"."enum_articles_blocks_quote_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_process_mode" AS ENUM('timeline', 'accordion', 'sticky');
  CREATE TYPE "public"."enum_articles_blocks_process_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_gallery_mode" AS ENUM('drag', 'cursor', 'stack', 'filmstrip');
  CREATE TYPE "public"."enum_articles_blocks_gallery_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_video_chapter_mode" AS ENUM('inline', 'full', 'sticky');
  CREATE TYPE "public"."enum_articles_blocks_video_chapter_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_text_media_layout" AS ENUM('text-left', 'text-right', 'balanced');
  CREATE TYPE "public"."enum_articles_blocks_text_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_blocks_cta_mode" AS ENUM('minimal', 'statement', 'media');
  CREATE TYPE "public"."enum_articles_blocks_cta_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum_articles_page_theme" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_articles_workflow_status" AS ENUM('draft', 'review', 'ready', 'paused');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_blocks_article_text_width" AS ENUM('reading', 'wide');
  CREATE TYPE "public"."enum__articles_v_blocks_article_text_theme" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__articles_v_blocks_full_bleed_media_height" AS ENUM('auto', '70vh', 'screen', '120vh');
  CREATE TYPE "public"."enum__articles_v_blocks_full_bleed_media_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__articles_v_blocks_full_bleed_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_split_media_ratio" AS ENUM('1-1', '1-2', '2-1');
  CREATE TYPE "public"."enum__articles_v_blocks_split_media_gap" AS ENUM('none', 'xs', 's', 'm');
  CREATE TYPE "public"."enum__articles_v_blocks_split_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_media_mosaic_items_span" AS ENUM('1', '2');
  CREATE TYPE "public"."enum__articles_v_blocks_media_mosaic_layout" AS ENUM('editorial', 'grid', 'rail', 'staggered');
  CREATE TYPE "public"."enum__articles_v_blocks_media_mosaic_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_metrics_style" AS ENUM('rail', 'cards', 'oversized');
  CREATE TYPE "public"."enum__articles_v_blocks_metrics_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_quote_size" AS ENUM('l', 'xl', 'display');
  CREATE TYPE "public"."enum__articles_v_blocks_quote_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_process_mode" AS ENUM('timeline', 'accordion', 'sticky');
  CREATE TYPE "public"."enum__articles_v_blocks_process_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_gallery_mode" AS ENUM('drag', 'cursor', 'stack', 'filmstrip');
  CREATE TYPE "public"."enum__articles_v_blocks_gallery_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_video_chapter_mode" AS ENUM('inline', 'full', 'sticky');
  CREATE TYPE "public"."enum__articles_v_blocks_video_chapter_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_text_media_layout" AS ENUM('text-left', 'text-right', 'balanced');
  CREATE TYPE "public"."enum__articles_v_blocks_text_media_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_cta_mode" AS ENUM('minimal', 'statement', 'media');
  CREATE TYPE "public"."enum__articles_v_blocks_cta_theme" AS ENUM('dark', 'light', 'media');
  CREATE TYPE "public"."enum__articles_v_version_page_theme" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__articles_v_version_workflow_status" AS ENUM('draft', 'review', 'ready', 'paused');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "articles_categories" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar
  );

  CREATE TABLE "articles_blocks_article_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" jsonb,
    "width" "enum_articles_blocks_article_text_width" DEFAULT 'reading',
    "theme" "enum_articles_blocks_article_text_theme" DEFAULT 'light',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_full_bleed_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "height" "enum_articles_blocks_full_bleed_media_height" DEFAULT 'screen',
    "fit" "enum_articles_blocks_full_bleed_media_fit" DEFAULT 'cover',
    "theme" "enum_articles_blocks_full_bleed_media_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_split_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "left_id" integer,
    "right_id" integer,
    "ratio" "enum_articles_blocks_split_media_ratio" DEFAULT '1-1',
    "gap" "enum_articles_blocks_split_media_gap" DEFAULT 's',
    "theme" "enum_articles_blocks_split_media_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_media_mosaic_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "span" "enum_articles_blocks_media_mosaic_items_span" DEFAULT '1'
  );

  CREATE TABLE "articles_blocks_media_mosaic" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "layout" "enum_articles_blocks_media_mosaic_layout" DEFAULT 'editorial',
    "theme" "enum_articles_blocks_media_mosaic_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_metrics_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "note" varchar
  );

  CREATE TABLE "articles_blocks_metrics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "style" "enum_articles_blocks_metrics_style" DEFAULT 'rail',
    "theme" "enum_articles_blocks_metrics_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_quote" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar,
    "author" varchar,
    "role" varchar,
    "size" "enum_articles_blocks_quote_size" DEFAULT 'xl',
    "theme" "enum_articles_blocks_quote_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_process_steps" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "number" varchar,
    "title" varchar,
    "body" varchar,
    "media_id" integer
  );

  CREATE TABLE "articles_blocks_process" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "mode" "enum_articles_blocks_process_mode" DEFAULT 'timeline',
    "theme" "enum_articles_blocks_process_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar
  );

  CREATE TABLE "articles_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "mode" "enum_articles_blocks_gallery_mode" DEFAULT 'drag',
    "theme" "enum_articles_blocks_gallery_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_video_chapter" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "video_id" integer,
    "poster_id" integer,
    "title" varchar,
    "caption" varchar,
    "mode" "enum_articles_blocks_video_chapter_mode" DEFAULT 'inline',
    "autoplay" boolean DEFAULT true,
    "loop" boolean DEFAULT true,
    "theme" "enum_articles_blocks_video_chapter_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_text_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "body" jsonb,
    "media_id" integer,
    "layout" "enum_articles_blocks_text_media_layout" DEFAULT 'text-left',
    "theme" "enum_articles_blocks_text_media_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" varchar,
    "button_label" varchar DEFAULT 'Обсудить проект',
    "button_u_r_l" varchar DEFAULT '/contact',
    "media_id" integer,
    "mode" "enum_articles_blocks_cta_mode" DEFAULT 'statement',
    "theme" "enum_articles_blocks_cta_theme" DEFAULT 'dark',
    "block_name" varchar
  );

  CREATE TABLE "articles" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "author" varchar,
    "published_at" timestamp(3) with time zone,
    "summary" varchar,
    "cover_id" integer,
    "page_theme" "enum_articles_page_theme" DEFAULT 'light',
    "featured" boolean DEFAULT false,
    "workflow_status" "enum_articles_workflow_status" DEFAULT 'draft',
    "seo_title" varchar,
    "seo_description" varchar,
    "og_image_id" integer,
    "canonical_u_r_l" varchar,
    "no_index" boolean DEFAULT false,
    "owner_id" integer,
    "internal_notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_articles_status" DEFAULT 'draft'
  );

  CREATE TABLE "_articles_v_version_categories" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_article_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" jsonb,
    "width" "enum__articles_v_blocks_article_text_width" DEFAULT 'reading',
    "theme" "enum__articles_v_blocks_article_text_theme" DEFAULT 'light',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_full_bleed_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "height" "enum__articles_v_blocks_full_bleed_media_height" DEFAULT 'screen',
    "fit" "enum__articles_v_blocks_full_bleed_media_fit" DEFAULT 'cover',
    "theme" "enum__articles_v_blocks_full_bleed_media_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_split_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "left_id" integer,
    "right_id" integer,
    "ratio" "enum__articles_v_blocks_split_media_ratio" DEFAULT '1-1',
    "gap" "enum__articles_v_blocks_split_media_gap" DEFAULT 's',
    "theme" "enum__articles_v_blocks_split_media_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_media_mosaic_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "span" "enum__articles_v_blocks_media_mosaic_items_span" DEFAULT '1',
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_media_mosaic" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "layout" "enum__articles_v_blocks_media_mosaic_layout" DEFAULT 'editorial',
    "theme" "enum__articles_v_blocks_media_mosaic_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_metrics_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "note" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_metrics" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "style" "enum__articles_v_blocks_metrics_style" DEFAULT 'rail',
    "theme" "enum__articles_v_blocks_metrics_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_quote" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "text" varchar,
    "author" varchar,
    "role" varchar,
    "size" "enum__articles_v_blocks_quote_size" DEFAULT 'xl',
    "theme" "enum__articles_v_blocks_quote_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_process_steps" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "number" varchar,
    "title" varchar,
    "body" varchar,
    "media_id" integer,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_process" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "mode" "enum__articles_v_blocks_process_mode" DEFAULT 'timeline',
    "theme" "enum__articles_v_blocks_process_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_gallery_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_articles_v_blocks_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "mode" "enum__articles_v_blocks_gallery_mode" DEFAULT 'drag',
    "theme" "enum__articles_v_blocks_gallery_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_video_chapter" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "video_id" integer,
    "poster_id" integer,
    "title" varchar,
    "caption" varchar,
    "mode" "enum__articles_v_blocks_video_chapter_mode" DEFAULT 'inline',
    "autoplay" boolean DEFAULT true,
    "loop" boolean DEFAULT true,
    "theme" "enum__articles_v_blocks_video_chapter_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_text_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "eyebrow" varchar,
    "title" varchar,
    "body" jsonb,
    "media_id" integer,
    "layout" "enum__articles_v_blocks_text_media_layout" DEFAULT 'text-left',
    "theme" "enum__articles_v_blocks_text_media_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "body" varchar,
    "button_label" varchar DEFAULT 'Обсудить проект',
    "button_u_r_l" varchar DEFAULT '/contact',
    "media_id" integer,
    "mode" "enum__articles_v_blocks_cta_mode" DEFAULT 'statement',
    "theme" "enum__articles_v_blocks_cta_theme" DEFAULT 'dark',
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE "_articles_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_author" varchar,
    "version_published_at" timestamp(3) with time zone,
    "version_summary" varchar,
    "version_cover_id" integer,
    "version_page_theme" "enum__articles_v_version_page_theme" DEFAULT 'light',
    "version_featured" boolean DEFAULT false,
    "version_workflow_status" "enum__articles_v_version_workflow_status" DEFAULT 'draft',
    "version_seo_title" varchar,
    "version_seo_description" varchar,
    "version_og_image_id" integer,
    "version_canonical_u_r_l" varchar,
    "version_no_index" boolean DEFAULT false,
    "version_owner_id" integer,
    "version_internal_notes" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__articles_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "latest" boolean,
    "autosave" boolean
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "articles_categories" ADD CONSTRAINT "articles_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_article_text" ADD CONSTRAINT "articles_blocks_article_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_full_bleed_media" ADD CONSTRAINT "articles_blocks_full_bleed_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_full_bleed_media" ADD CONSTRAINT "articles_blocks_full_bleed_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_split_media" ADD CONSTRAINT "articles_blocks_split_media_left_id_media_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_split_media" ADD CONSTRAINT "articles_blocks_split_media_right_id_media_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_split_media" ADD CONSTRAINT "articles_blocks_split_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_media_mosaic_items" ADD CONSTRAINT "articles_blocks_media_mosaic_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_media_mosaic_items" ADD CONSTRAINT "articles_blocks_media_mosaic_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_media_mosaic"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_media_mosaic" ADD CONSTRAINT "articles_blocks_media_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_metrics_items" ADD CONSTRAINT "articles_blocks_metrics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_metrics" ADD CONSTRAINT "articles_blocks_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_quote" ADD CONSTRAINT "articles_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_process_steps" ADD CONSTRAINT "articles_blocks_process_steps_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_process_steps" ADD CONSTRAINT "articles_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_process" ADD CONSTRAINT "articles_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_gallery_items" ADD CONSTRAINT "articles_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_gallery_items" ADD CONSTRAINT "articles_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_gallery" ADD CONSTRAINT "articles_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_video_chapter" ADD CONSTRAINT "articles_blocks_video_chapter_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_video_chapter" ADD CONSTRAINT "articles_blocks_video_chapter_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_video_chapter" ADD CONSTRAINT "articles_blocks_video_chapter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_text_media" ADD CONSTRAINT "articles_blocks_text_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_text_media" ADD CONSTRAINT "articles_blocks_text_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_cta" ADD CONSTRAINT "articles_blocks_cta_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_cta" ADD CONSTRAINT "articles_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_version_categories" ADD CONSTRAINT "_articles_v_version_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_article_text" ADD CONSTRAINT "_articles_v_blocks_article_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_full_bleed_media" ADD CONSTRAINT "_articles_v_blocks_full_bleed_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_full_bleed_media" ADD CONSTRAINT "_articles_v_blocks_full_bleed_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_split_media" ADD CONSTRAINT "_articles_v_blocks_split_media_left_id_media_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_split_media" ADD CONSTRAINT "_articles_v_blocks_split_media_right_id_media_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_split_media" ADD CONSTRAINT "_articles_v_blocks_split_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_media_mosaic_items" ADD CONSTRAINT "_articles_v_blocks_media_mosaic_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_media_mosaic_items" ADD CONSTRAINT "_articles_v_blocks_media_mosaic_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_media_mosaic"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_media_mosaic" ADD CONSTRAINT "_articles_v_blocks_media_mosaic_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_metrics_items" ADD CONSTRAINT "_articles_v_blocks_metrics_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_metrics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_metrics" ADD CONSTRAINT "_articles_v_blocks_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_quote" ADD CONSTRAINT "_articles_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_process_steps" ADD CONSTRAINT "_articles_v_blocks_process_steps_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_process_steps" ADD CONSTRAINT "_articles_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_process" ADD CONSTRAINT "_articles_v_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_gallery_items" ADD CONSTRAINT "_articles_v_blocks_gallery_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_gallery_items" ADD CONSTRAINT "_articles_v_blocks_gallery_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v_blocks_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_gallery" ADD CONSTRAINT "_articles_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_video_chapter" ADD CONSTRAINT "_articles_v_blocks_video_chapter_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_video_chapter" ADD CONSTRAINT "_articles_v_blocks_video_chapter_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_video_chapter" ADD CONSTRAINT "_articles_v_blocks_video_chapter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_text_media" ADD CONSTRAINT "_articles_v_blocks_text_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_text_media" ADD CONSTRAINT "_articles_v_blocks_text_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_cta" ADD CONSTRAINT "_articles_v_blocks_cta_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_blocks_cta" ADD CONSTRAINT "_articles_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_owner_id_users_id_fk" FOREIGN KEY ("version_owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "articles_categories_order_idx" ON "articles_categories" USING btree ("_order");
  CREATE INDEX "articles_categories_parent_id_idx" ON "articles_categories" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_article_text_order_idx" ON "articles_blocks_article_text" USING btree ("_order");
  CREATE INDEX "articles_blocks_article_text_parent_id_idx" ON "articles_blocks_article_text" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_article_text_path_idx" ON "articles_blocks_article_text" USING btree ("_path");
  CREATE INDEX "articles_blocks_full_bleed_media_order_idx" ON "articles_blocks_full_bleed_media" USING btree ("_order");
  CREATE INDEX "articles_blocks_full_bleed_media_parent_id_idx" ON "articles_blocks_full_bleed_media" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_full_bleed_media_path_idx" ON "articles_blocks_full_bleed_media" USING btree ("_path");
  CREATE INDEX "articles_blocks_full_bleed_media_media_idx" ON "articles_blocks_full_bleed_media" USING btree ("media_id");
  CREATE INDEX "articles_blocks_split_media_order_idx" ON "articles_blocks_split_media" USING btree ("_order");
  CREATE INDEX "articles_blocks_split_media_parent_id_idx" ON "articles_blocks_split_media" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_split_media_path_idx" ON "articles_blocks_split_media" USING btree ("_path");
  CREATE INDEX "articles_blocks_split_media_left_idx" ON "articles_blocks_split_media" USING btree ("left_id");
  CREATE INDEX "articles_blocks_split_media_right_idx" ON "articles_blocks_split_media" USING btree ("right_id");
  CREATE INDEX "articles_blocks_media_mosaic_items_order_idx" ON "articles_blocks_media_mosaic_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_media_mosaic_items_parent_id_idx" ON "articles_blocks_media_mosaic_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_media_mosaic_items_media_idx" ON "articles_blocks_media_mosaic_items" USING btree ("media_id");
  CREATE INDEX "articles_blocks_media_mosaic_order_idx" ON "articles_blocks_media_mosaic" USING btree ("_order");
  CREATE INDEX "articles_blocks_media_mosaic_parent_id_idx" ON "articles_blocks_media_mosaic" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_media_mosaic_path_idx" ON "articles_blocks_media_mosaic" USING btree ("_path");
  CREATE INDEX "articles_blocks_metrics_items_order_idx" ON "articles_blocks_metrics_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_metrics_items_parent_id_idx" ON "articles_blocks_metrics_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_metrics_order_idx" ON "articles_blocks_metrics" USING btree ("_order");
  CREATE INDEX "articles_blocks_metrics_parent_id_idx" ON "articles_blocks_metrics" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_metrics_path_idx" ON "articles_blocks_metrics" USING btree ("_path");
  CREATE INDEX "articles_blocks_quote_order_idx" ON "articles_blocks_quote" USING btree ("_order");
  CREATE INDEX "articles_blocks_quote_parent_id_idx" ON "articles_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_quote_path_idx" ON "articles_blocks_quote" USING btree ("_path");
  CREATE INDEX "articles_blocks_process_steps_order_idx" ON "articles_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "articles_blocks_process_steps_parent_id_idx" ON "articles_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_process_steps_media_idx" ON "articles_blocks_process_steps" USING btree ("media_id");
  CREATE INDEX "articles_blocks_process_order_idx" ON "articles_blocks_process" USING btree ("_order");
  CREATE INDEX "articles_blocks_process_parent_id_idx" ON "articles_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_process_path_idx" ON "articles_blocks_process" USING btree ("_path");
  CREATE INDEX "articles_blocks_gallery_items_order_idx" ON "articles_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_gallery_items_parent_id_idx" ON "articles_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_gallery_items_media_idx" ON "articles_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "articles_blocks_gallery_order_idx" ON "articles_blocks_gallery" USING btree ("_order");
  CREATE INDEX "articles_blocks_gallery_parent_id_idx" ON "articles_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_gallery_path_idx" ON "articles_blocks_gallery" USING btree ("_path");
  CREATE INDEX "articles_blocks_video_chapter_order_idx" ON "articles_blocks_video_chapter" USING btree ("_order");
  CREATE INDEX "articles_blocks_video_chapter_parent_id_idx" ON "articles_blocks_video_chapter" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_video_chapter_path_idx" ON "articles_blocks_video_chapter" USING btree ("_path");
  CREATE INDEX "articles_blocks_video_chapter_video_idx" ON "articles_blocks_video_chapter" USING btree ("video_id");
  CREATE INDEX "articles_blocks_video_chapter_poster_idx" ON "articles_blocks_video_chapter" USING btree ("poster_id");
  CREATE INDEX "articles_blocks_text_media_order_idx" ON "articles_blocks_text_media" USING btree ("_order");
  CREATE INDEX "articles_blocks_text_media_parent_id_idx" ON "articles_blocks_text_media" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_text_media_path_idx" ON "articles_blocks_text_media" USING btree ("_path");
  CREATE INDEX "articles_blocks_text_media_media_idx" ON "articles_blocks_text_media" USING btree ("media_id");
  CREATE INDEX "articles_blocks_cta_order_idx" ON "articles_blocks_cta" USING btree ("_order");
  CREATE INDEX "articles_blocks_cta_parent_id_idx" ON "articles_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_cta_path_idx" ON "articles_blocks_cta" USING btree ("_path");
  CREATE INDEX "articles_blocks_cta_media_idx" ON "articles_blocks_cta" USING btree ("media_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "articles_og_image_idx" ON "articles" USING btree ("og_image_id");
  CREATE INDEX "articles_owner_idx" ON "articles" USING btree ("owner_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "_articles_v_version_categories_order_idx" ON "_articles_v_version_categories" USING btree ("_order");
  CREATE INDEX "_articles_v_version_categories_parent_id_idx" ON "_articles_v_version_categories" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_article_text_order_idx" ON "_articles_v_blocks_article_text" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_article_text_parent_id_idx" ON "_articles_v_blocks_article_text" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_article_text_path_idx" ON "_articles_v_blocks_article_text" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_full_bleed_media_order_idx" ON "_articles_v_blocks_full_bleed_media" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_full_bleed_media_parent_id_idx" ON "_articles_v_blocks_full_bleed_media" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_full_bleed_media_path_idx" ON "_articles_v_blocks_full_bleed_media" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_full_bleed_media_media_idx" ON "_articles_v_blocks_full_bleed_media" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_split_media_order_idx" ON "_articles_v_blocks_split_media" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_split_media_parent_id_idx" ON "_articles_v_blocks_split_media" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_split_media_path_idx" ON "_articles_v_blocks_split_media" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_split_media_left_idx" ON "_articles_v_blocks_split_media" USING btree ("left_id");
  CREATE INDEX "_articles_v_blocks_split_media_right_idx" ON "_articles_v_blocks_split_media" USING btree ("right_id");
  CREATE INDEX "_articles_v_blocks_media_mosaic_items_order_idx" ON "_articles_v_blocks_media_mosaic_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_media_mosaic_items_parent_id_idx" ON "_articles_v_blocks_media_mosaic_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_media_mosaic_items_media_idx" ON "_articles_v_blocks_media_mosaic_items" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_media_mosaic_order_idx" ON "_articles_v_blocks_media_mosaic" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_media_mosaic_parent_id_idx" ON "_articles_v_blocks_media_mosaic" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_media_mosaic_path_idx" ON "_articles_v_blocks_media_mosaic" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_metrics_items_order_idx" ON "_articles_v_blocks_metrics_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_metrics_items_parent_id_idx" ON "_articles_v_blocks_metrics_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_metrics_order_idx" ON "_articles_v_blocks_metrics" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_metrics_parent_id_idx" ON "_articles_v_blocks_metrics" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_metrics_path_idx" ON "_articles_v_blocks_metrics" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_quote_order_idx" ON "_articles_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_quote_parent_id_idx" ON "_articles_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_quote_path_idx" ON "_articles_v_blocks_quote" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_process_steps_order_idx" ON "_articles_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_process_steps_parent_id_idx" ON "_articles_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_process_steps_media_idx" ON "_articles_v_blocks_process_steps" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_process_order_idx" ON "_articles_v_blocks_process" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_process_parent_id_idx" ON "_articles_v_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_process_path_idx" ON "_articles_v_blocks_process" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_gallery_items_order_idx" ON "_articles_v_blocks_gallery_items" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_gallery_items_parent_id_idx" ON "_articles_v_blocks_gallery_items" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_gallery_items_media_idx" ON "_articles_v_blocks_gallery_items" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_gallery_order_idx" ON "_articles_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_gallery_parent_id_idx" ON "_articles_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_gallery_path_idx" ON "_articles_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_video_chapter_order_idx" ON "_articles_v_blocks_video_chapter" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_video_chapter_parent_id_idx" ON "_articles_v_blocks_video_chapter" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_video_chapter_path_idx" ON "_articles_v_blocks_video_chapter" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_video_chapter_video_idx" ON "_articles_v_blocks_video_chapter" USING btree ("video_id");
  CREATE INDEX "_articles_v_blocks_video_chapter_poster_idx" ON "_articles_v_blocks_video_chapter" USING btree ("poster_id");
  CREATE INDEX "_articles_v_blocks_text_media_order_idx" ON "_articles_v_blocks_text_media" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_text_media_parent_id_idx" ON "_articles_v_blocks_text_media" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_text_media_path_idx" ON "_articles_v_blocks_text_media" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_text_media_media_idx" ON "_articles_v_blocks_text_media" USING btree ("media_id");
  CREATE INDEX "_articles_v_blocks_cta_order_idx" ON "_articles_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_articles_v_blocks_cta_parent_id_idx" ON "_articles_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_blocks_cta_path_idx" ON "_articles_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_articles_v_blocks_cta_media_idx" ON "_articles_v_blocks_cta" USING btree ("media_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_cover_idx" ON "_articles_v" USING btree ("version_cover_id");
  CREATE INDEX "_articles_v_version_version_og_image_idx" ON "_articles_v" USING btree ("version_og_image_id");
  CREATE INDEX "_articles_v_version_version_owner_idx" ON "_articles_v" USING btree ("version_owner_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_article_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_full_bleed_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_split_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_media_mosaic_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_media_mosaic" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_metrics_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_video_chapter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_text_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_article_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_full_bleed_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_split_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_media_mosaic_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_media_mosaic" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_metrics_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_gallery_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_video_chapter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_text_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles_categories" CASCADE;
  DROP TABLE "articles_blocks_article_text" CASCADE;
  DROP TABLE "articles_blocks_full_bleed_media" CASCADE;
  DROP TABLE "articles_blocks_split_media" CASCADE;
  DROP TABLE "articles_blocks_media_mosaic_items" CASCADE;
  DROP TABLE "articles_blocks_media_mosaic" CASCADE;
  DROP TABLE "articles_blocks_metrics_items" CASCADE;
  DROP TABLE "articles_blocks_metrics" CASCADE;
  DROP TABLE "articles_blocks_quote" CASCADE;
  DROP TABLE "articles_blocks_process_steps" CASCADE;
  DROP TABLE "articles_blocks_process" CASCADE;
  DROP TABLE "articles_blocks_gallery_items" CASCADE;
  DROP TABLE "articles_blocks_gallery" CASCADE;
  DROP TABLE "articles_blocks_video_chapter" CASCADE;
  DROP TABLE "articles_blocks_text_media" CASCADE;
  DROP TABLE "articles_blocks_cta" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "_articles_v_version_categories" CASCADE;
  DROP TABLE "_articles_v_blocks_article_text" CASCADE;
  DROP TABLE "_articles_v_blocks_full_bleed_media" CASCADE;
  DROP TABLE "_articles_v_blocks_split_media" CASCADE;
  DROP TABLE "_articles_v_blocks_media_mosaic_items" CASCADE;
  DROP TABLE "_articles_v_blocks_media_mosaic" CASCADE;
  DROP TABLE "_articles_v_blocks_metrics_items" CASCADE;
  DROP TABLE "_articles_v_blocks_metrics" CASCADE;
  DROP TABLE "_articles_v_blocks_quote" CASCADE;
  DROP TABLE "_articles_v_blocks_process_steps" CASCADE;
  DROP TABLE "_articles_v_blocks_process" CASCADE;
  DROP TABLE "_articles_v_blocks_gallery_items" CASCADE;
  DROP TABLE "_articles_v_blocks_gallery" CASCADE;
  DROP TABLE "_articles_v_blocks_video_chapter" CASCADE;
  DROP TABLE "_articles_v_blocks_text_media" CASCADE;
  DROP TABLE "_articles_v_blocks_cta" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_articles_fk";

  DROP INDEX "payload_locked_documents_rels_articles_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "articles_id";
  DROP TYPE "public"."enum_articles_blocks_article_text_width";
  DROP TYPE "public"."enum_articles_blocks_article_text_theme";
  DROP TYPE "public"."enum_articles_blocks_full_bleed_media_height";
  DROP TYPE "public"."enum_articles_blocks_full_bleed_media_fit";
  DROP TYPE "public"."enum_articles_blocks_full_bleed_media_theme";
  DROP TYPE "public"."enum_articles_blocks_split_media_ratio";
  DROP TYPE "public"."enum_articles_blocks_split_media_gap";
  DROP TYPE "public"."enum_articles_blocks_split_media_theme";
  DROP TYPE "public"."enum_articles_blocks_media_mosaic_items_span";
  DROP TYPE "public"."enum_articles_blocks_media_mosaic_layout";
  DROP TYPE "public"."enum_articles_blocks_media_mosaic_theme";
  DROP TYPE "public"."enum_articles_blocks_metrics_style";
  DROP TYPE "public"."enum_articles_blocks_metrics_theme";
  DROP TYPE "public"."enum_articles_blocks_quote_size";
  DROP TYPE "public"."enum_articles_blocks_quote_theme";
  DROP TYPE "public"."enum_articles_blocks_process_mode";
  DROP TYPE "public"."enum_articles_blocks_process_theme";
  DROP TYPE "public"."enum_articles_blocks_gallery_mode";
  DROP TYPE "public"."enum_articles_blocks_gallery_theme";
  DROP TYPE "public"."enum_articles_blocks_video_chapter_mode";
  DROP TYPE "public"."enum_articles_blocks_video_chapter_theme";
  DROP TYPE "public"."enum_articles_blocks_text_media_layout";
  DROP TYPE "public"."enum_articles_blocks_text_media_theme";
  DROP TYPE "public"."enum_articles_blocks_cta_mode";
  DROP TYPE "public"."enum_articles_blocks_cta_theme";
  DROP TYPE "public"."enum_articles_page_theme";
  DROP TYPE "public"."enum_articles_workflow_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_blocks_article_text_width";
  DROP TYPE "public"."enum__articles_v_blocks_article_text_theme";
  DROP TYPE "public"."enum__articles_v_blocks_full_bleed_media_height";
  DROP TYPE "public"."enum__articles_v_blocks_full_bleed_media_fit";
  DROP TYPE "public"."enum__articles_v_blocks_full_bleed_media_theme";
  DROP TYPE "public"."enum__articles_v_blocks_split_media_ratio";
  DROP TYPE "public"."enum__articles_v_blocks_split_media_gap";
  DROP TYPE "public"."enum__articles_v_blocks_split_media_theme";
  DROP TYPE "public"."enum__articles_v_blocks_media_mosaic_items_span";
  DROP TYPE "public"."enum__articles_v_blocks_media_mosaic_layout";
  DROP TYPE "public"."enum__articles_v_blocks_media_mosaic_theme";
  DROP TYPE "public"."enum__articles_v_blocks_metrics_style";
  DROP TYPE "public"."enum__articles_v_blocks_metrics_theme";
  DROP TYPE "public"."enum__articles_v_blocks_quote_size";
  DROP TYPE "public"."enum__articles_v_blocks_quote_theme";
  DROP TYPE "public"."enum__articles_v_blocks_process_mode";
  DROP TYPE "public"."enum__articles_v_blocks_process_theme";
  DROP TYPE "public"."enum__articles_v_blocks_gallery_mode";
  DROP TYPE "public"."enum__articles_v_blocks_gallery_theme";
  DROP TYPE "public"."enum__articles_v_blocks_video_chapter_mode";
  DROP TYPE "public"."enum__articles_v_blocks_video_chapter_theme";
  DROP TYPE "public"."enum__articles_v_blocks_text_media_layout";
  DROP TYPE "public"."enum__articles_v_blocks_text_media_theme";
  DROP TYPE "public"."enum__articles_v_blocks_cta_mode";
  DROP TYPE "public"."enum__articles_v_blocks_cta_theme";
  DROP TYPE "public"."enum__articles_v_version_page_theme";
  DROP TYPE "public"."enum__articles_v_version_workflow_status";
  DROP TYPE "public"."enum__articles_v_version_status";`)
}
