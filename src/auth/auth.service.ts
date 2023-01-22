import { PrismaService } from '@/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthDto } from '@/auth/dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  login() {
    return { message: 'Logged in' };
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
      return user;
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
