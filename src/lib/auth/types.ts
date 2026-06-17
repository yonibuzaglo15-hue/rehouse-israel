export type SystemRole = "dev" | "admin" | "agent";

export type Permission =
  | "system.settings"
  | "users.manage"
  | "logs.view"
  | "dashboard.technical"
  | "properties.manage.all"
  | "properties.approve"
  | "properties.create"
  | "properties.edit.own"
  | "agents.view"
  | "agents.edit";

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: SystemRole;
}

export interface UserCredentialRecord {
  userId: string;
  passwordHash: string;
}
