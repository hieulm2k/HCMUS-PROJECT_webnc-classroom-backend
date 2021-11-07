import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  section: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  room: string;
}
