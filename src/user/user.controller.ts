import { GetUser } from '@/auth/decorator';
import { JwtGuard } from '@/auth/guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

/* controller level UseGuard */
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  /* GET: /users/me */
  @Get('me')
  getMe(@GetUser() user: User, @GetUser('email') email: string) {
    console.log(email);
    return user;
  }
}
