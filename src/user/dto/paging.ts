import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class Paginate {
  @ApiPropertyOptional({ type: () => Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  shouldNotPaginate?: boolean;

  @ApiPropertyOptional({ type: Number, default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  page = 1;

  @ApiPropertyOptional({ type: Number, default: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  limit = 10;
}
