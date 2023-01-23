import { GetUser } from '@/auth/decorator';
import { JwtGuard } from '@/auth/guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  /* GET: /users/me */
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }
}
