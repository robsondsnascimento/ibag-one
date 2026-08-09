import { Prisma, UserRole } from '../../generated/prisma/client';

export type UserWithAdditionalRoles = {
  role: UserRole;
  additionalRoles?: { role: UserRole }[];
};

export function hasAnyUserRole(user: UserWithAdditionalRoles | null | undefined, roles: UserRole[]) {
  if (!user) return false;
  const effectiveRoles = expandPastorSeniorRole(roles);
  return effectiveRoles.includes(user.role) || user.additionalRoles?.some(assignment => effectiveRoles.includes(assignment.role)) === true;
}

export function userRoleWhere(roles: UserRole[]): Prisma.UserWhereInput {
  const effectiveRoles = expandPastorSeniorRole(roles);
  return {
    OR: [
      { role: { in: effectiveRoles } },
      { additionalRoles: { some: { role: { in: effectiveRoles } } } },
    ],
  };
}

function expandPastorSeniorRole(roles: UserRole[]): UserRole[] {
  if (!roles.includes(UserRole.PASTOR) || roles.includes(UserRole.PASTOR_SENIOR)) return roles;
  return [...roles, UserRole.PASTOR_SENIOR];
}
