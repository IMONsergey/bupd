import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type BAEVRole = 'admin' | 'editor' | 'sales'

const roleOf = (req: PayloadRequest): BAEVRole | undefined => {
  const role = req.user && 'role' in req.user ? req.user.role : undefined
  return role as BAEVRole | undefined
}

export const isAdmin = (req: PayloadRequest) => roleOf(req) === 'admin'
export const isEditor = (req: PayloadRequest) => ['admin', 'editor'].includes(roleOf(req) || '')
export const isSales = (req: PayloadRequest) => ['admin', 'sales'].includes(roleOf(req) || '')

export const adminOnly: Access = ({ req }) => isAdmin(req)
export const contentAccess: Access = ({ req }) => isEditor(req)
export const crmAccess: Access = ({ req }) => isSales(req)
export const authenticated: Access = ({ req }) => Boolean(req.user)

export const publicOrEditor: Access = ({ req }) => {
  if (isEditor(req)) return true
  return { _status: { equals: 'published' } }
}

export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin(req)

export const adminHiddenUnless = (allowed: BAEVRole[]) => ({ user }: { user?: unknown }) => {
  const role = user && typeof user === 'object' && 'role' in user ? String((user as { role?: unknown }).role) : ''
  return !allowed.includes(role as BAEVRole)
}
