import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

export async function getStudioSession() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return { payload, user }
}

export async function requireStudioUser() {
  const session = await getStudioSession()
  if (!session.user) redirect('/studio/login')
  return session as typeof session & { user: NonNullable<typeof session.user> }
}

export function studioRole(user: unknown) {
  if (!user || typeof user !== 'object' || !('role' in user)) return ''
  return String((user as { role?: unknown }).role || '')
}

export function canContent(role: string) {
  return role === 'admin' || role === 'editor'
}

export function canSales(role: string) {
  return role === 'admin' || role === 'sales'
}

export async function requireContentUser() {
  const session = await requireStudioUser()
  if (!canContent(studioRole(session.user))) redirect('/studio')
  return session
}

export async function requireSalesUser() {
  const session = await requireStudioUser()
  if (!canSales(studioRole(session.user))) redirect('/studio')
  return session
}

export async function requireAdminUser() {
  const session = await requireStudioUser()
  if (studioRole(session.user) !== 'admin') redirect('/studio')
  return session
}
