import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login() {
    console.log('login');
  }
  signup() {
    console.log('signup');
  }
}
