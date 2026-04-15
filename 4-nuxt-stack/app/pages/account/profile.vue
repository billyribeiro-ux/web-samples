<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { user, refresh } = useAuth()
const name = ref(user.value?.name ?? '')
const passCurrent = ref('')
const passNew = ref('')
const msg = ref('')

async function saveProfile() {
  await $fetch('/api/account/profile', { method: 'PATCH', body: { name: name.value } })
  await refresh()
  msg.value = 'Saved.'
}

async function savePassword() {
  await $fetch('/api/account/password', {
    method: 'POST',
    body: { currentPassword: passCurrent.value, newPassword: passNew.value },
  })
  msg.value = 'Password updated — sign in again.'
}

useSeo({ title: 'Profile' })
</script>

<template>
  <div class="max-w-xl mx-auto px-4 py-16 space-y-10">
    <div>
      <h1 class="text-2xl font-semibold text-white">Profile</h1>
      <form class="mt-4 space-y-3" @submit.prevent="saveProfile">
        <div>
          <label class="text-sm text-slate-400" for="name">Name</label>
          <input id="name" v-model="name" class="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
        </div>
        <button type="submit" class="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-sm font-medium">Save</button>
      </form>
    </div>
    <div>
      <h2 class="text-lg font-semibold text-white">Change password</h2>
      <form class="mt-4 space-y-3" @submit.prevent="savePassword">
        <input v-model="passCurrent" type="password" placeholder="Current" class="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
        <input v-model="passNew" type="password" placeholder="New" class="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
        <button type="submit" class="px-4 py-2 rounded-lg border border-slate-700 text-sm">Update password</button>
      </form>
    </div>
    <p v-if="msg" class="text-emerald-400 text-sm">{{ msg }}</p>
  </div>
</template>
