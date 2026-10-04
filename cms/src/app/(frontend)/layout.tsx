import React from 'react'
import './styles.css'

export const metadata = {
  description: 'BAEV — брендинг, презентации и визуальные коммуникации.',
  title: 'BAEV — проекты',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
