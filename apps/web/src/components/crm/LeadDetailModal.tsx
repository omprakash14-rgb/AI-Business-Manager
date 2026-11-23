import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  Clock,
  ArrowRightLeft,
  CheckCircle2,
  Trash2,
  Plus,
  MessageSquare,
  PhoneCall,
  CalendarDays,
  Check,
  AlertCircle,
  Tag
} from 'lucide-react';
import type {
  LeadDto,
  LeadStatus,
  CrmActivityDto,
  CrmActivityType,
  OrganizationMembershipDto,
  UserDto
} from '@ai-business-manager/shared';
import { formatDateTime, formatRelativeTime, formatCurrency } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { ConvertLeadModal } from './ConvertLeadModal';

interface LeadDetailModalProps {
  leadId: string;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export function LeadDetailModal({ leadId, onClose, onLeadUpdated }: LeadDetailModalProps) {
  const [lead, setLead] = useState<LeadDto | null>(null);
  const [activities, setActivities] = useState<CrmActivityDto[]>([]);
  const [members, setMembers] = useState<(OrganizationMembershipDto & { user: UserDto })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Status & Assignment state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // Log activity form state
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [actType, setActType] = useState<CrmActivityType>('note');
  const [actSubject, setActSubject] = useState('');
  const [actDescription, setActDescription] = useState('');
  const [actScheduledAt, setActScheduledAt] = useState('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  // Load lead and associated activities
  const loadLeadData = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const [leadData, actData, memData] = await Promise.all([
        apiClient.getLead(leadId),
        apiClient.getCrmActivities({ leadId, limit: 50 }),
        apiClient.getMembers().catch(() => [])
      ]);
      setLead(leadData);
      setActivities(actData.items);
      setMembers(memData);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load lead details');
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadLeadData();
  }, [loadLeadData]);

  // Handle status update
  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    setIsUpdatingStatus(true);
    try {
      await apiClient.updateLead(lead.id, { status: newStatus });
      await loadLeadData();
      onLeadUpdated();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle assignee change
  const handleAssigneeChange = async (assignedToId: string) => {
    if (!lead) return;
    try {
      await apiClient.assignLead(lead.id, assignedToId ? assignedToId : null);
      await loadLeadData();
      onLeadUpdated();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reassign lead');
    }
  };

  // Handle create activity
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !actSubject.trim()) return;

