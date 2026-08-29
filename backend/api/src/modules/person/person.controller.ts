import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PersonService } from './person.service';

import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { UpdatePersonMinisterialTitlesDto } from './dto/update-person-ministerial-titles.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  CurrentOrganization,
} from '../../common/decorators/current-organization.decorator';

import {
  OrganizationContext,
} from '../../common/context/organization-context';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { profilePhotoMaxBytes, profilePhotosDirectory } from './profile-photo.storage';


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
    @Query() pagination: PaginationQueryDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {

    return this.personService.findAll(
      context,
      pagination,
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

  @Get(':id/profile-photo')
  async profilePhoto(
    @Param('id') id: string,
    @CurrentOrganization() context: OrganizationContext,
    @Res() response: any,
  ) {
    const photo = await this.personService.getProfilePhoto(id, context);
    response.setHeader('Cache-Control', 'private, max-age=3600');
    return response.type(photo.mimeType).sendFile(photo.path, { root: profilePhotosDirectory });
  }

  @Patch(':id/ministerial-titles')
  updateMinisterialTitles(
    @Param('id') id: string,
    @Body() dto: UpdatePersonMinisterialTitlesDto,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.personService.updateMinisterialTitles(id, dto, context);
  }

  @Post(':id/profile-photo')
  @UseInterceptors(FileInterceptor('file', {
    dest: profilePhotosDirectory,
    limits: { fileSize: profilePhotoMaxBytes },
  }))
  updateProfilePhoto(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.personService.updateProfilePhoto(id, file, context);
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
