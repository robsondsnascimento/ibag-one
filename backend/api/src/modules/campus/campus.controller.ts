import { Body, Controller, Get, Post } from '@nestjs/common';
import { CampusService } from './campus.service';

@Controller('campuses')
export class CampusController {

  constructor(
    private readonly campusService: CampusService,
  ) {}

  @Get()
  findAll() {
    return this.campusService.findAll();
  }

  @Post()
  create(
    @Body() data: {
      nome: string;
      cidade: string;
      estado: string;
    },
  ) {
    return this.campusService.create(data);
  }
}
