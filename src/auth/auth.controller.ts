import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
  @Post('login')
  login() {
    return 'logged in';
  }

  /* POST: /auth/signup */
  @Post('signup')
  signup() {
    return 'Created new account';
  }
}
