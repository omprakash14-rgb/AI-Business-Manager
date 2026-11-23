export type ModuleId =
  | 'dashboard'
  | 'crm'
  | 'sales'
  | 'finance'
  | 'projects'
  | 'hr'
  | 'marketing'
  | 'analytics'
  | 'automation'
  | 'settings';

export interface NavItem {
  id: ModuleId;
  label: string;
  href: string;
  icon: string;
  isPlaceholder?: boolean;
  plannedPhase?: string;
  description?: string;
}

export interface UserProfilePlaceholder {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface OrganizationPlaceholder {
  id: string;
  name: string;
  slug: string;
  plan: string;
}
