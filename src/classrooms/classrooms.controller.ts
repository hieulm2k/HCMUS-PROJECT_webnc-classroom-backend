import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { Classroom } from './classroom.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import {
  InviteJoinClassroomByEmailDto,
  InviteJoinClassroomDto,
} from './dto/invite-join-classroom.dto';
import { Role } from 'src/auth/enum/role.enum';
import { CreateGradeStructureDto } from 'src/grade-structure/dto/create-grade-structure.dto';
import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { UpdateGradeStructureDto } from 'src/grade-structure/dto/update-grade-structure.dto';
import { GetGradeStructureParam } from 'src/grade-structure/dto/get-grade-structure.dto';
import { CreateStudentListDto } from 'src/grade/dto/create-student-list.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';
import { UpdateGradeOfGradeStructureDto } from 'src/grade/dto/update-grade.dto';

@Controller('classrooms')
@ApiTags('classrooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ClassroomsController {
  constructor(
    private classroomService: ClassroomsService,
    private joinClassroomService: JoinClassroomService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'to get all classrooms of current user' })
  getClassrooms(@GetUser() user: User): Promise<object[]> {
    return this.classroomService.getClassrooms(user);
  }

  @Post()
  @ApiOperation({ summary: 'to create a new classroom' })
  createClassroom(
    @Body() createClassroomDto: CreateClassroomDto,
    @GetUser() user: User,
  ): Promise<Classroom> {
    return this.classroomService.createClassroom(createClassroomDto, user);
  }

  @Get('join')
  @ApiOperation({ summary: 'to join a classroom by code' })
  @ApiQuery({ name: 'role', enum: Role })
  @ApiQuery({ name: 'code', type: String })
  async joinClassroomByCode(
    @GetUser() user: User,
    @Query() inviteJoinClassroomDto: InviteJoinClassroomDto,
  ): Promise<void> {
    const classroom = await this.classroomService.getClassroomByCode(
      inviteJoinClassroomDto.code,
    );

    return this.classroomService.joinClassroomByCode(
      classroom.id,
      user,
      inviteJoinClassroomDto,
    );
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'to get a classroom of current user by classroom ID',
  })
  async getClassroomById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<object> {
    const classroom = await this.classroomService.getClassroomById(id, user);
    const teachers = await this.joinClassroomService.getMembersByRole(
      classroom,
      Role.TEACHER,
    );

    return {
      classroom,
      teachers: teachers,
    };
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'to update a classroom that owned by current user' })
  updateClassroom(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
    @GetUser() user: User,
  ): Promise<Classroom> {
    return this.classroomService.updateClassroom(id, updateClassroomDto, user);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'to delete a classroom that owned by current user' })
  deleteClassroom(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.classroomService.deleteClassroom(id, user);
  }

  @Get('/:id/members')
  @ApiOperation({
    summary: 'to get all members of classroom of current user by classroom ID',
  })
  async getMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<object> {
    return this.classroomService.getMembers(id, user);
  }

  @Get('/:id/join')
  @ApiOperation({ summary: 'to join a classroom by code with link' })
  @ApiQuery({ name: 'role', enum: Role })
  @ApiQuery({ name: 'code', type: String })
  async joinClassroomByCodeWithLink(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Query() inviteJoinClassroomDto: InviteJoinClassroomDto,
  ): Promise<void> {
    return this.classroomService.joinClassroomByCode(
      id,
      user,
      inviteJoinClassroomDto,
    );
  }

  @Get('/:id/joinByEmail')
  @ApiOperation({ summary: 'to join a classroom by email' })
  @ApiQuery({ name: 'role', enum: Role })
  @ApiQuery({ name: 'email', type: String })
  async joinClassroomByEmail(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Query() inviteJoinClassroomByEmailDto: InviteJoinClassroomByEmailDto,
  ): Promise<void> {
    return this.classroomService.joinClassroomByEmail(
      id,
      user,
      inviteJoinClassroomByEmailDto,
    );
  }

  @Get('/:id/grade-structures')
  @ApiOperation({
    summary:
      'to get grade structure of classroom of current user by classroom ID',
  })
  async getGradeStructures(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Query() param?: GetGradeStructureParam,
  ): Promise<GradeStructure[]> {
    return this.classroomService.getGradeStructures(id, user, param);
  }

  @Get('/:id/grade-board')
  @ApiOperation({
    summary: 'to get grade board of classroom of current user by classroom ID',
  })
  async getGradeBoard(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<any[]> {
    return this.classroomService.getGradeBoard(id, user);
  }

  @Post('/:id/grade-structures')
  @ApiOperation({
    summary:
      'to create a new grade structure of classroom that owned by current user by classroom ID',
  })
  async createGradeStructure(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Body() createGradeStructureDto: CreateGradeStructureDto,
  ): Promise<GradeStructure> {
    return this.classroomService.createGradeStructure(
      id,
      user,
      createGradeStructureDto,
    );
  }

  @Post('/:id/student-list')
  @ApiOperation({
    summary:
      'to create a new student list of classroom that owned by current user by classroom ID',
  })
  async createStudentList(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Body(new ParseArrayPipe({ items: CreateStudentListDto }))
    createStudentListDtos: CreateStudentListDto[],
  ): Promise<void> {
    return this.classroomService.createStudentList(
      id,
      user,
      createStudentListDtos,
    );
  }

  @Get('/:id/grade-board/:studentId')
  @ApiOperation({
    summary: 'to get grade board of classroom of current user by classroom ID',
  })
  async getGradeBoardOfStudentId(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId') studentId: string,
    @GetUser() user: User,
  ): Promise<any> {
    return this.classroomService.getGradeOfStudentId(id, user, studentId);
  }

  @Patch('/:id/grade-structures/:structureId')
  @ApiOperation({
    summary:
      'to update a structure of classroom that owned by current user by classroom ID and structure ID',
  })
  async updateGradeStructureById(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('structureId') structureId: string,
    @GetUser() user: User,
    @Body() updateGradeStructure: UpdateGradeStructureDto,
  ): Promise<GradeStructure> {
    return this.classroomService.updateGradeStructure(
      id,
      structureId,
      user,
      updateGradeStructure,
    );
  }

  @Patch('/:id/grade-structures/:structureName')
  @ApiOperation({
    summary:
      'to update a structure of classroom that owned by current user by classroom ID and structure name',
  })
  async updateGradeStructureByName(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('structureName') structureName: string,
    @GetUser() user: User,
    @Body() updateGradeStructure: UpdateGradeStructureDto,
  ): Promise<GradeStructure> {
    return this.classroomService.updateGradeStructure(
      id,
      structureName,
      user,
      updateGradeStructure,
    );
  }

  @Patch('/:id/grades/:structureName')
  @ApiOperation({
    summary:
      'to update grades of grade structure of classroom that owned by current user by classroom ID and grade structure name',
  })
  async updateGradeOfGradeStructure(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('structureName') structureName: string,
    @GetUser() user: User,
    @Body(new ParseArrayPipe({ items: UpdateGradeOfGradeStructureDto }))
    dtos: UpdateGradeOfGradeStructureDto[],
  ): Promise<void> {
    return this.classroomService.updateGradeOfGradeStructure(
      id,
      structureName,
      user,
      dtos,
    );
  }

  @Delete('/:id/grade-structures/:structureId')
  @ApiOperation({
    summary:
      'to delete a structure of classroom that owned by current user by classroom ID and structure ID',
  })
  async deleteGradeStructure(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('structureId', ParseUUIDPipe) structureId: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.classroomService.deleteGradeStructure(id, structureId, user);
  }
}
