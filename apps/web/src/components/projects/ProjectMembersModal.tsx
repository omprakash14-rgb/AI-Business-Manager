import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectMemberDto, ProjectMemberRole } from '@ai-business-manager/shared';
import { apiClient } from '@/lib/api-client';
import { X, Users, UserPlus, Trash2, Shield, AlertCircle } from 'lucide-react';

interface ProjectMembersModalProps {
  isOpen: boolean;
  projectId: string;
  ownerId: string;
  onClose: () => void;
  onMembersUpdated: () => void;
}

export function ProjectMembersModal({
  isOpen,
  projectId,
  ownerId,
  onClose,
  onMembersUpdated
}: ProjectMembersModalProps) {
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [orgUsers, setOrgUsers] = useState<{ id: string; fullName: string; email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole>('contributor');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [mList, orgMembers] = await Promise.all([
        apiClient.getProjectMembers(projectId),
        apiClient.getMembers()
      ]);
      setMembers(mList);
      setOrgUsers(
        orgMembers.map((m) => ({
          id: m.user.id,
          fullName: m.user.fullName,
          email: m.user.email
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load project members');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a team member.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.addProjectMember(projectId, {
        userId: selectedUserId,
        role: selectedRole
      });
      setSelectedUserId('');
      await loadData();
      onMembersUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === ownerId) {
      alert('The project owner cannot be removed.');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this member from the project?')) return;

    try {
      await apiClient.removeProjectMember(projectId, userId);
      await loadData();
      onMembersUpdated();
    } catch (err: any) {
      alert(`Failed to remove member: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  // Filter out users already in project for dropdown
  const memberUserIds = new Set(members.map((m) => m.userId));
  const availableUsers = orgUsers.filter((u) => !memberUserIds.has(u.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Project Team Members</h3>
              <p className="text-xs text-slate-500">Manage contributor access and team assignments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Member Bar */}
          <form onSubmit={handleAddMember} className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Organization Member</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ProjectMemberRole)}
              className="w-28 text-xs px-2.5 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="contributor">Contributor</option>
              <option value="lead">Lead</option>
              <option value="viewer">Viewer</option>
            </select>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !selectedUserId}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add
            </Button>
          </form>

          {/* Member List */}
          <div className="space-y-2 border border-slate-200 rounded-lg p-3 max-h-60 overflow-y-auto">
            {isLoading && members.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4">No team members assigned.</p>
            ) : (
              members.map((m) => {
                const isOwner = m.userId === ownerId;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-50/70 border border-slate-100 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{m.userName}</span>
                        {isOwner && (
                          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            Owner
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {m.role}
                        </Badge>
                      </div>
                      {m.userEmail && <div className="text-[11px] text-slate-400">{m.userEmail}</div>}
                    </div>

                    {!isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.userId)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
