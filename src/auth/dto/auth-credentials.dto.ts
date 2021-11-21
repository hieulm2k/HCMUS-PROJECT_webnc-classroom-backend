import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @ApiProperty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  password: string;

  @IsString()
  @ApiProperty()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}

export class SignInDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiProperty()
  password?: string;
}
