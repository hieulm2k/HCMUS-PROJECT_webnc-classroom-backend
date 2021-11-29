import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Double } from 'typeorm';

export class CreateGradeStructureDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Double })
  @IsNotEmpty()
  grade: number;
}
