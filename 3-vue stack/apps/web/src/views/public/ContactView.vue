<script setup lang="ts">
import { ref } from "vue";
import { contactFormSchema } from "@platform/shared";
import { apiFetch } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";

useSeo({ title: "Contact", description: "Get in touch with our team." });

const form = ref({ name: "", email: "", subject: "", message: "", website: "" });
const done = ref(false);
const err = ref("");

async function submit() {
  err.value = "";
  const parsed = contactFormSchema.safeParse(form.value);
  if (!parsed.success) {
    err.value = "Please check the form fields.";
    return;
  }
  const res = await apiFetch("/forms/contact", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });
  if (!res.ok) {
    err.value = "Could not send. Try again.";
    return;
  }
  done.value = true;
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-16">
    <h1 class="text-3xl font-bold text-slate-900">Contact</h1>
    <p class="mt-2 text-slate-600">We respond within one business day.</p>
    <div v-if="done" class="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
      Thanks — your message was received.
    </div>
    <form v-else class="mt-8 space-y-4" @submit.prevent="submit">
      <input v-model="form.website" type="text" name="website" class="hidden" tabindex="-1" autocomplete="off" />
      <div>
        <label class="block text-sm font-medium text-slate-700" for="name">Name</label>
        <input id="name" v-model="form.name" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700" for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700" for="subject">Subject</label>
        <input id="subject" v-model="form.subject" required class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700" for="message">Message</label>
        <textarea id="message" v-model="form.message" required rows="5" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" class="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
        Send
      </button>
      <p v-if="err" class="text-sm text-red-600">{{ err }}</p>
    </form>
  </div>
</template>
