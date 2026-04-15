'use client';

import { useState } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name')),
      email: String(fd.get('email')),
      message: String(fd.get('message')),
      _hp: String(fd.get('_hp') ?? ''),
    };
    const res = await fetch('/api/forms/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setStatus('error');
      setMessage('Could not send — try again later.');
      return;
    }
    setStatus('ok');
    setMessage('Thanks — we will get back to you.');
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {message && (
        <p className="text-sm" role="status">
          {message}
        </p>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-300">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
