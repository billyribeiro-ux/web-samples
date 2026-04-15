import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadFormSchema, type LeadFormInput } from '@acme/shared';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';
import { track } from '@/lib/analytics.js';

export function ServicesPage() {
  const form = useForm<LeadFormInput>({ resolver: zodResolver(leadFormSchema) });

  return (
    <>
      <Helmet>
        <title>Services — Acme Platform</title>
        <meta name="description" content="Implementation, migration, and managed operations for modern teams." />
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Services</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          We partner on platform engineering, content systems, commerce architecture, and reliability programs—
          delivered with the same rigor as this reference implementation.
        </p>
        <ul className="mt-8 list-disc space-y-2 pl-5 text-slate-700">
          <li>Discovery workshops and technical roadmaps</li>
          <li>Headless CMS and membership launches</li>
          <li>Stripe billing hardening and webhook reliability</li>
          <li>Performance, accessibility, and SEO reviews</li>
        </ul>

        <section className="mt-12 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Request a consult</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              await apiFetch('/api/forms/lead', { method: 'POST', body: JSON.stringify(values) });
              track('form_submit', { form: 'lead' });
              form.reset();
              alert('Thanks — we will follow up shortly.');
            })}
          >
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Name" {...form.register('name')} />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Email" type="email" {...form.register('email')} />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Company" {...form.register('company')} />
            <textarea className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="How can we help?" rows={4} {...form.register('message')} />
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Submit
            </button>
          </form>
        </section>
      </Container>
    </>
  );
}
