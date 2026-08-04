import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  check() {
    return {
      status: 'ok',
      service: 'IBAG One API',
      codename: 'Project Nehemiah',
      version: '0.1.0',
    };
  }
}
