import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Double } from 'typeorm';

export class UpdateGradeOfGradeStructureDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ type: Double })
  @IsNotEmpty()
  @IsNumber()
  grade: number;
}
