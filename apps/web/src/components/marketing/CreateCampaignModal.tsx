import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CampaignType,
  MarketingChannel,
  CampaignStatus,
  CAMPAIGN_TYPE_LABELS,
  MARKETING_CHANNEL_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CampaignDto
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, Megaphone, Calendar, DollarSign, Tag, AlertCircle, FileText } from 'lucide-react';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (campaign: CampaignDto) => void;
}

export function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess
}: CreateCampaignModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CampaignType>('inbound');
  const [channel, setChannel] = useState<MarketingChannel>('website');
  const [status, setStatus] = useState<CampaignStatus>('planned');
  const [objective, setObjective] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().substring(0, 10);
  });
  const [budget, setBudget] = useState('5000.00');
  const [actualCost, setActualCost] = useState('0.00');
  const [currency, setCurrency] = useState('USD');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Campaign name is required.');
      return;
    }

    if (budget && isNaN(Number(budget))) {
      setError('Budget must be a valid number.');
      return;
    }

    if (actualCost && isNaN(Number(actualCost))) {
      setError('Actual cost must be a valid number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const campaign = await apiClient.createCampaign({
        name: name.trim(),
        type,
        channel,
        status,
        objective: objective.trim() || undefined,
        description: description.trim() || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        budget: Number(budget || 0).toFixed(2),
        actualCost: Number(actualCost || 0).toFixed(2),
        currency,
        utmSource: utmSource.trim() || undefined,
        utmMedium: utmMedium.trim() || undefined,
        notes: notes.trim() || undefined
      });

      // Reset
      setName('');
      setObjective('');
      setDescription('');
      setBudget('5000.00');
      setActualCost('0.00');
      setUtmSource('');
      setUtmMedium('');
      setNotes('');

      onSuccess(campaign);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Marketing Campaign</h3>
              <p className="text-xs text-slate-500">Plan campaign channel, budget allocation, and lead attribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q2 SaaS Growth Webinar & Inbound Lead Gen"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CampaignStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {Object.entries(CAMPAIGN_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Channel & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Marketing Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as MarketingChannel)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {Object.entries(MARKETING_CHANNEL_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Campaign Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CampaignType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {Object.entries(CAMPAIGN_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Objective */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Campaign Objective / Key Goal</label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Generate 50 qualified leads and $100k pipeline value"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Budget, Actual Cost, Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                Allocated Budget
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="5000.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                Initial Spent / Cost
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tracking / UTM Tags */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <Tag className="h-3.5 w-3.5 text-blue-600" />
              <span>Traceable Attribution Tags (UTM)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Trace lead origin without speculative multi-touch attribution or external ad cookies.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] text-slate-600">UTM Source</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="e.g. linkedin, google, newsletter"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600">UTM Medium</label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="e.g. cpc, sponsored, email_blast"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Campaign Strategy & Details</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Strategic execution notes, target demographics, offer terms..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
