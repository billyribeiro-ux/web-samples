import { Injectable, signal, computed } from '@angular/core';

export type CartLine = { productId: string; slug: string; name: string; unitCents: number; qty: number };

const KEY = 'platform_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly lines = signal<CartLine[]>(this.load());

  readonly items = computed(() => this.lines());
  readonly totalCents = computed(() =>
    this.lines().reduce((s, l) => s + l.unitCents * l.qty, 0),
  );
  readonly count = computed(() => this.lines().reduce((s, l) => s + l.qty, 0));

  private load(): CartLine[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(this.lines()));
  }

  add(line: Omit<CartLine, 'qty'> & { qty?: number }) {
    const cur = this.lines();
    const i = cur.findIndex((x) => x.productId === line.productId);
    const qty = line.qty ?? 1;
    if (i >= 0) {
      const next = [...cur];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      this.lines.set(next);
    } else {
      this.lines.set([...cur, { ...line, qty }]);
    }
    this.persist();
  }

  setQty(productId: string, qty: number) {
    if (qty <= 0) {
      this.lines.set(this.lines().filter((l) => l.productId !== productId));
    } else {
      this.lines.set(
        this.lines().map((l) => (l.productId === productId ? { ...l, qty } : l)),
      );
    }
    this.persist();
  }

  clear() {
    this.lines.set([]);
    this.persist();
  }
}
