import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {

  constructor(
    configService: ConfigService,
  ) {

   super({
  jwtFromRequest:
    ExtractJwt.fromAuthHeaderAsBearerToken(),

  ignoreExpiration: false,

  secretOrKey:
    configService.get<string>(
      'JWT_SECRET',
    ) ?? 'ibag-one-dev-secret-2026',
});

  }


  validate(payload: any) {

    return {
      userId: payload.sub,
      personId: payload.personId,
      organizationId:
        payload.organizationId,
    };

  }

}
