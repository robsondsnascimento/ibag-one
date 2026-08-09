import { UserRole } from '../../generated/prisma/client';
import { hasAnyUserRole, hasPastoralCampusAccess, userRoleWhere } from './user-role.util';

describe('user role access', () => {
  it('makes pastor senior inherit permissions granted to pastor', () => {
    expect(hasAnyUserRole({ role: UserRole.PASTOR_SENIOR }, [UserRole.PASTOR])).toBe(true);
  });

  it('includes pastor senior when a database query accepts pastor', () => {
    expect(userRoleWhere([UserRole.PASTOR])).toEqual({
      OR: [
        { role: { in: [UserRole.PASTOR, UserRole.PASTOR_SENIOR] } },
        { additionalRoles: { some: { role: { in: [UserRole.PASTOR, UserRole.PASTOR_SENIOR] } } } },
      ],
    });
  });

  it('restricts pastor to their campus while pastor senior reaches every campus', () => {
    const pastor = { role: UserRole.PASTOR, person: { campusId: 'campus-1' } };
    expect(hasPastoralCampusAccess(pastor, 'campus-1')).toBe(true);
    expect(hasPastoralCampusAccess(pastor, 'campus-2')).toBe(false);
    expect(hasPastoralCampusAccess({ role: UserRole.PASTOR_SENIOR, person: { campusId: 'campus-1' } }, 'campus-2')).toBe(true);
  });
});
