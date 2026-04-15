import { Resend } from 'resend'

export async function sendTransactionalEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  const config = useRuntimeConfig()
  if (!config.resendApiKey) {
    console.info('[email:dev]', opts.to, opts.subject)
    return { id: 'dev-mock' }
  }
  const resend = new Resend(config.resendApiKey)
  const from = config.emailFrom || 'onboarding@resend.dev'
  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
}
