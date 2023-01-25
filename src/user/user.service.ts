import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { EditUserDto } from '@/user/dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });
    delete user.password;
    return user;
  }
}
