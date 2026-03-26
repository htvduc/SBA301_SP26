import type { RoleDTO } from './user.dto';

export type StaffRoleName =
  | 'ADMIN'
  | 'RESTAURANT_OWNER'
  | 'BRANCH_MANAGER'
  | 'WAITER'
  | 'RECEPTIONIST';

export interface StaffAccountBackendDTO {
  staffAccountId: string;
  role: RoleDTO;
  username: string;
  status: string;
  branchId: string;
}

export interface StaffAccountDTO {
  id: string;
  username: string;
  role: RoleDTO;
  status: string;
  isActive: boolean;
  branchId: string;
}

export interface StaffAccountCreateRequest {
  username: string;
  password: string;
  branchId: string;
  role: RoleDTO;
}

export interface StaffAccountUpdateRequest {
  staffAccountId: string;
  username: string;
  role: RoleDTO;
  status?: string;
  branchId: string;
}

export function mapStaffAccountFromBackend(
  backend: StaffAccountBackendDTO
): StaffAccountDTO {
  return {
    id: backend.staffAccountId,
    username: backend.username,
    role: backend.role,
    status: backend.status,
    isActive: backend.status === 'ACTIVE',
    branchId: backend.branchId,
  };
}

