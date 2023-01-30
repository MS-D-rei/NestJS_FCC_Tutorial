import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from '@/auth/types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_REFRESH'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: IJwtPayload) {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();
    return {
      ...payload,
      refreshToken,
    };
  }
}
