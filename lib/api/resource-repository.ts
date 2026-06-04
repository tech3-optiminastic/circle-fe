import { http } from '@/lib/http/client';

/**
 * Generic Repository over a single API resource (Repository pattern, parity with
 * the backend). Domain code depends on these typed instances, never on raw HTTP.
 */
export class ResourceRepository<T> {
  constructor(private readonly slug: string) {}

  list(): Promise<T[]> {
    return http.get<T[]>(`/${this.slug}`);
  }

  get(id: string): Promise<T> {
    return http.get<T>(`/${this.slug}/${id}`);
  }

  create(body: T): Promise<T> {
    return http.post<T>(`/${this.slug}`, body);
  }

  update(id: string, body: T): Promise<T> {
    return http.put<T>(`/${this.slug}/${id}`, body);
  }

  patch(id: string, changes: Partial<T>): Promise<T> {
    return http.patch<T>(`/${this.slug}/${id}`, changes);
  }

  remove(id: string): Promise<void> {
    return http.delete(`/${this.slug}/${id}`);
  }
}
