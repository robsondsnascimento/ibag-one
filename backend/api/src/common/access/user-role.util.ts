import { Prisma, UserRole } from '../../generated/prisma/client';

export type UserWithAdditionalRoles = {
  role: UserRole;
  additionalRoles?: { role: UserRole }[];
};

export function hasAnyUserRole(user: UserWithAdditionalRoles | null | undefined, roles: UserRole[]) {
  if (!user) return false;
  return roles.includes(user.role) || user.additionalRoles?.some(assignment => roles.includes(assignment.role)) === true;
}

export function userRoleWhere(roles: UserRole[]): Prisma.UserWhereInput {
  return {
    OR: [
      { role: { in: roles } },
      { additionalRoles: { some: { role: { in: roles } } } },
    ],
  };
}
