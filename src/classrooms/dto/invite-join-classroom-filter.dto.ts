import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetClassroomsFilterDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  code?: string;
}
