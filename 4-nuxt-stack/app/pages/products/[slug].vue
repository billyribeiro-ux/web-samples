<script setup lang="ts">
const route = useRoute()
const cart = useCartStore()
const { data } = await useFetch(() => `/api/products/${route.params.slug}`)

watchEffect(() => {
  const p = data.value?.product
  if (!p) return
  useSeo({ title: p.name, description: p.description.slice(0, 160) })
})

const added = ref(false)

function addToCart() {
  const p = data.value?.product
  if (!p) return
  cart.add({
    productId: p.id,
    quantity: 1,
    title: p.name,
    unitCents: p.priceCents,
    slug: p.slug,
  })
  added.value = true
}
</script>

<template>
  <div v-if="data?.product" class="max-w-3xl mx-auto px-4 py-16">
    <h1 class="text-3xl font-semibold text-white">{{ data.product.name }}</h1>
    <p class="mt-6 text-slate-300 leading-relaxed">{{ data.product.description }}</p>
    <p class="mt-8 text-2xl font-semibold text-emerald-400">
      ${{ (data.product.priceCents / 100).toFixed(2) }}
    </p>
    <div class="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        class="px-6 py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
        @click="addToCart"
      >
        Add to cart
      </button>
      <NuxtLink v-if="added" to="/cart" class="text-sm text-emerald-400 hover:underline"> View cart → </NuxtLink>
    </div>
    <p v-if="added" class="mt-3 text-sm text-slate-400" role="status">Added to cart. Continue shopping or check out.</p>
  </div>
</template>
