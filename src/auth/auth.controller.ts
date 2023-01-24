import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from '@/auth/dto';

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
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  /* POST: /auth/signup */
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }
}
