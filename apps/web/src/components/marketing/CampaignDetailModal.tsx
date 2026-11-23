import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CampaignDto,
  AttributedLeadDto,
  CampaignStatus,
  LeadDto,
  CAMPAIGN_STATUS_LABELS,
  MARKETING_CHANNEL_LABELS,
  CAMPAIGN_TYPE_LABELS
} from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import {
  X,
  Megaphone,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Tag,
  AlertCircle,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CampaignDetailModalProps {
  campaignId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCampaignUpdated: () => void;
  onCampaignDeleted: () => void;
}

export function CampaignDetailModal({
  campaignId,
  isOpen,
  onClose,
  onCampaignUpdated,
  onCampaignDeleted
}: CampaignDetailModalProps) {
  const [campaign, setCampaign] = useState<CampaignDto | null>(null);
  const [attributedLeads, setAttributedLeads] = useState<AttributedLeadDto[]>([]);
  const [availableLeads, setAvailableLeads] = useState<LeadDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Association form state
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [attributionNotes, setAttributionNotes] = useState('');
  const [isAssociating, setIsAssociating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!campaignId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [camp, leads, allLeadsRes] = await Promise.all([
        apiClient.getCampaign(campaignId),
        apiClient.getCampaignLeads(campaignId),
        apiClient.getLeads({ limit: 100 })
      ]);
      setCampaign(camp);
      setAttributedLeads(leads);
      setAvailableLeads(allLeadsRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load campaign details');
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (isOpen && campaignId) {
      loadData();
    }
  }, [isOpen, campaignId, loadData]);

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!campaignId || !campaign) return;
    try {
      const updated = await apiClient.updateCampaign(campaignId, { status: newStatus });
      setCampaign(updated);
      onCampaignUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update campaign status');
    }
  };

  const handleAssociateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId || !selectedLeadId) return;

    setIsAssociating(true);
    setError(null);
    try {
      await apiClient.associateLeadToCampaign(campaignId, {
        leadId: selectedLeadId,
        notes: attributionNotes.trim() || undefined
      });
      setSelectedLeadId('');
      setAttributionNotes('');
      // Reload campaign and leads
      await loadData();
      onCampaignUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to attribute lead to campaign');
    } finally {
      setIsAssociating(false);
    }
  };

  const handleRemoveLead = async (leadId: string) => {
    if (!campaignId) return;
    if (!window.confirm('Remove this lead attribution from the campaign?')) return;

    try {
      await apiClient.removeLeadFromCampaign(campaignId, leadId);
      await loadData();
      onCampaignUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to remove lead attribution');
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignId) return;
    if (!window.confirm('Are you sure you want to delete this campaign? This action soft-deletes the campaign record.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.deleteCampaign(campaignId);
      onCampaignDeleted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete campaign');
      setIsDeleting(false);
    }
  };

  if (!isOpen || !campaignId) return null;

  const budgetNum = Number(campaign?.budget || 0);
  const actualCostNum = Number(campaign?.actualCost || 0);
  const remainingNum = Number(campaign?.remainingBudget || 0);
  const utilization = campaign?.utilizationPercent || 0;

  // Filter out leads that are already attributed
  const unattributedLeads = availableLeads.filter(
    (lead) => !attributedLeads.some((att) => att.leadId === lead.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{campaign?.name || 'Campaign Details'}</h3>
                {campaign && (
                  <Badge
                    variant={
                      campaign.status === 'active'
                        ? 'success'
                        : campaign.status === 'completed'
                        ? 'default'
                        : campaign.status === 'cancelled'
                        ? 'destructive'
                        : 'outline'
                    }
                    className="text-[10px]"
                  >
                    {CAMPAIGN_STATUS_LABELS[campaign.status]}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{campaign ? MARKETING_CHANNEL_LABELS[campaign.channel] : ''}</span>
                <span>•</span>
                <span>{campaign ? CAMPAIGN_TYPE_LABELS[campaign.type] : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-slate-500">
              <Clock className="h-5 w-5 animate-spin mr-2" />
              <span>Loading campaign performance records...</span>
            </div>
          ) : campaign ? (
            <>
              {/* Financial & Budget KPI Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-medium">Allocated Budget</span>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    ${budgetNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-500">Currency: {campaign.currency}</div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-medium">Actual Cost / Spent</span>
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    ${actualCostNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {utilization}% budget utilized
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-medium">Remaining Budget</span>
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className={`text-lg font-bold ${remainingNum < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    ${remainingNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {remainingNum < 0 ? 'Budget overrun' : 'Available headroom'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-medium">Leads Attributed</span>
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {campaign.totalLeads}
                  </div>
                  <div className="text-[11px] text-purple-700 font-medium">
                    {campaign.convertedLeads} converted ({campaign.conversionRatePercent}%)
                  </div>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="space-y-1.5 p-3.5 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between font-medium text-slate-700">
                  <span>Budget Utilization Bar</span>
                  <span>{utilization}% of ${budgetNum.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      utilization > 100
                        ? 'bg-red-500'
                        : utilization > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>

              {/* Status Switcher & Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="font-semibold text-slate-900">Campaign Timeline & Objectives</div>
                  {campaign.objective && (
                    <div className="text-slate-700">
                      <span className="font-medium text-slate-900">Objective:</span> {campaign.objective}
                    </div>
                  )}
                  {campaign.description && (
                    <div className="text-slate-600 text-[11px] leading-relaxed">
                      {campaign.description}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Start Date:
                      </span>
                      <span className="font-medium text-slate-800">
                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Immediate'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> End Date:
                      </span>
                      <span className="font-medium text-slate-800">
                        {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Campaign Status Controls</span>
                    <span className="text-[11px] text-slate-500">Quick Switch</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(['draft', 'planned', 'active', 'completed', 'cancelled'] as CampaignStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                          campaign.status === st
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {CAMPAIGN_STATUS_LABELS[st]}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Tag className="h-3 w-3 text-blue-600" />
                      <span>Tracking & Attribution Tags</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                      <span>UTM Source: <strong className="text-slate-900">{campaign.utmSource || '—'}</strong></span>
                      <span>UTM Medium: <strong className="text-slate-900">{campaign.utmMedium || '—'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attributed Leads Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Attributed CRM Leads ({attributedLeads.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Leads originating from or connected to this campaign for traceable ROI
                    </p>
                  </div>
                </div>

                {/* Form to associate an existing lead */}
                <form
                  onSubmit={handleAssociateLead}
                  className="p-3 bg-blue-50/50 border-b border-slate-200 flex flex-col md:flex-row items-center gap-2"
                >
                  <div className="flex-1 w-full">
                    <select
                      value={selectedLeadId}
                      onChange={(e) => setSelectedLeadId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Select a CRM Lead to attribute --</option>
                      {unattributedLeads.map((ld) => (
                        <option key={ld.id} value={ld.id}>
                          {ld.firstName} {ld.lastName} ({ld.title}) {ld.companyName ? `— ${ld.companyName}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Attribution note (optional, e.g. Form fill on webinar page)"
                      value={attributionNotes}
                      onChange={(e) => setAttributionNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!selectedLeadId || isAssociating}
                    className="w-full md:w-auto bg-blue-600 text-white shrink-0 gap-1.5 text-xs py-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{isAssociating ? 'Linking...' : 'Attribute Lead'}</span>
                  </Button>
                </form>

                {/* Attributed Leads Table */}
                {attributedLeads.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 bg-white">
                    <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No CRM leads attributed yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Attribute a lead above to track customer acquisition and pipeline value
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left bg-white text-xs">
                      <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">Lead Contact & Company</th>
                          <th className="py-2.5 px-3 font-semibold">Lead Status</th>
                          <th className="py-2.5 px-3 font-semibold">Attributed Date</th>
                          <th className="py-2.5 px-3 font-semibold">Conversion & Opportunity</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attributedLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-slate-900">{lead.contactName}</div>
                              <div className="text-[11px] text-slate-500">
                                {lead.leadTitle} {lead.companyName ? `• ${lead.companyName}` : ''}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge
                                variant={
                                  lead.status === 'converted'
                                    ? 'success'
                                    : lead.status === 'qualified'
                                    ? 'default'
                                    : 'outline'
                                }
                                className="text-[10px]"
                              >
                                {lead.status}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {new Date(lead.attributedAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3">
                              {lead.convertedOpportunityName ? (
                                <div className="text-emerald-700 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>{lead.convertedOpportunityName}</span>
                                </div>
                              ) : lead.status === 'converted' ? (
                                <span className="text-emerald-600 font-medium">Converted to Customer</span>
                              ) : (
                                <span className="text-slate-400">In Pipeline</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRemoveLead(lead.leadId)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                                title="Remove attribution"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteCampaign}
            disabled={isDeleting}
            className="text-red-600 hover:bg-red-50 border-red-200 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Campaign'}</span>
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            className="bg-slate-800 text-white hover:bg-slate-900"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
