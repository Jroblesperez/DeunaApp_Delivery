'use client';

import { createContext, useContext } from 'react';
import type { EnterpriseAccessRole } from '@/lib/enterprise/types';

type Permission = 'view:executive' | 'view:delivery' | 'view:leadership' | 'view:workspace';

const permissionsByRole: Record<EnterpriseAccessRole, Permission[]> = {
  Executive: ['view:executive', 'view:leadership', 'view:workspace'],
  Delivery: ['view:delivery', 'view:workspace'],
  Leadership: ['view:executive', 'view:delivery', 'view:leadership', 'view:workspace'],
  ReadOnly: ['view:workspace'],
};

type PermissionContextValue = {
  role: EnterpriseAccessRole;
  can: (permission: Permission) => boolean;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ role, children }: { role: EnterpriseAccessRole; children: React.ReactNode }) {
  return <PermissionContext.Provider value={{ role, can: (permission) => permissionsByRole[role].includes(permission) }}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions debe utilizarse dentro de PermissionProvider');
  return context;
}
