import { chromium } from '@playwright/test'

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})

const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()

page.on('console', (message) => {
  if (message.type() === 'error') console.log('BROWSER ERROR:', message.text())
})

await page.goto('http://localhost:3001/admin/login', { waitUntil: 'networkidle', timeout: 30000 })
await page.locator('input[name="email"]').fill(process.env.QA_EMAIL)
await page.locator('input[name="password"]').fill(process.env.QA_PASSWORD)
await page.locator('button[type="submit"]').click()
await page.waitForURL('**/admin**', { timeout: 20000 })
await page.waitForTimeout(2500)

await page.screenshot({ path: '/tmp/baev-admin-dashboard.png', fullPage: true })

await page.goto('http://localhost:3001/admin/studio', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1000)
await page.screenshot({ path: '/tmp/baev-admin-studio.png', fullPage: true })
await page.keyboard.press('Meta+K')
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/baev-admin-command.png', fullPage: false })
await page.keyboard.press('Escape')

await page.goto('http://localhost:3001/admin/case-system', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1200)
await page.screenshot({ path: '/tmp/baev-admin-case-system.png', fullPage: true })

await page.goto('http://localhost:3001/admin/crm', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1200)
await page.screenshot({ path: '/tmp/baev-admin-crm.png', fullPage: true })

await page.goto('http://localhost:3001/admin/pipeline', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1200)
await page.screenshot({ path: '/tmp/baev-admin-pipeline.png', fullPage: true })

await page.goto('http://localhost:3001/admin/collections/projects', {
  waitUntil: 'networkidle',
  timeout: 30000,
})
const caseLink = page.getByRole('link', { name: /Авито Авто — Высшая передача/ }).first()
await caseLink.click()
await page.waitForTimeout(1800)
console.log('Project edit URL:', page.url())
await page.screenshot({ path: '/tmp/baev-admin-project-edit.png', fullPage: false })

await page.goto('http://localhost:3001/preview/avito-auto-2024', {
  waitUntil: 'networkidle',
  timeout: 30000,
})
await page.waitForTimeout(1800)
console.log('Preview URL:', page.url())
await page.screenshot({ path: '/tmp/baev-live-preview.png', fullPage: false })

const cloneResult = await page.evaluate(async () => {
  const response = await fetch('/api/baev/clone-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template: '_template-editorial', title: 'QA Template Clone' }),
  })
  const data = await response.json()
  if (response.ok && data.id) await fetch('/api/projects/' + data.id, { method: 'DELETE' })
  return { status: response.status, data }
})
console.log('Template clone:', cloneResult.status, cloneResult.data?.id ? 'ok' : cloneResult.data)

await browser.close()
