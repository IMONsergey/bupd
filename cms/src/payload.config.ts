import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Activities } from './collections/Activities'
import { Companies } from './collections/Companies'
import { Deals } from './collections/Deals'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const postgresURL = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
const db = postgresURL
  ? postgresAdapter({
      push: false,
      pool: {
        connectionString: postgresURL,
      },
      prodMigrations: migrations,
    })
  : sqliteAdapter({
      client: {
        url: process.env.DATABASE_URL || 'file:./cms.db',
      },
    })

const plugins: Plugin[] = []

if (process.env.BLOB_READ_WRITE_TOKEN) {
  plugins.push(
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  )
}

const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_SERVER_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4173',
].filter(Boolean) as string[]

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: 'dark',
    dateFormat: 'dd.MM.yyyy HH:mm',
    meta: {
      titleSuffix: ' — BAEV OS',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ['./admin/NavShortcuts#default'],
      graphics: {
        Logo: './admin/Logo#default',
        Icon: './admin/Icon#default',
      },
      views: {
        caseSystem: {
          Component: './admin/views/CaseSystemView#default',
          path: '/case-system',
        },
        pipeline: {
          Component: './admin/views/PipelineView#default',
          path: '/pipeline',
        },
        crm: {
          Component: './admin/views/CRMHomeView#default',
          path: '/crm',
        },
      },
    },
    dashboard: {
      widgets: [
        {
          slug: 'overview',
          label: 'BAEV overview',
          Component: './admin/widgets/OverviewWidget#default',
          minWidth: 'full',
          maxWidth: 'full',
        },
        {
          slug: 'quick-actions',
          label: 'Быстрые действия',
          Component: './admin/widgets/QuickActionsWidget#default',
          minWidth: 'small',
          maxWidth: 'medium',
        },
        {
          slug: 'recent-projects',
          label: 'Последние кейсы',
          Component: './admin/widgets/RecentProjectsWidget#default',
          minWidth: 'medium',
          maxWidth: 'large',
        },
        {
          slug: 'pipeline',
          label: 'Pipeline',
          Component: './admin/widgets/PipelineWidget#default',
          minWidth: 'full',
          maxWidth: 'full',
        },
        {
          slug: 'lead-inbox',
          label: 'Lead inbox',
          Component: './admin/widgets/LeadInboxWidget#default',
          minWidth: 'medium',
          maxWidth: 'large',
        },
        {
          slug: 'activities',
          label: 'Следующие действия',
          Component: './admin/widgets/ActivitiesWidget#default',
          minWidth: 'medium',
          maxWidth: 'large',
        },
        {
          slug: 'block-library',
          label: 'Case system',
          Component: './admin/widgets/BlockLibraryWidget#default',
          minWidth: 'full',
          maxWidth: 'full',
        },
      ],
      defaultLayout: [
        { widgetSlug: 'overview', width: 'full' },
        { widgetSlug: 'quick-actions', width: 'small' },
        { widgetSlug: 'recent-projects', width: 'large' },
        { widgetSlug: 'lead-inbox', width: 'medium' },
        { widgetSlug: 'activities', width: 'medium' },
        { widgetSlug: 'pipeline', width: 'full' },
        { widgetSlug: 'block-library', width: 'full' },
      ],
    },
    livePreview: {
      collections: ['projects'],
      openByDefault: false,
      breakpoints: [
        { name: 'desktop', label: 'Desktop 1440', width: 1440, height: 900 },
        { name: 'laptop', label: 'Laptop 1200', width: 1200, height: 800 },
        { name: 'tablet', label: 'Tablet 768', width: 768, height: 1024 },
        { name: 'mobile', label: 'Mobile 390', width: 390, height: 844 },
      ],
    },
  },
  collections: [Projects, Media, Leads, Companies, Deals, Activities, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'development-only-secret-change-me',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001',
  cors: allowedOrigins,
  csrf: allowedOrigins,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db,
  sharp,
  plugins,
})

