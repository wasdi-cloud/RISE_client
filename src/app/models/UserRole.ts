export enum UserRole {
  RISE_ADMIN = "RISE_ADMIN",
  ADMIN = "ADMIN",
  HQ = "HQ",
  FIELD = "FIELD",
  SHARED = "SHARED"
}

export class UserRoleHelper {
  static isValid(value: string): boolean {
    if (!value) return false;

    return Object.values(UserRole).includes(value as UserRole);
  }

  static isAdmin(user: User | null): boolean {
    if (!user || !this.isValid(user.getRole())) return false;

    return user.getRole() === UserRole.ADMIN;
  }

  static isRiseAdmin(user: User | null): boolean {
    if (!user || !this.isValid(user.getRole())) return false;

    return user.getRole() === UserRole.RISE_ADMIN;
  }

  static getRoleFromName(name: string) {
    if (name == "RISE_ADMIN") {
      return UserRole.RISE_ADMIN
    }
    if (name == "ADMIN") {
      return UserRole.ADMIN
    }
    if (name == "FIELD") {
      return UserRole.FIELD
    }
    if (name == "HQ") {
      return UserRole.HQ
    }
    return null;
  }


}

export class User {
  private role: UserRole;

  constructor(role: UserRole) {
    this.role = role;
  }

  getRole(): UserRole {
    return this.role;
  }
}
