import { Search, X, ArrowUpDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filterValue?: string;
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  sortOrder?: 'asc' | 'desc';
  onToggleSortOrder?: () => void;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = 'Search records...',
  filterValue,
  filterOptions,
  onFilterChange,
  sortOrder,
  onToggleSortOrder
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
      {/* Search Input with Clear Button */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        {search.length > 0 && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Options & Sort Toggle */}
      <div className="flex items-center gap-2">
        {filterOptions && onFilterChange && (
          <select
            value={filterValue || ''}
            onChange={(e) => onFilterChange(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {onToggleSortOrder && (
          <button
            onClick={onToggleSortOrder}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title={`Sort order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <span className="capitalize">{sortOrder || 'desc'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
