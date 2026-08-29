import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  UseGuards,
  Delete,
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
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { CreatePersonLoginDto } from './dto/create-person-login.dto';
import { ChangeOwnPasswordDto } from './dto/change-own-password.dto';
import { UserRole } from '../../generated/prisma/client';


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

  @Get('persons/:personId')
  @UseGuards(JwtAuthGuard)
  findByPerson(@Param('personId') personId: string, @CurrentOrganization() context: OrganizationContext) {
    return this.userService.findByPerson(personId, context);
  }

  @Post('persons/:personId')
  @UseGuards(JwtAuthGuard)
  createForPerson(@Param('personId') personId: string, @Body() dto: CreatePersonLoginDto, @CurrentOrganization() context: OrganizationContext) {
    return this.userService.createForPerson(personId, dto, context);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  changeOwnPassword(@Body() dto: ChangeOwnPasswordDto, @CurrentOrganization() context: OrganizationContext) {
    return this.userService.changeOwnPassword(dto, context);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto, @CurrentOrganization() context: OrganizationContext) {
    return this.userService.updateRole(id, dto, context);
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard)
  assignAdditionalRole(@Param('id') id: string, @Body() dto: AssignUserRoleDto, @CurrentOrganization() context: OrganizationContext) {
    return this.userService.assignAdditionalRole(id, dto, context);
  }

  @Delete(':id/roles/:role')
  @UseGuards(JwtAuthGuard)
  removeAdditionalRole(@Param('id') id: string, @Param('role') role: UserRole, @CurrentOrganization() context: OrganizationContext) {
    return this.userService.removeAdditionalRole(id, role, context);
  }

}
