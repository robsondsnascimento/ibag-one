import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

import {
  OrganizationContext,
} from '../context/organization-context';


export const CurrentOrganization =
  createParamDecorator(
    (
      data: unknown,
      ctx: ExecutionContext,
    ): OrganizationContext => {

      const request =
        ctx.switchToHttp()
          .getRequest();


      return {

        userId:
          request.user.userId,

        personId:
          request.user.personId,

        organizationId:
          request.user.organizationId,

      };

    },
  );
