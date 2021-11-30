import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetGradeStructureParam {
  @ApiPropertyOptional()
  @IsOptional()
  edit?: boolean;
}
