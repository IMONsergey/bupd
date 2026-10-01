import React from 'react'

import { requireStudioUser } from '@/studio/lib/auth'
import StudioShell from '@/studio/ui/StudioShell'
import '@/studio/ui/studio.css'

export const metadata = {
  title: 'BAEV Studio',
  description: 'Content and CRM workspace for BAEV',
}

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireStudioUser()

  return (
    <html lang="ru">
      <body>
        <StudioShell user={{
          id: user.id,
          email: 'email' in user ? String(user.email || '') : '',
          name: 'name' in user ? String(user.name || '') : '',
          role: 'role' in user ? String(user.role || '') : '',
        }}>
          {children}
        </StudioShell>
      </body>
    </html>
  )
}
