import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login() {
    return { message: 'Logged in' };
  }
  signup() {
    return { message: 'Created new account' };
  }
}
