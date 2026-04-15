import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, newsletterFormSchema, type ContactFormInput, type NewsletterFormInput } from '@acme/shared';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';
import { track } from '@/lib/analytics.js';

export function ContactPage() {
  const contact = useForm<ContactFormInput>({ resolver: zodResolver(contactFormSchema) });
  const newsletter = useForm<NewsletterFormInput>({ resolver: zodResolver(newsletterFormSchema) });

  return (
    <>
      <Helmet>
        <title>Contact — Acme Platform</title>
        <meta name="description" content="Reach our team for sales, support, or partnerships." />
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="mt-2 max-w-2xl text-slate-600">We respond within one business day.</p>

        <form
          className="mt-8 max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={contact.handleSubmit(async (values) => {
            await apiFetch('/api/forms/contact', { method: 'POST', body: JSON.stringify(values) });
            track('form_submit', { form: 'contact' });
            contact.reset();
            alert('Thanks — your message was sent.');
          })}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <input id="name" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...contact.register('name')} />
            {contact.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{contact.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...contact.register('email')} />
            {contact.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{contact.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="subject">
              Subject
            </label>
            <input id="subject" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...contact.register('subject')} />
            {contact.formState.errors.subject && (
              <p className="mt-1 text-sm text-red-600">{contact.formState.errors.subject.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="message">
              Message
            </label>
            <textarea id="message" rows={5} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...contact.register('message')} />
            {contact.formState.errors.message && (
              <p className="mt-1 text-sm text-red-600">{contact.formState.errors.message.message}</p>
            )}
          </div>
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Send message
          </button>
        </form>

        <section className="mt-12 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Newsletter</h2>
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row"
            onSubmit={newsletter.handleSubmit(async (values) => {
              await apiFetch('/api/forms/newsletter', { method: 'POST', body: JSON.stringify(values) });
              track('form_submit', { form: 'newsletter' });
              newsletter.reset();
              alert('You are on the list.');
            })}
          >
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2"
              {...newsletter.register('email')}
            />
            <button type="submit" className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white">
              Subscribe
            </button>
          </form>
          {newsletter.formState.errors.email && (
            <p className="mt-2 text-sm text-red-600">{newsletter.formState.errors.email.message}</p>
          )}
        </section>
      </Container>
    </>
  );
}
