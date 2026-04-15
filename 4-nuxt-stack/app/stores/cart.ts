import { defineStore } from 'pinia'

export type CartLine = { productId: string; quantity: number; title: string; unitCents: number; slug: string }

export const useCartStore = defineStore('cart', {
  state: () => ({
    lines: [] as CartLine[],
  }),
  getters: {
    totalCents(state): number {
      return state.lines.reduce((s, l) => s + l.unitCents * l.quantity, 0)
    },
    count(state): number {
      return state.lines.reduce((s, l) => s + l.quantity, 0)
    },
  },
  actions: {
    add(line: CartLine) {
      const existing = this.lines.find((l) => l.productId === line.productId)
      if (existing) existing.quantity += line.quantity
      else this.lines.push({ ...line })
    },
    remove(productId: string) {
      this.lines = this.lines.filter((l) => l.productId !== productId)
    },
    clear() {
      this.lines = []
    },
  },
})
