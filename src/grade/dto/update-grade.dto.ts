import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Double } from 'typeorm';

export class UpdateGradeOfGradeStructureDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiPropertyOptional({ type: Double })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  grade: number;
}
