/** API path prefix (no trailing slash) */
export const API_PREFIX = 'api/v1';

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  TRIALING = 'TRIALING',
}

export const RoleSlugs = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  MEMBER: 'member',
  CUSTOMER: 'customer',
} as const;

/** Unified search result (API + future Algolia/Meilisearch adapters). */
export interface SearchHit {
  type: 'post' | 'product' | 'page';
  id: string;
  title: string;
  excerpt: string | null;
  path: string;
}

/** Contract for pluggable search backends (PostgreSQL FTS today, Meilisearch tomorrow). */
export interface SearchPort {
  search(query: string, limit?: number): Promise<SearchHit[]>;
}
