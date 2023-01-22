import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthDto } from '@/auth/dto';

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
    const user = this.prismaService.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: dto.email,
        password: hash,
      },
    });
    /* return the saved user */
    return user;
  }
}
