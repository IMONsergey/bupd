import type { ServerProps } from 'payload'
import React from 'react'

const links = [
  { href: '/admin', label: 'Обзор', mark: '01', roles: ['admin', 'editor', 'sales'] },
  { href: '/admin/new-case', label: 'Новый кейс', mark: '+', roles: ['admin', 'editor'] },
  { href: '/admin/studio', label: 'Case Studio', mark: '→', roles: ['admin', 'editor'] },
  { href: '/admin/case-system', label: 'Case system', mark: '22', roles: ['admin', 'editor'] },
  { href: '/admin/collections/projects', label: 'Кейсы', mark: '↗', roles: ['admin', 'editor'] },
  { href: '/admin/crm', label: 'CRM home', mark: '02', roles: ['admin', 'sales'] },
  { href: '/admin/pipeline', label: 'Pipeline', mark: '→', roles: ['admin', 'sales'] },
  { href: '/admin/collections/activities', label: 'Задачи', mark: '✓', roles: ['admin', 'sales'] },
  { href: '/admin/help', label: 'Как работать', mark: '?', roles: ['admin', 'editor', 'sales'] },
]

export default function NavShortcuts({ user }: ServerProps) {
  const role = user && 'role' in user ? String(user.role) : ''
  const visible = links.filter((link) => link.roles.includes(role))

  return (
    <div className="baev-nav-shortcuts">
      <span className="baev-nav-shortcuts__label">BAEV OS</span>
      {visible.map((link) => (
        <a href={link.href} key={link.href}>
          <span>{link.label}</span>
          <b>{link.mark}</b>
        </a>
      ))}
    </div>
  )
}
