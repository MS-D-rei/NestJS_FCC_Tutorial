import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LoginDto, SignupDto } from '@/auth/dto';
import { IJwtPayloadWithRefreshToken, Tokens } from '@/auth/types';
import { GetUser, Public } from '@/auth/decorator';
import { JwtRefreshTokenGuard } from '@/auth/guard';

@Controller('auth')
export class AuthController {
  /* code the below is equivalent to ( private authService )
  authService: AuthService;
  constructor(authservice) {
    this.authService = authService;
  }
  */
  constructor(private authService: AuthService) {}

  /* POST: /auth/login */
  /* we don't use login(@Req req: Request) because of compatibility with Fastify */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<Tokens> {
    return this.authService.login(dto);
  }

  /* POST: /auth/signup */
  @Public()
  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }

  /* POST: /auth/logout */
  // @UseGuards(JwtAccessTokenGuard) // this is set as global in main.ts
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('sub') userId: number) {
    return this.authService.logout(userId);
  }

  /* POST: /auth/refresh */
  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@GetUser() user: IJwtPayloadWithRefreshToken) {
    return this.authService.refresh(user.sub, user.refresh_token);
  }
}
