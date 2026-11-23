import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@ai-business-manager/shared';

interface PaginationBarProps {
  pagination: PaginationMeta;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
}

export function PaginationBar({ pagination, onPageChange, onLimitChange }: PaginationBarProps) {
  const { page, limit, totalItems, totalPages, hasNextPage, hasPrevPage } = pagination;

  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-slate-500 border-t border-slate-100">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-slate-800">{startItem}</strong> to{' '}
          <strong className="text-slate-800">{endItem}</strong> of{' '}
          <strong className="text-slate-800">{totalItems}</strong> entries
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-slate-400">Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-400 mr-1">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
