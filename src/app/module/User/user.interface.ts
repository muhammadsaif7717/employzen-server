export type TUserRole = "candidate" | "employer" | "admin";
export type TUserStatus = "active" | "blocked";

export interface IUser {
  email: string;
  password?: string;
  role: TUserRole;
  status: TUserStatus;
  name?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
