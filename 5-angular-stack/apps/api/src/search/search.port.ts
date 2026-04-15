/**
 * Pluggable search — default implementation uses PostgreSQL FTS (see SearchService).
 * Swap for Algolia/Meilisearch by providing a class that implements SearchPort.
 */
export type SearchHit = {
  type: 'post' | 'product' | 'page';
  id: string;
  title: string;
  excerpt: string | null;
  path: string;
};

export interface SearchPort {
  search(query: string, limit?: number): Promise<SearchHit[]>;
}
