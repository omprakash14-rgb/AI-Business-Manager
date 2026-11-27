import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Building2,
  Users,
  Mail,
  Shield,
  Trash2,
  Check,
  AlertCircle,
  Copy,
  Plus,
  RefreshCw,
  KeyRound,
  FileText,
  Download,
  ExternalLink,
  Activity,
  ShieldAlert,
  HardDrive,
  Eye,
  Clock,
  Search,
  Filter,
  Crown
} from 'lucide-react';
import type {
  Role,
  AssignableRole,
  OrganizationMembershipDto,
  UserDto,
  InvitationDto,
  FileMetadataDto,
  ActivityEventDto,
  AuditLogDto,
  PaginationMeta
} from '@ai-business-manager/shared';
import {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  formatFileSize,
  formatDateTime,
  formatRelativeTime
} from '@ai-business-manager/shared';
import { PaginationBar } from '@/components/shared/PaginationBar';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { CreateOrganizationDialog } from '@/components/organization/CreateOrganizationDialog';

type MemberItem = OrganizationMembershipDto & { user: UserDto };

export function OrganizationSettingsView() {
  const { activeOrganization, currentMembership, user, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'invitations' | 'files' | 'activity' | 'audit'>('general');

  // General tab state
  const [orgName, setOrgName] = useState(activeOrganization?.name || '');
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [orgUpdateSuccess, setOrgUpdateSuccess] = useState(false);
  const [orgUpdateError, setOrgUpdateError] = useState<string | null>(null);

  // Members tab state
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);

  // Invitations tab state
  const [invitations, setInvitations] = useState<InvitationDto[]>([]);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AssignableRole>('viewer');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [createdInviteToken, setCreatedInviteToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Accept invitation input state
  const [acceptTokenInput, setAcceptTokenInput] = useState('');
  const [isAcceptingToken, setIsAcceptingToken] = useState(false);
  const [acceptSuccessMsg, setAcceptSuccessMsg] = useState<string | null>(null);
  const [acceptErrorMsg, setAcceptErrorMsg] = useState<string | null>(null);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);

  // Files tab state
  const [files, setFiles] = useState<FileMetadataDto[]>([]);
  const [filePagination, setFilePagination] = useState<PaginationMeta | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileSearch, setFileSearch] = useState('');
  const [filePage, setFilePage] = useState(1);
  const [fileVisibilityFilter, setFileVisibilityFilter] = useState('');
  const [fileActionError, setFileActionError] = useState<string | null>(null);
  const [fileSignedUrlModal, setFileSignedUrlModal] = useState<{
    isOpen: boolean;
    url: string;
    fileName: string;
    expiresAt: string;
  } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileMimeType, setNewFileMimeType] = useState('application/pdf');
  const [newFileSizeBytes, setNewFileSizeBytes] = useState(1048576);
  const [newFileVisibility, setNewFileVisibility] = useState<'private' | 'organization'>('organization');
  const [newFileModule, setNewFileModule] = useState('documents');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  // Activity timeline tab state
  const [activities, setActivities] = useState<ActivityEventDto[]>([]);
  const [activityPagination, setActivityPagination] = useState<PaginationMeta | null>(null);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [activityResourceTypeFilter, setActivityResourceTypeFilter] = useState('');

  // Audit logs tab state
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [auditPagination, setAuditPagination] = useState<PaginationMeta | null>(null);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState('');

  const isOwnerOrAdmin = currentMembership?.role === 'owner' || currentMembership?.role === 'admin';
  const isOwner = currentMembership?.role === 'owner';

  // Load members
  const loadMembers = useCallback(async () => {
    if (!activeOrganization) return;
    setIsLoadingMembers(true);
    setMemberActionError(null);
    try {
      const data = await apiClient.getMembers();
      setMembers(data);
    } catch (err) {
      setMemberActionError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoadingMembers(false);
    }
  }, [activeOrganization]);

  // Load invitations
  const loadInvitations = useCallback(async () => {
    if (!activeOrganization || !isOwnerOrAdmin) return;
    setIsLoadingInvitations(true);
    try {
      const data = await apiClient.getInvitations();
      setInvitations(data);
    } catch {
      // Ignore if not authorized
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [activeOrganization, isOwnerOrAdmin]);

  // Load files
  const loadFiles = useCallback(async (page = filePage, search = fileSearch, visibility = fileVisibilityFilter) => {
    if (!activeOrganization) return;
    setIsLoadingFiles(true);
    setFileActionError(null);
    try {
      const res = await apiClient.listFiles({
        page,
        limit: 10,
        search: search || undefined,
        visibility: visibility || undefined,
      });
      setFiles(res.items);
      setFilePagination(res.pagination);
    } catch (err) {
      setFileActionError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoadingFiles(false);
    }
  }, [activeOrganization, filePage, fileSearch, fileVisibilityFilter]);

  // Load activities
  const loadActivities = useCallback(async (page = activityPage, search = activitySearch, resourceType = activityResourceTypeFilter) => {
    if (!activeOrganization) return;
    setIsLoadingActivities(true);
    try {
      const res = await apiClient.getActivities({
        page,
        limit: 10,
        search: search || undefined,
      }, resourceType || undefined);
      setActivities(res.items);
      setActivityPagination(res.pagination);
    } catch {
      // Gracefully handle
    } finally {
      setIsLoadingActivities(false);
    }
  }, [activeOrganization, activityPage, activitySearch, activityResourceTypeFilter]);

  // Load audit logs
  const loadAuditLogs = useCallback(async (page = auditPage, search = auditSearch, action = auditActionFilter) => {
    if (!activeOrganization || !isOwnerOrAdmin) return;
    setIsLoadingAuditLogs(true);
    try {
      const res = await apiClient.getAuditLogs({
        page,
        limit: 10,
        search: search || undefined,
        action: action || undefined,
      });
      setAuditLogs(res.items);
      setAuditPagination(res.pagination);
    } catch {
      // Gracefully handle
    } finally {
      setIsLoadingAuditLogs(false);
    }
  }, [activeOrganization, isOwnerOrAdmin, auditPage, auditSearch, auditActionFilter]);

  useEffect(() => {
    setOrgName(activeOrganization?.name || '');
    if (activeTab === 'members') loadMembers();
    if (activeTab === 'invitations') loadInvitations();
    if (activeTab === 'files') loadFiles();
    if (activeTab === 'activity') loadActivities();
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeOrganization, activeTab, loadMembers, loadInvitations, loadFiles, loadActivities, loadAuditLogs]);

  // File action handlers
  const handleCreateFileMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    setIsCreatingFile(true);
    setFileActionError(null);
    try {
      await apiClient.createFileMetadata({
        fileName: newFileName.trim(),
        mimeType: newFileMimeType.trim() || 'application/octet-stream',
        fileSize: Number(newFileSizeBytes) || 1024,
        visibility: newFileVisibility,
      });
      setShowUploadModal(false);
      setNewFileName('');
      await loadFiles(1);
    } catch (err) {
      setFileActionError(err instanceof Error ? err.message : 'Failed to register file metadata');
    } finally {
      setIsCreatingFile(false);
    }
  };

  const handleGetAccessUrl = async (fileId: string, fileName: string) => {
    try {
      const res = await apiClient.getFileAccessUrl(fileId);
      setFileSignedUrlModal({
        isOpen: true,
        url: res.downloadUrl,
        fileName,
        expiresAt: res.expiresAt,
      });
    } catch (err) {
      setFileActionError(err instanceof Error ? err.message : 'Failed to generate secure access URL');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to soft-delete this file?')) return;
    try {
      await apiClient.deleteFile(fileId);
      await loadFiles();
    } catch (err) {
      setFileActionError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  // Handle org update
  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !isOwnerOrAdmin) return;

    setIsUpdatingOrg(true);
    setOrgUpdateError(null);
    setOrgUpdateSuccess(false);

    try {
      await apiClient.updateCurrentOrganization({ name: orgName.trim() });
      setOrgUpdateSuccess(true);
      await refreshAuth();
      setTimeout(() => setOrgUpdateSuccess(false), 3000);
    } catch (err) {
      setOrgUpdateError(err instanceof Error ? err.message : 'Failed to update organization');
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  // Handle role change (Owner only)
  const handleRoleChange = async (memberId: string, memberName: string, newRole: Role) => {
    const roleLabel = ROLE_LABELS[newRole] || newRole;
    if (!confirm(`Are you sure you want to change the role of "${memberName}" to ${roleLabel}? This change will take effect immediately.`)) {
      return;
    }
    try {
      await apiClient.updateMemberRole(memberId, newRole);
      await loadMembers();
      await refreshAuth();
    } catch (err) {
      setMemberActionError(err instanceof Error ? err.message : 'Failed to update member role');
    }
  };

  // Handle member removal
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the organization?')) return;
    try {
      await apiClient.removeMember(memberId);
      await loadMembers();
    } catch (err) {
      setMemberActionError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  // Handle invite creation
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSendingInvite(true);
    setInviteError(null);
    setCreatedInviteToken(null);

    try {
      const result = await apiClient.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole
      });
      setCreatedInviteToken(result.invitationToken);
      setInviteEmail('');
      await loadInvitations();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Handle revoke invitation
  const handleRevokeInvite = async (invitationId: string) => {
    try {
      await apiClient.revokeInvitation(invitationId);
      await loadInvitations();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to revoke invitation');
    }
  };

  // Handle accept invitation
  const handleAcceptToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTokenInput.trim()) return;

    setIsAcceptingToken(true);
    setAcceptErrorMsg(null);
    setAcceptSuccessMsg(null);

    try {
      const res = await apiClient.acceptInvitation(acceptTokenInput.trim());
      setAcceptSuccessMsg(res.message);
      setAcceptTokenInput('');
      await refreshAuth();
    } catch (err) {
      setAcceptErrorMsg(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setIsAcceptingToken(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const renderAcceptInvitationCard = (hasActiveOrg: boolean) => (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-600" />
          <span>{hasActiveOrg ? 'Join Another Organization via Invitation Token' : 'Join an Organization via Invitation Token'}</span>
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Have an invitation token sent to <strong>{user?.email}</strong> by an organization owner or administrator? Paste it here to join.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {acceptSuccessMsg && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{acceptSuccessMsg}</span>
          </div>
        )}
        {acceptErrorMsg && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{acceptErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAcceptToken} className="flex flex-col sm:flex-row gap-2 max-w-lg">
          <input
            type="text"
            required
            placeholder="Paste invitation token here..."
            value={acceptTokenInput}
            onChange={(e) => setAcceptTokenInput(e.target.value)}
            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button type="submit" size="sm" disabled={isAcceptingToken || !acceptTokenInput.trim()}>
            {isAcceptingToken ? 'Joining...' : 'Accept & Join'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  if (!activeOrganization) {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold text-slate-900">
                      No Active Organization
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      Viewer
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Your account has default Viewer access and is not yet a member of an organization.
                  </CardDescription>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowCreateOrgModal(true)} className="gap-1.5 self-start sm:self-auto">
                <Plus className="h-3.5 w-3.5" />
                <span>Create Organization</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            To protect multi-tenant workspace isolation, new registrations are not automatically added to an organization. Join an existing organization using an invitation token below, or create a new workspace.
          </CardContent>
        </Card>

        {renderAcceptInvitationCard(false)}

        <CreateOrganizationDialog
          isOpen={showCreateOrgModal}
          onClose={() => setShowCreateOrgModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{activeOrganization.name}</h2>
              <Badge variant="default" className="text-[10px] uppercase font-mono">
                {currentMembership?.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Workspace Slug: <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{activeOrganization.slug}</code>
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center rounded-lg border border-slate-200 bg-slate-50 p-1 self-start md:self-auto text-xs font-medium gap-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'members' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
              activeTab === 'invitations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invitations & Join
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'files' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span>Files & Storage</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activity' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Activity History</span>
          </button>
          {isOwnerOrAdmin && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`rounded-md px-3 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Audit Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: General Organization Settings */}
      {activeTab === 'general' && (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900">Organization Settings</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Manage organization metadata and workspace identification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {orgUpdateSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Organization details updated successfully</span>
              </div>
            )}
            {orgUpdateError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{orgUpdateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateOrg} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Organization Name</label>
                <input
                  type="text"
                  disabled={!isOwnerOrAdmin}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full max-w-md rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {!isOwnerOrAdmin && (
                  <span className="text-[10px] text-slate-400">Only Owners and Admins can rename the organization.</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Organization ID (Immutable Tenant Identifier)</label>
                <input
                  type="text"
                  disabled
                  value={activeOrganization.id}
                  className="w-full max-w-md rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              {isOwnerOrAdmin && (
                <div className="pt-2">
                  <Button type="submit" size="sm" disabled={isUpdatingOrg || orgName === activeOrganization.name}>
                    {isUpdatingOrg ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Team Members Management */}
      {activeTab === 'members' && (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Organization Members ({members.length})</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Users with authorized access to this organization's records and workflows.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMembers}
              disabled={isLoadingMembers}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingMembers ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {memberActionError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{memberActionError}</span>
              </div>
            )}

            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                    {isOwner && <th className="py-2.5 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => {
                    const isSelf = m.userId === user?.id;
                    const isOwnerRole = m.role === 'owner';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              fallback={m.user.fullName.substring(0, 2).toUpperCase()}
                              className="h-7 w-7 text-[11px]"
                            />
                            <div>
                              <div className="font-medium text-slate-900 flex items-center gap-1.5">
                                <span>{m.user.fullName}</span>
                                {isSelf && (
                                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500">{m.user.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          {isOwnerRole ? (
                            <Badge
                              variant="default"
                              className="bg-amber-600 hover:bg-amber-600 text-white gap-1 text-[10px]"
                            >
                              <Crown className="h-3 w-3" />
                              <span>Owner</span>
                            </Badge>
                          ) : isOwner && !isSelf ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleRoleChange(m.id, m.user.fullName, e.target.value as Role)}
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="admin">Administrator</option>
                              <option value="manager">Manager</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer (Default / Read-Only)</option>
                            </select>
                          ) : (
                            <Badge
                              variant={m.role === 'admin' ? 'secondary' : m.role === 'manager' ? 'secondary' : 'outline'}
                              className="capitalize text-[10px] gap-1"
                            >
                              <Shield className="h-3 w-3 mr-0.5" />
                              <span>{ROLE_LABELS[m.role] || m.role}</span>
                            </Badge>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="capitalize">{m.status}</span>
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>

                        {isOwner && (
                          <td className="py-2.5 px-3 text-right">
                            {!isSelf && !isOwnerRole ? (
                              <button
                                onClick={() => handleRemoveMember(m.id)}
                                className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove member from organization"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Role Permissions Reference */}
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3 mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Organizational Role Hierarchy & Permission Model</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="p-2.5 rounded bg-white border border-slate-200/60 shadow-2xs">
                  <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5" />
                    <span>Organization Owner</span>
                  </span>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    Full workspace control. Exclusive authority to assign, modify, and revoke member roles. Cannot be demoted or removed through ordinary management.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200/60 shadow-2xs">
                  <span className="font-semibold text-slate-900">Administrator</span>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    Operational administrative permissions across business modules. Cannot assign, modify, or promote roles.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200/60 shadow-2xs">
                  <span className="font-semibold text-slate-900">Manager</span>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    Operational team, project, and workflow management. Cannot manage member roles or access security governance.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200/60 shadow-2xs">
                  <span className="font-semibold text-slate-900">Member</span>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    Standard operational workspace access across assigned business modules. Cannot assign or modify member roles.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200/60 shadow-2xs md:col-span-2">
                  <span className="font-semibold text-blue-700">Viewer (Default Role — Read-Only)</span>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    Read-only visibility across authorized business records without write, create, or update permissions. Default role assigned to newly registered accounts and non-owner invitations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Invitations & Join */}
      {activeTab === 'invitations' && (
        <div className="space-y-6">
          {/* Card: Pending Invitations */}
          {isOwnerOrAdmin && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>Pending Invitations ({invitations.length})</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Invite new colleagues to join this organization.
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowInviteModal(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Invite Member</span>
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                {createdInviteToken && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-blue-900">
                        ✓ Invitation Created Successfully
                      </span>
                      <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                        Valid for 7 days
                      </span>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      In accordance with Phase 2 scope, external SMTP email delivery is not configured.
                      Share this invitation token directly with the invited user:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={createdInviteToken}
                        className="flex-1 rounded border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdInviteToken)}
                        className="gap-1.5 bg-white shrink-0"
                      >
                        {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {invitations.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                    No pending invitations for this organization.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Invitee Email</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Expires At</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invitations.map((inv) => (
                          <tr key={inv.id}>
                            <td className="py-2.5 px-3 font-medium text-slate-800">{inv.email}</td>
                            <td className="py-2.5 px-3">
                              <Badge variant="outline" className="capitalize text-[10px]">
                                {inv.role}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-500">
                              {new Date(inv.expiresAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRevokeInvite(inv.id)}
                                className="text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer font-medium"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card: Accept an Invitation Token */}
          {renderAcceptInvitationCard(true)}
        </div>
      )}

      {/* Tab 4: Files & Storage Foundation */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-blue-600" />
                  <span>Files & Storage Foundation</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Reusable file metadata management with tenant isolation and HMAC-signed private access URLs.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  className="gap-1.5 bg-blue-600 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Register File</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadFiles()}
                  disabled={isLoadingFiles}
                  className="gap-1.5"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fileActionError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{fileActionError}</span>
                </div>
              )}

              <SearchFilterBar
                search={fileSearch}
                onSearchChange={(v) => {
                  setFileSearch(v);
                  setFilePage(1);
                  loadFiles(1, v, fileVisibilityFilter);
                }}
                placeholder="Search files by name..."
                filterValue={fileVisibilityFilter}
                filterOptions={[
                  { label: 'All Visibilities', value: '' },
                  { label: 'Private (Uploader only)', value: 'private' },
                  { label: 'Organization (Members)', value: 'organization' },
                ]}
                onFilterChange={(v) => {
                  setFileVisibilityFilter(v);
                  setFilePage(1);
                  loadFiles(1, fileSearch, v);
                }}
              />

              {isLoadingFiles ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading file records...</div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No files found matching criteria. Click &quot;Register File&quot; to test metadata creation.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">File Name</th>
                        <th className="py-2.5 px-3">Storage</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Visibility</th>
                        <th className="py-2.5 px-3">Registered</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {files.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-slate-800 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                            <div className="truncate max-w-[200px]" title={file.fileName}>
                              {file.fileName}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              {file.storageProvider || 'storage'}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {formatFileSize(file.fileSize)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                                file.visibility === 'organization'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {file.visibility}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {formatDateTime(file.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGetAccessUrl(file.id, file.fileName)}
                                className="h-7 text-xs px-2 gap-1"
                                title="Generate secure signed access URL"
                              >
                                <ExternalLink className="h-3 w-3 text-blue-600" />
                                <span>Access URL</span>
                              </Button>
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded cursor-pointer"
                                title="Soft-delete file"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filePagination && (
                <PaginationBar
                  pagination={filePagination}
                  onPageChange={(p) => {
                    setFilePage(p);
                    loadFiles(p);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Activity Timeline */}
      {activeTab === 'activity' && (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span>Organization Activity History</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Auditable event history across all workspace resources and tenant operations.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadActivities()}
              disabled={isLoadingActivities}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingActivities ? 'animate-spin' : ''}`} />
              <span>Refresh Timeline</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchFilterBar
              search={activitySearch}
              onSearchChange={(v) => {
                setActivitySearch(v);
                setActivityPage(1);
                loadActivities(1, v, activityResourceTypeFilter);
              }}
              placeholder="Search activities by action or description..."
              filterValue={activityResourceTypeFilter}
              filterOptions={[
                { label: 'All Resources', value: '' },
                { label: 'Organization', value: 'organization' },
                { label: 'File', value: 'file' },
                { label: 'Notification', value: 'notification' },
                { label: 'User', value: 'user' },
              ]}
              onFilterChange={(v) => {
                setActivityResourceTypeFilter(v);
                setActivityPage(1);
                loadActivities(1, activitySearch, v);
              }}
            />

            {isLoadingActivities ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No activity recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{act.action}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {act.resourceType}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-slate-400" title={formatDateTime(act.createdAt)}>
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-600">{act.description}</p>
                      {act.metadata && Object.keys(act.metadata).length > 0 && (
                        <pre className="mt-1 max-h-24 overflow-y-auto rounded bg-slate-100 p-2 text-[10px] font-mono text-slate-700">
                          {JSON.stringify(act.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activityPagination && (
              <PaginationBar
                pagination={activityPagination}
                onPageChange={(p) => {
                  setActivityPage(p);
                  loadActivities(p);
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 6: Audit Logs (Owner / Admin Only) */}
      {activeTab === 'audit' && isOwnerOrAdmin && (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-indigo-600" />
                <span>Security & Administrative Audit Logs</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Tamper-resistant audit trail with sanitized security metadata and client attribution.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAuditLogs()}
              disabled={isLoadingAuditLogs}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingAuditLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Logs</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchFilterBar
              search={auditSearch}
              onSearchChange={(v) => {
                setAuditSearch(v);
                setAuditPage(1);
                loadAuditLogs(1, v, auditActionFilter);
              }}
              placeholder="Search audit events by action..."
              filterValue={auditActionFilter}
              filterOptions={[
                { label: 'All Actions', value: '' },
                { label: 'User Login', value: 'AUTH_LOGIN' },
                { label: 'Org Update', value: 'ORGANIZATION_UPDATE' },
                { label: 'Invite Member', value: 'MEMBER_INVITE' },
                { label: 'Revoke Invite', value: 'INVITATION_REVOKE' },
                { label: 'File Register', value: 'FILE_REGISTER' },
                { label: 'File Delete', value: 'FILE_DELETE' },
              ]}
              onFilterChange={(v) => {
                setAuditActionFilter(v);
                setAuditPage(1);
                loadAuditLogs(1, auditSearch, v);
              }}
            />

            {isLoadingAuditLogs ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading audit trail...</div>
            ) : auditLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No security audit events recorded.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Actor / Target</th>
                      <th className="py-2.5 px-3">Client IP</th>
                      <th className="py-2.5 px-3">Sanitized Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                          {log.userId ? `User: ${log.userId.slice(0, 8)}...` : 'System'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td className="py-2.5 px-3">
                          <pre className="max-h-16 overflow-y-auto rounded bg-slate-100 p-1.5 text-[10px] font-mono text-slate-700 max-w-[280px]">
                            {log.metadata || 'N/A'}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {auditPagination && (
              <PaginationBar
                pagination={auditPagination}
                onPageChange={(p) => {
                  setAuditPage(p);
                  loadAuditLogs(p);
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Register File Metadata Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Register File Metadata</span>
              </CardTitle>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </CardHeader>
            <form onSubmit={handleCreateFileMetadata}>
              <CardContent className="space-y-3 pt-4 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. quarterly-financial-statement.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">MIME Type</label>
                    <select
                      value={newFileMimeType}
                      onChange={(e) => setNewFileMimeType(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="application/pdf">application/pdf</option>
                      <option value="image/png">image/png</option>
                      <option value="image/jpeg">image/jpeg</option>
                      <option value="text/csv">text/csv</option>
                      <option value="application/json">application/json</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Size (Bytes)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newFileSizeBytes}
                      onChange={(e) => setNewFileSizeBytes(Number(e.target.value))}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Visibility Scope</label>
                    <select
                      value={newFileVisibility}
                      onChange={(e) =>
                        setNewFileVisibility(e.target.value as 'private' | 'organization')
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="organization">Organization (All members)</option>
                      <option value="private">Private (Uploader only)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Associated Module</label>
                    <input
                      type="text"
                      placeholder="e.g. finance, documents"
                      value={newFileModule}
                      onChange={(e) => setNewFileModule(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t border-slate-100 p-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isCreatingFile || !newFileName.trim()}>
                  {isCreatingFile ? 'Registering...' : 'Register File Record'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Secure Signed URL Modal */}
      {fileSignedUrlModal && fileSignedUrlModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-lg border-slate-200 bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-emerald-600" />
                <span>HMAC-Signed Access URL</span>
              </CardTitle>
              <button
                onClick={() => setFileSignedUrlModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs">
              <p className="text-slate-600">
                A cryptographically signed URL has been minted for <strong>{fileSignedUrlModal.fileName}</strong>.
                This token authenticates access without exposing private storage credentials.
              </p>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 font-mono text-[11px] text-slate-800 break-all select-all">
                {fileSignedUrlModal.url}
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Expires at: {formatDateTime(fileSignedUrlModal.expiresAt)}</span>
                <span className="text-amber-600 font-medium">Valid for 15 minutes</span>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 border-t border-slate-100 p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(fileSignedUrlModal.url);
                  alert('Signed access URL copied to clipboard!');
                }}
                className="gap-1.5"
              >
                <Copy className="h-3 w-3" />
                <span>Copy URL</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setFileSignedUrlModal(null)}
              >
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md border-slate-200 bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Invite Team Member</CardTitle>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </CardHeader>
            <form onSubmit={handleSendInvite}>
              <CardContent className="space-y-4 pt-4 text-xs">
                {inviteError && (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-rose-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{inviteError}</span>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Invitee Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Assigned Role</label>
                  {isOwner ? (
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as AssignableRole)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="viewer">Viewer (Default) — Read-only access without write permissions</option>
                      <option value="member">Member — Standard operational workspace access</option>
                      <option value="manager">Manager — Operational team and workflow management</option>
                      <option value="admin">Administrator — Operational administrative permissions</option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        disabled
                        value="Viewer (Default Role)"
                        className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600 font-medium cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-500 block">
                        Non-owner invitations automatically receive the default Viewer role. Only the Organization Owner can assign elevated roles.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t border-slate-100 p-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSendingInvite || !inviteEmail.trim()}>
                  {isSendingInvite ? 'Generating Invite...' : 'Generate Invitation Token'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
