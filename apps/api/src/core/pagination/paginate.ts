import type { PaginationQuery, PaginatedResult } from '@ai-business-manager/shared';
import { calculatePaginationMeta } from '@ai-business-manager/shared';

/**
 * Reusable in-memory search, filter, sort, and pagination processor.
 */
export function paginateCollection<T>(
  items: T[],
  query: PaginationQuery,
  searchFields: (keyof T)[] = [],
  filterPredicate?: (item: T) => boolean
): PaginatedResult<T> {
  let filtered = [...items];

  // 1. Custom Filter Predicate
  if (filterPredicate) {
    filtered = filtered.filter(filterPredicate);
  }

  // 2. Case-Insensitive Multi-Field Search
  if (query.search && query.search.trim().length > 0) {
    const term = query.search.trim().toLowerCase();
    filtered = filtered.filter((item) =>
      searchFields.some((field) => {
        const val = item[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      })
    );
  }

  // 3. Sorting
  if (query.sortBy) {
    const sortBy = query.sortBy as keyof T;
    const isAsc = query.sortOrder === 'asc';

    filtered.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return isAsc ? 1 : -1;
      if (valB === null || valB === undefined) return isAsc ? -1 : 1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
  }

  // 4. Pagination
  const totalItems = filtered.length;
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const offset = (page - 1) * limit;

  const paginatedItems = filtered.slice(offset, offset + limit);
  const pagination = calculatePaginationMeta(totalItems, page, limit);

  return {
    items: paginatedItems,
    pagination
  };
}
