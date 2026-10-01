(() => {
  const CMS = ['localhost', '127.0.0.1'].includes(location.hostname) ? 'http://localhost:3001' : 'https://baev-cms.vercel.app'
  const form = document.querySelector('form.framer-hqhav0')
  if (!form || form.dataset.baevCrmBound === 'true') return
  form.dataset.baevCrmBound = 'true'

  const submit = form.querySelector('button[type="submit"]')
  const text = submit?.querySelector('p')
  const initialLabel = text?.textContent || 'Отправить запрос'
  let busy = false

  const setState = (label, disabled) => {
    if (text) text.textContent = label
    if (submit) {
      submit.disabled = disabled
      submit.style.opacity = disabled ? '.62' : '1'
      submit.style.cursor = disabled ? 'wait' : ''
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
    if (busy) return

    const data = new FormData(form)
    const params = new URLSearchParams(location.search)
    const name = String(data.get('Name') || '').trim()
    const email = String(data.get('Email') || '').trim()
    const message = String(data.get('MessageEmail') || '').trim()
    const website = String(data.get('website') || '').trim()

    if (!name || !email || !message) {
      setState('Заполните поля', false)
      window.setTimeout(() => setState(initialLabel, false), 1800)
      return
    }

    busy = true
    setState('Отправляем…', true)

    try {
      const response = await fetch(CMS + '/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
          source: 'site',
          service: 'other',
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          utm_content: params.get('utm_content'),
        }),
      })

      if (!response.ok) throw new Error('submit_failed')
      form.reset()
      setState('Запрос отправлен ✓', true)
      window.setTimeout(() => {
        busy = false
        setState(initialLabel, false)
      }, 4000)
    } catch (error) {
      console.error('[BAEV CRM] form submit failed', error)
      busy = false
      setState('Ошибка. Попробуйте ещё раз', false)
      window.setTimeout(() => setState(initialLabel, false), 2600)
    }
  }, true)
})()
