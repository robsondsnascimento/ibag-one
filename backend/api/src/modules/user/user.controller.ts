import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
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
import { UpdateUserRoleDto } from './dto/update-user-role.dto';


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

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto, @CurrentOrganization() context: OrganizationContext) {
    return this.userService.updateRole(id, dto, context);
  }

}
