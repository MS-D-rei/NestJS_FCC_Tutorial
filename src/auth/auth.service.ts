import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  login() {
    return { message: 'Logged in' };
  }
  signup() {
    return { message: 'Created new account' };
  }
}
