import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '@/auth/decorator';
import { JwtGuard } from '@/auth/guard';
import { EditUserDto } from '@/user/dto';
import { UserService } from '@/user/user.service';

/* controller level UseGuard */
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /* GET: /users/me */
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetUser('sub') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
