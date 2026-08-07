import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { PersonService } from './person.service';

import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  CurrentOrganization,
} from '../../common/decorators/current-organization.decorator';

import {
  OrganizationContext,
} from '../../common/context/organization-context';


@Controller('persons')
@UseGuards(JwtAuthGuard)
export class PersonController {

  constructor(
    private readonly personService: PersonService,
  ) {}


  @Post()
  create(
    @Body() createPersonDto: CreatePersonDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.personService.create(
      createPersonDto,
      context,
    );

  }


  @Get()
  findAll(
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.personService.findAll(
      context,
    );

  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.personService.findOne(
      id,
      context,
    );

  }


  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.personService.update(
      id,
      updatePersonDto,
      context,
    );

  }


  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.personService.remove(
      id,
      context,
    );

  }

}
