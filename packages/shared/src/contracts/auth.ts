import { z } from 'zod';

// Roles & Status Enums
export const RoleSchema = z.enum(['owner', 'admin', 'manager', 'member', 'viewer']);
export type Role = z.infer<typeof RoleSchema>;

// Assignable roles: Non-owner roles that can be assigned by the Owner to organization members
export const AssignableRoleSchema = z.enum(['admin', 'manager', 'member', 'viewer']);
export type AssignableRole = z.infer<typeof AssignableRoleSchema>;

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Organization Owner',
  admin: 'Administrator',
  manager: 'Manager',
  member: 'Member',
  viewer: 'Viewer (Default)'
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Full organization-level control and exclusive management of member roles.',
  admin: 'Operational administrative permissions across business modules (cannot assign or modify roles).',
  manager: 'Operational team and workflow management permissions (cannot assign or modify roles).',
  member: 'Standard operational workspace access.',
  viewer: 'Read-only visibility across authorized business records. Default role assigned to all new accounts.'
};

export const MembershipStatusSchema = z.enum(['active', 'invited', 'suspended']);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

export const UserStatusSchema = z.enum(['active', 'suspended', 'deactivated']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const OrganizationStatusSchema = z.enum(['active', 'suspended', 'archived']);
export type OrganizationStatus = z.infer<typeof OrganizationStatusSchema>;

export const InvitationStatusSchema = z.enum(['pending', 'accepted', 'revoked', 'expired']);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

// Input Schemas
export const RegisterInputSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Valid email address required' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  fullName: z.string().trim().min(2, { message: 'Full name must be at least 2 characters long' }).max(100)
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Valid email address required' }),
  password: z.string().min(1, { message: 'Password is required' })
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const UpdateProfileInputSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  avatarUrl: z.string().url().or(z.string().length(0)).optional()
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const CreateOrganizationInputSchema = z.object({
  name: z.string().trim().min(2, { message: 'Organization name must be at least 2 characters' }).max(100),
  slug: z.string().trim().toLowerCase()
    .min(2, { message: 'Slug must be at least 2 characters' })
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase alphanumeric with optional single hyphens' })
    .optional()
});
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationInputSchema>;

export const SwitchOrganizationInputSchema = z.object({
  organizationId: z.string().min(1, { message: 'Organization ID is required' })
});
export type SwitchOrganizationInput = z.infer<typeof SwitchOrganizationInputSchema>;

export const UpdateOrganizationInputSchema = z.object({
  name: z.string().trim().min(2).max(100)
});
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationInputSchema>;

export const InviteMemberInputSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'Valid email required' }),
  role: AssignableRoleSchema.default('viewer')
});
export type InviteMemberInput = z.infer<typeof InviteMemberInputSchema>;

export const UpdateMemberRoleInputSchema = z.object({
  role: AssignableRoleSchema
});
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInputSchema>;

export const AcceptInvitationInputSchema = z.object({
  token: z.string().min(10, { message: 'Invalid or missing invitation token' })
});
export type AcceptInvitationInput = z.infer<typeof AcceptInvitationInputSchema>;

// DTO Schemas & Types
export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: string;
}

export interface OrganizationMembershipDto {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  status: MembershipStatus;
  createdAt: string;
  organization?: OrganizationDto;
  user?: UserDto;
}

export interface InvitationDto {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  invitationToken?: string; // Included only at creation time for display/sharing
}

export interface AuthSessionDto {
  user: UserDto;
  activeOrganization: OrganizationDto | null;
  currentMembership: OrganizationMembershipDto | null;
  organizations: OrganizationDto[];
}
