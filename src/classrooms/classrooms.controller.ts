import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { Classroom } from './classroom.entity';

@Controller('classrooms')
export class ClassroomsController {
  constructor(private classroomService: ClassroomsService) {}

  @Get()
  getClassrooms(): Promise<Classroom[]> {
    return this.classroomService.getClassrooms();
  }

  @Get('/:id')
  async getClassroomById(@Param('id') id: string): Promise<Classroom> {
    return this.classroomService.getClassroomById(id);
  }

  @Post()
  createClassroom(
    @Body() createClassroomDto: CreateClassroomDto,
  ): Promise<Classroom> {
    return this.classroomService.createClassroom(createClassroomDto);
  }

  @Delete('/:id')
  deleteClassroom(@Param('id') id: string): Promise<void> {
    return this.classroomService.deleteClassroom(id);
  }
}
