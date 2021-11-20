import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class InviteJoinClassroomDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  code?: string;
}
