import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const hasRole = useAuthStore((state) => state.hasRole);
  
  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
