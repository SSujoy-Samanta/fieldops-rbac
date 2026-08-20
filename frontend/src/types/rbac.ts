export enum SYSTEM_ROLE {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  FIELD_EMPLOYEE = "FIELD_EMPLOYEE",
}

export enum PERMISSION_MODULE {
  ATTENDANCE = "ATTENDANCE",
  VISITS = "VISITS",
  ROLES = "ROLES",
  USERS = "USERS",
}

export enum PERMISSION_KEY {
  CLOCK_IN_OUT = "CLOCK_IN_OUT",
  READ_SELF_ATTENDANCE = "READ_SELF_ATTENDANCE",
  READ_ALL_ATTENDANCE = "READ_ALL_ATTENDANCE",
  SAVE_VISIT = "SAVE_VISIT",
  READ_SELF_VISIT = "READ_SELF_VISIT",
  READ_ALL_VISIT = "READ_ALL_VISIT",
  MANAGE_ROLES = "MANAGE_ROLES",
  MANAGE_USERS = "MANAGE_USERS",
}

export interface Permission {
  id: string;
  key: PERMISSION_KEY;
  name: string;
  module: PERMISSION_MODULE;
  description: string | null;
}

export interface PermissionsData {
  permissions: Permission[];
  grouped: Record<PERMISSION_MODULE, Permission[]>;
}

export interface Role {
  id: string;
  name: SYSTEM_ROLE;
  description: string | null;
  userCount?: number;
  permissions: Permission[];
  permissionKeys: PERMISSION_KEY[];
  isImmutable?: boolean;
  minimumPermissions?: PERMISSION_KEY[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateRolePermissionsPayload {
  permissionKeys: PERMISSION_KEY[];
  description?: string;
}

export interface RbacContext {
  roleId: string;
  roleName: SYSTEM_ROLE;
  permissions: PERMISSION_KEY[];
  isOwner?: boolean;
}