    setIsSavingActivity(true);
    try {
      await apiClient.createCrmActivity({
        leadId: lead.id,
        type: actType,
        subject: actSubject.trim(),
        description: actDescription.trim() || undefined,
        scheduledAt: actScheduledAt ? new Date(actScheduledAt).toISOString() : undefined
      });
      setActSubject('');
      setActDescription('');
      setActScheduledAt('');
      setShowActivityForm(false);
      await loadLeadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to log activity');
    } finally {
      setIsSavingActivity(false);
    }
  };

  // Handle complete follow-up activity
  const handleCompleteActivity = async (actId: string) => {
    try {
      await apiClient.updateCrmActivity(actId, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      await loadLeadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to complete activity');
    }
  };

  // Handle soft-delete lead
  const handleDeleteLead = async () => {
    if (!lead) return;
    if (!confirm(`Are you sure you want to soft-delete lead "${lead.title}"?`)) return;

    try {
      await apiClient.deleteLead(lead.id);
      onLeadUpdated();
      onClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  if (isLoading || !lead) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
        <Card className="w-full max-w-2xl border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Loading lead record...
        </Card>
      </div>
    );
  }

  const isConverted = lead.status === 'converted';

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'qualified': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'converted': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'unqualified': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'lost': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
      <Card className="w-full max-w-3xl border-slate-200 bg-white shadow-xl my-8">
        {/* Header */}
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getStatusBadge(lead.status)}`}>
                {lead.status}
              </span>
              <span className="text-xs text-slate-400">ID: {lead.id.slice(0, 8)}</span>
              {lead.estimatedValue && (
                <Badge variant="outline" className="font-mono text-xs text-emerald-700 bg-emerald-50">
                  {formatCurrency(lead.estimatedValue, lead.currency)}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">{lead.title}</CardTitle>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isConverted && (
              <Button
                size="sm"
                onClick={() => setShowConvertModal(true)}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer text-xs"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Convert Lead</span>
              </Button>
            )}
            <button
              onClick={handleDeleteLead}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
              title="Soft-delete lead"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-4 text-xs max-h-[75vh] overflow-y-auto">
          {actionError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Quick Actions Bar: Status & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block text-[11px]">Pipeline Status</label>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                disabled={isUpdatingStatus || isConverted}
                className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="new">New — Uncontacted Lead</option>
                <option value="contacted">Contacted — Initial Outreach Made</option>
                <option value="qualified">Qualified — High Fit & Verified</option>
                <option value="unqualified">Unqualified — Does Not Meet Criteria</option>
                <option value="lost">Lost — Ceased Discussions</option>
                {isConverted && <option value="converted">Converted — Customer Created</option>}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block text-[11px]">Assigned Owner</label>
              <select
                value={lead.assignedToId || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="">-- Unassigned --</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.fullName || m.userId} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lead Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-100 bg-white p-3 space-y-1 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Contact Person</span>
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>{lead.firstName} {lead.lastName}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px] truncate" title={lead.email}>
                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                  <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-100 bg-white p-3 space-y-1 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Company / Organization</span>
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>{lead.companyName || 'Not Specified'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                <Tag className="h-3 w-3 text-slate-400 shrink-0" />
                <span>Source: <strong className="capitalize">{lead.source.replace('_', ' ')}</strong></span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-white p-3 space-y-1 shadow-xs">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Lead Timestamps</span>
              <div className="text-[11px] text-slate-600">
                Created: <strong className="text-slate-800">{formatDateTime(lead.createdAt)}</strong>
              </div>
              {lead.convertedAt && (
                <div className="text-[11px] text-emerald-700 font-medium">
                  Converted: {formatDateTime(lead.convertedAt)}
                </div>
              )}
              {lead.convertedAccountName && (
                <div className="text-[11px] text-slate-600 truncate">
                  Account: <strong>{lead.convertedAccountName}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Initial Notes</span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Activity Timeline & Follow-ups */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-xs">
                  Interaction History & Follow-ups ({activities.length})
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActivityForm(!showActivityForm)}
                className="gap-1 h-7 text-xs"
              >
                <Plus className="h-3 w-3" />
                <span>{showActivityForm ? 'Cancel' : 'Log Activity'}</span>
              </Button>
            </div>

            {/* Inline Log Activity Form */}
            {showActivityForm && (
              <form onSubmit={handleCreateActivity} className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700 text-[11px]">Type</label>
                    <select
                      value={actType}
                      onChange={(e) => setActType(e.target.value as CrmActivityType)}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="note">Note</option>
                      <option value="call">Phone Call</option>
                      <option value="meeting">Meeting</option>
                      <option value="follow_up">Follow-up Reminder</option>
                      <option value="task">Action Item</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700 text-[11px]">Scheduled At (Optional)</label>
                    <input
                      type="datetime-local"
                      value={actScheduledAt}
                      onChange={(e) => setActScheduledAt(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 text-[11px]">Subject / Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Discovery Call with CTO"
                    value={actSubject}
                    onChange={(e) => setActSubject(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700 text-[11px]">Detailed Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Discussion points, next steps..."
                    value={actDescription}
                    onChange={(e) => setActDescription(e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowActivityForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSavingActivity || !actSubject.trim()}>
                    {isSavingActivity ? 'Saving...' : 'Save Activity'}
                  </Button>
                </div>
              </form>
            )}

            {/* Activities List */}
            {activities.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No activities logged yet. Click &quot;Log Activity&quot; to record notes, calls, or reminders.
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      {act.type === 'call' ? (
                        <PhoneCall className="h-3 w-3" />
                      ) : act.type === 'meeting' ? (
                        <CalendarDays className="h-3 w-3" />
                      ) : (
                        <MessageSquare className="h-3 w-3" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <span className="capitalize text-slate-500 font-mono text-[10px] bg-slate-200/60 px-1 py-0.2 rounded">
                            {act.type}
                          </span>
                          <span>{act.subject}</span>
                        </div>
                        <span className="text-[10px] text-slate-400" title={formatDateTime(act.createdAt)}>
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>

                      {act.description && <p className="text-slate-600 text-[11px]">{act.description}</p>}

                      <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
                        <span>Logged by {act.createdByName || 'Team Member'}</span>
                        {act.scheduledAt && (
                          <div className="flex items-center gap-2">
                            <span className={act.status === 'completed' ? 'text-slate-400' : 'text-amber-600 font-medium'}>
                              Due: {formatDateTime(act.scheduledAt)}
                            </span>
                            {act.status !== 'completed' ? (
                              <button
                                onClick={() => handleCompleteActivity(act.id)}
                                className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                                <span>Mark Done</span>
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-medium inline-flex items-center gap-0.5">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Completed</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Convert Lead Modal */}
      {showConvertModal && (
        <ConvertLeadModal
          lead={lead}
          onClose={() => setShowConvertModal(false)}
          onSuccess={(_res) => {
            setShowConvertModal(false);
            loadLeadData();
            onLeadUpdated();
          }}
        />
      )}
    </div>
  );
}
