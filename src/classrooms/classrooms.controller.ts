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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOkResponse({ type: [Classroom] })
  getClassrooms(@GetUser() user: User): Promise<Classroom[]> {
    return this.classroomService.getClassrooms(user);
  }

  // @Get('/:id')
  // @ApiOkResponse({ type: Classroom })
  // async getClassroomById(
  //   @Param('id') id: string,
  //   @GetUser() user: User,
  // ): Promise<Classroom> {
  //   return this.classroomService.getClassroomById(id, user);
  // }

  @Post()
  @ApiCreatedResponse({ type: Classroom })
  createClassroom(
    @Body() createClassroomDto: CreateClassroomDto,
    @GetUser() user: User,
  ): Promise<Classroom> {
    return this.classroomService.createClassroom(createClassroomDto, user);
  }

  // @Delete('/:id')
  // @ApiOkResponse({ type: Classroom })
  // deleteClassroom(
  //   @Param('id') id: string,
  //   @GetUser() user: User,
  // ): Promise<void> {
  //   return this.classroomService.deleteClassroom(id, user);
  // }

  // @Patch('/:id')
  // @ApiCreatedResponse({ type: Classroom })
  // updateClassroom(
  //   @Param('id') id: string,
  //   @Body() updateClassroomDto: CreateClassroomDto,
  //   @GetUser() user: User,
  // ): Promise<Classroom> {
  //   return this.classroomService.updateClassroom(id, updateClassroomDto, user);
  // }
}
