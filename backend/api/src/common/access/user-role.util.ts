import { Prisma, UserRole } from '../../generated/prisma/client';

export type UserWithAdditionalRoles = {
  role: UserRole;
  additionalRoles?: { role: UserRole }[];
};

export type UserWithPastoralCampus = UserWithAdditionalRoles & {
  person?: {
    campusId: string;
    campusMemberships?: { campusId: string; ativo?: boolean }[];
  } | null;
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

export function hasPastoralCampusAccess(user: UserWithPastoralCampus | null | undefined, campusId: string) {
  if (hasAnyUserRole(user, [UserRole.PASTOR_SENIOR])) return true;
  return hasDirectUserRole(user, [UserRole.PASTOR]) && pastoralCampusIds(user).includes(campusId);
}

export function pastoralCampusIds(user: UserWithPastoralCampus | null | undefined): string[] {
  if (!user?.person) return [];
  return [...new Set([
    user.person.campusId,
    ...(user.person.campusMemberships ?? [])
      .filter((membership) => membership.ativo !== false)
      .map((membership) => membership.campusId),
  ])];
}

function expandPastorSeniorRole(roles: UserRole[]): UserRole[] {
  if (!roles.includes(UserRole.PASTOR) || roles.includes(UserRole.PASTOR_SENIOR)) return roles;
  return [...roles, UserRole.PASTOR_SENIOR];
}

function hasDirectUserRole(user: UserWithAdditionalRoles | null | undefined, roles: UserRole[]) {
  return user?.role != null && (roles.includes(user.role) || user.additionalRoles?.some(assignment => roles.includes(assignment.role)) === true);
}
