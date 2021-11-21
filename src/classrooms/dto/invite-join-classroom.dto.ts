import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { Role } from 'src/auth/enum/role.enum';

export class InviteJoinClassroomDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsEnum(Role)
  role: Role;
}

export class InviteJoinClassroomByEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsEnum(Role)
  role: Role;
}
