<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

const schema = toTypedSchema(
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    message: z.string().min(10),
    website: z.string().optional(),
  }),
)

const { handleSubmit, defineField, errors } = useForm({ validationSchema: schema })
const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [message, messageAttrs] = defineField('message')
const [website, websiteAttrs] = defineField('website')

const sent = ref(false)
const onSubmit = handleSubmit(async (values) => {
  await $fetch('/api/forms/contact', {
    method: 'POST',
    body: values,
  })
  sent.value = true
})

useSeo({ title: 'Contact', description: 'Talk to our team about your platform needs.' })
</script>

<template>
  <div class="max-w-xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">Contact</h1>
    <form class="mt-8 space-y-4" novalidate @submit="onSubmit">
      <input v-bind="websiteAttrs" v-model="website" type="text" class="hidden" tabindex="-1" autocomplete="off" />
      <div>
        <label for="name" class="block text-sm text-slate-400">Name</label>
        <input
          id="name"
          v-model="name"
          v-bind="nameAttrs"
          type="text"
          class="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
        />
        <p v-if="errors.name" class="text-red-400 text-sm mt-1">{{ errors.name }}</p>
      </div>
      <div>
        <label for="email" class="block text-sm text-slate-400">Email</label>
        <input
          id="email"
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          class="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
        />
        <p v-if="errors.email" class="text-red-400 text-sm mt-1">{{ errors.email }}</p>
      </div>
      <div>
        <label for="message" class="block text-sm text-slate-400">Message</label>
        <textarea
          id="message"
          v-model="message"
          v-bind="messageAttrs"
          rows="5"
          class="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
        />
        <p v-if="errors.message" class="text-red-400 text-sm mt-1">{{ errors.message }}</p>
      </div>
      <button type="submit" class="w-full py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold">
        Send
      </button>
      <p v-if="sent" class="text-emerald-400 text-sm" role="status">Message sent. We will reply shortly.</p>
    </form>
  </div>
</template>
