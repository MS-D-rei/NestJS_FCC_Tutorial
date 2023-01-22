import { PrismaService } from '@/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthDto } from '@/auth/dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });
    return {
      access_token: token,
    };
  }

  async login(dto: AuthDto) {
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

    /* send the user */
    // delete user.password;
    return this.signToken(user.id, user.email);
  }

  async signup(dto: AuthDto) {
    /* generate password */
    const hash = await argon2.hash(dto.password);
    /* save the new user in DB */
    try {
      // don't forget to add await
      const user = await this.prismaService.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: dto.email,
          password: hash,
        },
      });
      /* return the saved user */
      // delete user.password;
      return this.signToken(user.id, user.email);
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
}
