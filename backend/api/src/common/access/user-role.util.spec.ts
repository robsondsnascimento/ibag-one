import { UserRole } from '../../generated/prisma/client';
import { hasAnyUserRole, userRoleWhere } from './user-role.util';

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
});
