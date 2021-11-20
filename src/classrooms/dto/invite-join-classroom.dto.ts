import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/auth/enum/role.enum';

export class InviteJoinClassroomDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @ApiPropertyOptional()
  @IsEnum(Role)
  role?: Role;
}
