import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MilestoneStatus } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, Milestone, Calendar, AlertCircle } from 'lucide-react';

interface CreateMilestoneModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMilestoneModal({
  isOpen,
  projectId,
  onClose,
  onSuccess
}: CreateMilestoneModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Milestone title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.createMilestone(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
        status: 'pending'
      });

      setTitle('');
      setDescription('');
      setTargetDate('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Milestone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Milestone</h3>
              <p className="text-xs text-slate-500">Set key project deliverables & delivery dates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Milestone Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Beta MVP Release"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What must be achieved to complete this milestone?"
              rows={3}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
