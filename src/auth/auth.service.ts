import { PrismaService } from '@/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginDto, SignupDto } from '@/auth/dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from '@/auth/types';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /* this is for access token only auth */
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '60m',
      secret: this.configService.get('JWT_SECRET'),
    });
    return {
      access_token: token,
    };
  }

  /* for access token and refresh token combination */
  async getTokens(userId: number, email: string): Promise<Tokens> {
    const payload = {
      sub: userId,
      email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: this.configService.get('JWT_SECRET_ACCESS'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: 60 * 60 * 24 * 7, // 1 week
        secret: this.configService.get('JWT_SECRET_REFRESH'),
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateRefreshTokenToUser(userId: number, refreshToken: string) {
    const hash = await argon2.hash(refreshToken);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refresh_token: hash,
      },
    });
  }

  async login(dto: LoginDto): Promise<Tokens> {
    /* find user by email */
    /* if not exist, throw exception */
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('Credential incorrect');

    /* compare password */
    /* if incorrect, throw exception */
    const pwMatches = await argon2.verify(user.password, dto.password);
    if (!pwMatches) throw new ForbiddenException('Credential incorrect');

    /* this is for access token only auth */
    // return this.signToken(user.id, user.email);

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenToUser(user.id, tokens.refresh_token);
    return tokens;
  }

  async signup(dto: SignupDto) {
    /* generate password */
    const hash = await argon2.hash(dto.password);
    /* save the new user in DB */
    try {
      // don't forget to add await
      const newUser = await this.prismaService.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: hash,
        },
      });

      /* this is for access token only auth */
      // return this.signToken(user.id, user.email);

      const tokens = await this.getTokens(newUser.id, newUser.email);
      await this.updateRefreshTokenToUser(newUser.id, tokens.refresh_token);
      return tokens;
    } catch (err) {
      /* error handling */
      // https://www.prisma.io/docs/concepts/components/prisma-client/handling-exceptions-and-errors
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credetials taken');
        }
      }
      throw err;
    }
  }

  async logout(userId: number) {
    /* Filter conditions and operators */
    /* https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#filter-conditions-and-operators */
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        refresh_token: {
          not: null,
        },
      },
      data: {
        refresh_token: null,
      },
    });
  }
}
