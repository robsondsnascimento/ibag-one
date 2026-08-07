import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  CurrentOrganization,
} from '../../common/decorators/current-organization.decorator';

import {
  OrganizationContext,
} from '../../common/context/organization-context';


@Controller('users')
export class UserController {

  constructor(
    private readonly userService: UserService,
  ) {}


  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentOrganization()
    context: OrganizationContext,
  ) {

    return this.userService.findAllByOrganization(
      context.organizationId,
    );

  }

}
