import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

export interface CartLine {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

const STORAGE_KEY = "apex_cart";

function normalizeLine(x: unknown): CartLine | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const productId = String(o.productId ?? "");
  const name = String(o.name ?? "Item");
  const priceCents = Number(o.priceCents);
  const quantity = Math.max(1, Number(o.quantity) || 1);
  if (!productId || !Number.isFinite(priceCents)) return null;
  return { productId, name, priceCents, quantity };
}

export const useCartStore = defineStore("cart", () => {
  const lines = ref<CartLine[]>([]);

  function hydrate() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const next = parsed.map(normalizeLine).filter((l): l is CartLine => l != null);
      lines.value = next;
    } catch {
      /* ignore corrupt storage */
    }
  }

  function persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines.value));
    } catch {
      /* quota */
    }
  }

  hydrate();
  watch(lines, persist, { deep: true });

  function add(item: Omit<CartLine, "quantity"> & { quantity?: number }) {
    const q = Math.max(1, item.quantity ?? 1);
    const pid = String(item.productId);
    const idx = lines.value.findIndex((l) => l.productId === pid);
    if (idx >= 0) {
      const copy = lines.value.slice();
      copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + q };
      lines.value = copy;
    } else {
      lines.value = [
        ...lines.value,
        {
          productId: pid,
          name: String(item.name ?? "Item"),
          priceCents: Number(item.priceCents),
          quantity: q,
        },
      ];
    }
  }

  function remove(productId: string) {
    const pid = String(productId);
    lines.value = lines.value.filter((l) => l.productId !== pid);
  }

  function clear() {
    lines.value = [];
  }

  function totalCents() {
    return lines.value.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
  }

  /** Total units (sum of line quantities) for badge / summaries */
  const totalQuantity = computed(() => lines.value.reduce((n, l) => n + l.quantity, 0));

  return { lines, add, remove, clear, totalCents, totalQuantity };
});
