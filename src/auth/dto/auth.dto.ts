import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  // IsStrongPasswordOptions = Pick<validator.StrongPasswordOptions, 'minLength' | 'minLowercase' | 'minUppercase' | 'minNumbers' | 'minSymbols'>;
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string;
}
