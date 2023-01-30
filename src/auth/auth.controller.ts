import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LoginDto, SignupDto } from '@/auth/dto';
import { Tokens } from '@/auth/types';

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
  login(@Body() dto: LoginDto): Promise<Tokens> {
    return this.authService.login(dto);
  }

  /* POST: /auth/signup */
  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<Tokens> {
    return this.authService.signup(dto);
  }
}
