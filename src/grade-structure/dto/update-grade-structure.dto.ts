import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsBooleanString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Double } from 'typeorm';

export class UpdateGradeStructureDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: Double })
  @IsOptional()
  @IsNumber()
  grade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isFinalize: boolean;
}
