import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';


@Controller('users')
export class UserController {

  constructor(
    private readonly userService: UserService,
  ) {}


  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUser() user: any,
  ) {

    return this.userService.findAllByOrganization(
      user.organizationId,
    );

  }

}
