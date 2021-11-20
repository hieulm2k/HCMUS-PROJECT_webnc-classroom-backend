import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { Classroom } from './classroom.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('classrooms')
@ApiTags('classrooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ClassroomsController {
  constructor(private classroomService: ClassroomsService) {}

  @Get()
  getClassrooms(@GetUser() user: User): Promise<object[]> {
    return this.classroomService.getClassrooms(user);
  }

  @Get('/:id')
  async getClassroomById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Classroom> {
    return this.classroomService.getClassroomById(id, user);
  }

  @Get('/:id/members')
  async getMembers(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classroomService.getMembers(id, user);
  }

  @Post()
  createClassroom(
    @Body() createClassroomDto: CreateClassroomDto,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classroomService.createClassroom(createClassroomDto, user);
  }

  @Delete('/:id')
  deleteClassroom(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.classroomService.deleteClassroom(id, user);
  }

  @Patch('/:id')
  updateClassroom(
    @Param('id') id: string,
    @Body() updateClassroomDto: CreateClassroomDto,
    @GetUser() user: User,
  ): Promise<Classroom> {
    return this.classroomService.updateClassroom(id, updateClassroomDto, user);
  }
}
