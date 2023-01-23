import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Official Docs
// https://docs.nestjs.com/security/authentication#implementing-passport-jwt

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // this is set by default
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  /* The validate method of your JwtStrategy will only be called
     when the token has been verified in terms of the encryption (corrrect key was used to sign it, in your case secretKey)
     and it is not expired. Only after those two things have been checked, validate is called with the payload. With it,
     you can then e.g. check if the user still exists. So the three steps are:
        1. Token was signed with your secret key
        2. Token is not expired
        3. Custom payload validation
     You can use the jwt debugger to manually check steps 1 and 2 for your token.
  */

  // https://docs.nestjs.com/security/authentication#jwt-functionality
  /* The validate() method deserves some discussion. For the jwt-strategy,
     Passport first verifies the JWT's signature and decodes the JSON.
     It then invokes our validate() method passing the decoded JSON as its single parameter.
     Based on the way JWT signing works, we're guaranteed that we're receiving a valid token that we have previously signed and issued to a valid user.
     As a result of all this, our response to the validate() callback is trivial: we simply return an object containing the userId and username properties.
     Recall again that Passport will build a user object based on the return value of our validate() method, and attach it as a property on the Request object.
  */

  /* ex. payload: { sub: 1, email: 'test@gmail.com', iat: 1674471551, exp: 1674472451 } 
     in user.controller, @Req req: Request, console.log(req.user)
     => { sub: 1, email: 'test@gmail.com', iat: 1674471551, exp: 1674472451 }
  */
  async validate(payload: { sub: number; email: string }) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.password;
    return user;
  }
}
