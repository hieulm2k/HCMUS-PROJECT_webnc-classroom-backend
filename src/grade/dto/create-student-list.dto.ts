import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStudentListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
