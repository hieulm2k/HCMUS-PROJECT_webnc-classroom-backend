import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateClassroomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  section: string;

  @ApiPropertyOptional()
  @IsOptional()
  subject: string;

  @ApiPropertyOptional()
  @IsOptional()
  room: string;
}
