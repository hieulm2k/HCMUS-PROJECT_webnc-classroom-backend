import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Double } from 'typeorm';

export class UpdateGradeOfGradeStructureDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiPropertyOptional({ type: Double })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  grade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  isFinalize: boolean;
}

export class RequestReviewDto {
  @ApiProperty({ type: Double })
  @IsNotEmpty()
  @IsNumber()
  expectedGrade: number;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  message: string;
}
