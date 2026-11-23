import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ProjectStatus,
  ProjectPriority,
  AccountDto,
  DetailedOpportunityDto
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, FolderPlus, Calendar, Building, TrendingUp, AlertCircle } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [targetEndDate, setTargetEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().substring(0, 10);
  });
  const [accountId, setAccountId] = useState('');
  const [opportunityId, setOpportunityId] = useState('');

  // Dropdown data
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [opportunities, setOpportunities] = useState<DetailedOpportunityDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAssociations();
    }
  }, [isOpen]);

  async function loadAssociations() {
    try {
      const [accRes, oppRes] = await Promise.all([
        apiClient.getAccounts({ limit: 100 }),
        apiClient.getOpportunities({ limit: 100 })
      ]);
      setAccounts(accRes.items);
      setOpportunities(oppRes.items);
    } catch (err: any) {
      console.error('Failed to load CRM/Sales associations', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const project = await apiClient.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        targetEndDate: targetEndDate ? new Date(targetEndDate).toISOString() : undefined,
        accountId: accountId || undefined,
        opportunityId: opportunityId || undefined
      });

      setName('');
      setDescription('');
      onSuccess(project.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FolderPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create New Project</h3>
              <p className="text-xs text-slate-500">Plan and initialize a team delivery workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Website Redesign & Migration"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Start and Target End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={targetEndDate}
                  onChange={(e) => setTargetEndDate(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* CRM Account & Sales Opportunity Association */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link Client Account (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">No Account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link Sales Deal (Optional)
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <select
                  value={opportunityId}
                  onChange={(e) => setOpportunityId(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">No Deal</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Scope & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project deliverables, requirements, and milestones..."
              rows={3}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
