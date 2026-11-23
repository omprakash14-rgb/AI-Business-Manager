import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FinancialCategoryDto,
  FinancialCategoryType,
  CreateFinancialCategoryInput
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { Plus, Tag, Trash2, Edit2, AlertCircle, Check, X } from 'lucide-react';

export function CategoriesView() {
  const [categories, setCategories] = useState<FinancialCategoryDto[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<FinancialCategoryType>('expense');
  const [color, setColor] = useState('#6366f1');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getFinancialCategories(filterType || undefined);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.createFinancialCategory({
        name: name.trim(),
        type,
        color,
        description: description.trim() || undefined
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, catName: string) {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await apiClient.deleteFinancialCategory(id);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Cannot delete category');
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="income">Income Categories</option>
            <option value="expense">Expense Categories</option>
          </select>
          <span className="text-xs text-slate-400">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          New Category
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            No categories found. Create a category to start organizing transactions.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
                  <Badge
                    variant={cat.type === 'income' ? 'success' : 'secondary'}
                    className="text-[10px] capitalize font-medium py-0"
                  >
                    {cat.type}
                  </Badge>
                </div>
                {cat.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2">{cat.description}</p>
                )}
                {cat.isDefault && (
                  <span className="inline-block text-[10px] font-semibold text-slate-400">
                    System Default
                  </span>
                )}
              </div>

              {!cat.isDefault && (
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  title="Delete category"
                  className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
                New Financial Category
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Infrastructure"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FinancialCategoryType)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Badge Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-8 w-12 rounded border border-slate-200 p-0.5 cursor-pointer"
                    />
                    <span className="font-mono text-slate-600">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Purpose of this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
