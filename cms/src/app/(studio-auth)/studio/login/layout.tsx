import React from 'react'
import '@/studio/ui/studio.css'

export const metadata = {
  title: 'Вход — BAEV Studio',
}

export default function StudioLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
