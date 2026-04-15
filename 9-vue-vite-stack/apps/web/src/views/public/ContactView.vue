<script setup lang="ts">
import { ref } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { contactFormSchema } from "shared";
import { api } from "@/lib/api";
import { useSeo } from "@/composables/useSeo";
import { useAnalytics } from "@/composables/useAnalytics";

useSeo({ title: "Contact", description: "Get in touch.", canonicalPath: "/contact" });

const schema = toTypedSchema(contactFormSchema);
const done = ref(false);
const serverError = ref<string | null>(null);
const { track } = useAnalytics();

async function onSubmit(values: Record<string, unknown>) {
  serverError.value = null;
  try {
    await api("/api/v1/forms/contact", { method: "POST", json: values });
    done.value = true;
    track("form_submit", { form: "contact" });
  } catch (e) {
    serverError.value = e instanceof Error ? e.message : "Failed";
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-14">
    <h1 class="text-3xl font-semibold text-white">Contact</h1>
    <p v-if="done" class="mt-6 text-emerald-400">Thanks — we received your message.</p>
    <Form v-else :validation-schema="schema" class="mt-8 space-y-4" @submit="onSubmit">
      <div>
        <label class="block text-sm text-slate-300" for="name">Name</label>
        <Field
          id="name"
          name="name"
          class="mt-1 w-full rounded-md border border-white/10 bg-brand-900 px-3 py-2 text-white"
        />
        <ErrorMessage name="name" class="text-sm text-red-400" />
      </div>
      <div>
        <label class="block text-sm text-slate-300" for="email">Email</label>
        <Field
          id="email"
          name="email"
          type="email"
          class="mt-1 w-full rounded-md border border-white/10 bg-brand-900 px-3 py-2 text-white"
        />
        <ErrorMessage name="email" class="text-sm text-red-400" />
      </div>
      <div class="hidden">
        <Field name="website" />
      </div>
      <div>
        <label class="block text-sm text-slate-300" for="message">Message</label>
        <Field
          id="message"
          name="message"
          as="textarea"
          rows="5"
          class="mt-1 w-full rounded-md border border-white/10 bg-brand-900 px-3 py-2 text-white"
        />
        <ErrorMessage name="message" class="text-sm text-red-400" />
      </div>
      <p v-if="serverError" class="text-sm text-red-400">{{ serverError }}</p>
      <button
        type="submit"
        class="rounded-md bg-accent-500 px-5 py-2 text-sm font-semibold text-brand-950 hover:bg-accent-400"
      >
        Send
      </button>
    </Form>
  </div>
</template>
