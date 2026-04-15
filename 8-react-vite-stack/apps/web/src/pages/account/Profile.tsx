import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/hooks/useApi.js';

const schema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
});

type Form = z.infer<typeof schema>;

export function ProfilePage() {
  const api = useApi();
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <>
      <Helmet>
        <title>Profile — Acme</title>
      </Helmet>
      <h1 className="text-2xl font-semibold">Profile</h1>
      <form
        className="mt-6 max-w-md space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await api('/api/me/profile', { method: 'PATCH', body: JSON.stringify(values) });
          alert('Saved');
        })}
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">First name</label>
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...form.register('firstName')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Last name</label>
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...form.register('lastName')} />
        </div>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Save
        </button>
      </form>
    </>
  );
}
