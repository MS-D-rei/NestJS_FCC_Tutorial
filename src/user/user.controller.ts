import { JwtGuard } from '@/auth/guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

@Controller('users')
export class UserController {
  /* GET: /users/me */
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }
}
