import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
import { OrganizationContext } from '../../common/context/organization-context';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CellStudyService } from './cell-study.service';
import { CreateCellStudyDto } from './dto/create-cell-study.dto';

@Controller('cell-studies')
@UseGuards(JwtAuthGuard)
export class CellStudyController {
  constructor(private readonly service: CellStudyService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/studies' }))
  create(
    @Body() dto: CreateCellStudyDto,
    @UploadedFile() file: any,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.service.create(dto, file, context);
  }

  @Get()
  findForWeek(
    @Query('weekStart') weekStart: string | undefined,
    @CurrentOrganization() context: OrganizationContext,
  ) {
    return this.service.findForWeek(weekStart, context);
  }

  @Get('current')
  current(@CurrentOrganization() context: OrganizationContext) {
    return this.service.current(context);
  }

  @Get('current/download')
  async download(@CurrentOrganization() context: OrganizationContext, @Res() response: any) {
    const study = await this.service.current(context);
    return response.download(
      join(process.cwd(), 'uploads', 'studies', study.attachmentPath),
      study.attachmentName,
    );
  }
}
