import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import {
  AccessTokenStrategy,
  JwtStrategy,
  RefreshTokenStrategy,
} from '@/auth/strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
})
export class AuthModule {}
