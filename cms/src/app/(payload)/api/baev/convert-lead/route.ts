import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin', 'sales'].includes(role)) return Response.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const id = body.id
  if (!id) return Response.json({ error: 'lead_id_required' }, { status: 400 })

  const lead = await payload.findByID({ collection: 'leads', id: id as string | number, depth: 1, overrideAccess: true }).catch(() => null) as any
  if (!lead) return Response.json({ error: 'lead_not_found' }, { status: 404 })

  const existingDeal = await payload.find({
    collection: 'deals',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    where: { lead: { equals: lead.id } },
  })
  if (existingDeal.docs[0]) return Response.json({ ok: true, dealId: existingDeal.docs[0].id, reused: true })

  let companyId = typeof lead.company === 'object' && lead.company ? lead.company.id : lead.company
  if (!companyId && lead.companyName) {
    const existingCompany = await payload.find({
      collection: 'companies',
      limit: 1,
      depth: 0,
      overrideAccess: true,
      where: { name: { equals: lead.companyName } },
    })
    if (existingCompany.docs[0]) companyId = existingCompany.docs[0].id
    else {
      const company = await payload.create({
        collection: 'companies',
        overrideAccess: true,
        data: { name: lead.companyName, owner: lead.owner || undefined },
      })
      companyId = company.id
    }
  }

  if (!companyId) {
    const company = await payload.create({
      collection: 'companies',
      overrideAccess: true,
      data: { name: lead.name || 'Новая компания', owner: lead.owner || undefined },
    })
    companyId = company.id
  }

  const deal = await payload.create({
    collection: 'deals',
    overrideAccess: true,
    data: {
      title: [lead.companyName || lead.name, lead.service ? String(lead.service) : 'Новый проект'].filter(Boolean).join(' / '),
      company: companyId,
      lead: lead.id,
      stage: lead.status === 'proposal' ? 'proposal' : 'discovery',
      value: lead.budget || undefined,
      currency: 'RUB',
      owner: lead.owner || undefined,
      nextActionAt: lead.nextActionAt || undefined,
      notes: lead.message || lead.notes || undefined,
    },
  })

  await payload.update({
    collection: 'leads',
    id: lead.id,
    overrideAccess: true,
    data: { company: companyId, status: lead.status === 'new' ? 'qualified' : lead.status },
  })

  await payload.create({
    collection: 'activities',
    overrideAccess: true,
    data: {
      type: 'task',
      title: 'Следующий шаг по сделке: ' + deal.title,
      deal: deal.id,
      lead: lead.id,
      company: companyId,
      owner: lead.owner || undefined,
      dueAt: lead.nextActionAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  })

  return Response.json({ ok: true, dealId: deal.id, companyId }, { status: 201 })
}
