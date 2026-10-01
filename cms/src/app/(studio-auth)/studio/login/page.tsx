import { redirect } from 'next/navigation'
import React from 'react'

import { getStudioSession } from '@/studio/lib/auth'
import StudioLogin from '@/studio/ui/StudioLogin'

export default async function StudioLoginPage() {
  const { user } = await getStudioSession()
  if (user) redirect('/studio')
  return <StudioLogin />
}
