import React from 'react'
import {comparison} from '@/lib/environment'

import { requireStudioUser } from '@/studio/lib/auth'
import StudioShell from '@/studio/ui/StudioShell'
import '@/studio/ui/studio.css'
import '@/studio/ui/workspace.css'

export const metadata = {
  title: 'BAEV Studio',
  description: 'Content and CRM workspace for BAEV',
}

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireStudioUser()

  return (
    <html lang="ru">
      <body>
        {comparison&&<div className="studio-comparison-note">Новая версия · отдельные данные <a href="/">Открыть сайт ↗</a></div>}
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
