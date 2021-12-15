import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { ClassroomsRepository } from './classroom.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './classroom.entity';
import { User } from 'src/user/user.entity';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/auth/enum/role.enum';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';
import {
  InviteJoinClassroomByEmailDto,
  InviteJoinClassroomDto,
} from './dto/invite-join-classroom.dto';
import { MailService } from 'src/mail/mail.service';
import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { CreateGradeStructureDto } from 'src/grade-structure/dto/create-grade-structure.dto';
import { GradeStructureService } from 'src/grade-structure/grade-structure.service';
import { UpdateGradeStructureDto } from 'src/grade-structure/dto/update-grade-structure.dto';
import { GetGradeStructureParam } from 'src/grade-structure/dto/get-grade-structure.dto';
import { CreateStudentListDto } from 'src/grade/dto/create-student-list.dto';
import { GradeService } from 'src/grade/grade.service';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(ClassroomsRepository)
    private classroomsRepository: ClassroomsRepository,
    private joinClassroomService: JoinClassroomService,
    private userService: UserService,
    private mailService: MailService,
    private gradeStructureService: GradeStructureService,
    private gradeService: GradeService,
  ) {}

  async getClassrooms(user: User): Promise<object[]> {
    return this.joinClassroomService.getClassrooms(user);
  }

  async getMembers(id: string, user: User): Promise<object> {
    const students = await this.getStudents(id, user);
    const teachers = await this.getTeachers(id, user);
    return {
      students,
      teachers,
    };
  }

  async getStudents(id: string, user: User): Promise<User[]> {
    const classroom = await this.getClassroomById(id, user);
    const students = await this.joinClassroomService.getMembersByRole(
      classroom,
      Role.STUDENT,
    );
    return students;
  }

  async getTeachers(id: string, user: User): Promise<User[]> {
    const classroom = await this.getClassroomById(id, user);
    const teachers = await this.joinClassroomService.getMembersByRole(
      classroom,
      Role.TEACHER,
    );
    return teachers;
  }

  async getGradeStructures(
    id: string,
    user: User,
    param?: GetGradeStructureParam,
  ): Promise<GradeStructure[]> {
    if (param) {
      const { edit } = param;

      if (String(edit) === 'true') {
        await this.preventStudent(id, user);
      }
    }

    const classroom = await this.getClassroomById(id, user);
    return this.gradeStructureService.getGradeStructures(classroom);
  }

  async getClassroomById(id: string, user: User): Promise<Classroom> {
    const found = await this.classroomsRepository.findOne({ id });

    if (!found) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    } else {
      await this.joinClassroomService.getClassroomByUser(found, user);
      return found;
    }
  }

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
    user: User,
  ): Promise<Classroom> {
    const joinClassroom = await this.joinClassroomService.createJoinClassroom([
      Role.OWNER,
      Role.TEACHER,
    ]);
    await this.userService.updateJoinClassroom(user, joinClassroom);
    const classroom = await this.classroomsRepository.createClassroom(
      createClassroomDto,
    );
    await this.updateJoinClassrooms(classroom, joinClassroom);
    return classroom;
  }

  async createGradeStructure(
    id: string,
    user: User,
    createGradeStructureDto: CreateGradeStructureDto,
  ): Promise<GradeStructure> {
    await this.preventStudent(id, user);
    const classroom = await this.getClassroomById(id, user);
    const gradeStructure =
      await this.gradeStructureService.createGradeStructure(
        classroom,
        createGradeStructureDto,
      );

    await this.gradeService.createGradeWithNewGradeStructure(
      id,
      gradeStructure,
    );

    await this.updateGradeStructuresOfClassroom(classroom, gradeStructure);
    return gradeStructure;
  }

  async createStudentList(
    id: string,
    user: User,
    createStudentListDtos: CreateStudentListDto[],
  ): Promise<GradeStructure> {
    await this.preventStudent(id, user);

    const classroom = await this.getClassroomById(id, user);

    if (classroom.gradeStructures.length === 0) {
      throw new BadRequestException('Please create grade structure first');
    }

    const grades = await this.gradeService.getAllGrades(classroom.id);

    if (grades.length !== 0) {
      // Delete all grades
      await this.gradeService.removeAllGrades(classroom.id);
    }

    createStudentListDtos = await this.gradeService.deleteDuplicateStudent(
      createStudentListDtos,
    );

    await this.gradeService.createStudentList(
      createStudentListDtos,
      classroom.gradeStructures,
    );

    return null;
  }

  async joinClassroomByCode(
    id: string,
    user: User,
    inviteJoinClassroomDto: InviteJoinClassroomDto,
  ): Promise<void> {
    const classroom = await this.classroomsRepository.findOne({ id });

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    }

    try {
      await this.getClassroomById(id, user);
    } catch (error) {
      // If not found -> user not join to this class
      const { code, role } = inviteJoinClassroomDto;

      if (code !== classroom.code) {
        throw new NotAcceptableException(
          `Code "${code}" not accept by classroom with id "${id}"!`,
        );
      }

      if (role === Role.OWNER) {
        throw new BadRequestException(`You cannot be the owner of this class!`);
      }

      const joinClassroom = await this.joinClassroomService.createJoinClassroom(
        [role],
      );

      await this.updateJoinClassrooms(classroom, joinClassroom);
      await this.userService.updateJoinClassroom(user, joinClassroom);
      return;
    }

    // if found a classroom that user joined -> throw exception

    throw new InternalServerErrorException(
      'You are already join in this class',
    );
  }

  async joinClassroomByEmail(
    id: string,
    user: User,
    inviteJoinClassroomByEmailDto: InviteJoinClassroomByEmailDto,
  ): Promise<void> {
    const classroom = await this.classroomsRepository.findOne(id);

    if (!classroom) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    }

    const { email, role } = inviteJoinClassroomByEmailDto;

    try {
      const targetUser = await this.userService.getByEmail(email);
      await this.getClassroomById(id, targetUser);
    } catch (error) {
      // If not found -> user not join to this class
      if (role === Role.OWNER) {
        throw new BadRequestException(`You cannot be the owner of this class!`);
      }

      return this.mailService.sendInviteJoinClassroom(
        user.name,
        email,
        role,
        classroom,
      );
    }

    // if found a classroom that user joined -> throw exception
    throw new InternalServerErrorException(
      `This user with email "${email}" is already join in this class`,
    );
  }

  async preventStudent(id: string, user: User): Promise<void> {
    const students = await this.getStudents(id, user);
    students.forEach((element) => {
      if (element.id === user.id) {
        throw new ForbiddenException('You do not have permission to do this!');
      }
    });
  }

  async updateClassroom(
    id: string,
    updateClassroomDto: UpdateClassroomDto,
    user: User,
  ): Promise<Classroom> {
    const classroom = await this.getClassroomById(id, user);
    return await this.classroomsRepository.save({
      ...classroom,
      ...updateClassroomDto,
    });
  }

  async updateGradeStructure(
    id: string,
    gradeId: string,
    user: User,
    updateGradeStructure: CreateGradeStructureDto,
  ): Promise<GradeStructure> {
    const classroom = await this.getClassroomById(id, user);
    return this.gradeStructureService.updateGradeStructure(
      gradeId,
      classroom,
      updateGradeStructure,
    );
  }

  async updateOrderOfGradeStructure(
    id: string,
    gradeId: string,
    user: User,
    updateGradeStructure: UpdateGradeStructureDto,
  ): Promise<GradeStructure> {
    const { order } = updateGradeStructure;
    const classroom = await this.getClassroomById(id, user);
    const gradeStructure =
      await this.gradeStructureService.getGradeStructureById(
        gradeId,
        classroom,
      );

    await this.handleBeforeChangeOrderGradeStructure(
      id,
      user,
      gradeStructure.order,
      order,
    );

    return this.gradeStructureService.updateOrderOfGradeStructure(
      gradeId,
      classroom,
      order,
    );
  }

  async handleBeforeChangeOrderGradeStructure(
    id: string,
    user: User,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    const gradeStructures = await this.getGradeStructures(id, user);

    if (newOrder > gradeStructures.length) {
      throw new BadRequestException(`New order "${newOrder}" is out of range`);
    }

    if (newOrder < oldOrder) {
      for (let i = newOrder - 1; i < oldOrder - 1; ++i) {
        gradeStructures[i].order++;
        await this.gradeStructureService.saveGradeStructure(gradeStructures[i]);
      }
    } else if (newOrder > oldOrder) {
      for (let i = oldOrder; i < newOrder; ++i) {
        gradeStructures[i].order--;
        await this.gradeStructureService.saveGradeStructure(gradeStructures[i]);
      }
    }
  }

  async updateJoinClassrooms(
    classroom: Classroom,
    joinClassroom: JoinClassroom,
  ): Promise<void> {
    if (classroom.joinClassrooms === undefined) {
      classroom.joinClassrooms = [joinClassroom];
    } else {
      classroom.joinClassrooms = [...classroom.joinClassrooms, joinClassroom];
    }

    await this.classroomsRepository.save(classroom);
    return;
  }

  async updateGradeStructuresOfClassroom(
    classroom: Classroom,
    gradeStructure: GradeStructure,
  ): Promise<void> {
    if (classroom.gradeStructures === undefined) {
      classroom.gradeStructures = [gradeStructure];
    } else {
      classroom.gradeStructures = [
        ...classroom.gradeStructures,
        gradeStructure,
      ];
    }

    await this.classroomsRepository.save(classroom);
    return;
  }

  async updateOrderInGradeStructureList(id: string, user: User): Promise<void> {
    const gradeStructures = await this.getGradeStructures(id, user);
    for (let i = 0; i < gradeStructures.length; ++i) {
      gradeStructures[i].order = i + 1;
      await this.gradeStructureService.saveGradeStructure(gradeStructures[i]);
    }
  }

  async deleteClassroom(id: string, user: User): Promise<void> {
    const classroom = await this.getClassroomById(id, user);
    await this.joinClassroomService.deleteJoinClassroom(classroom);

    const result = await this.classroomsRepository.delete(classroom.id);

    if (result.affected === 0) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    }
  }

  async deleteGradeStructure(
    id: string,
    gradeId: string,
    user: User,
  ): Promise<void> {
    const classroom = await this.getClassroomById(id, user);
    const gradeStructure =
      await this.gradeStructureService.getGradeStructureById(
        gradeId,
        classroom,
      );

    gradeStructure.grades = [];
    await this.gradeStructureService.saveGradeStructure(gradeStructure);

    await this.gradeStructureService.deleteGradeStructure(gradeId);
    await this.updateOrderInGradeStructureList(id, user);
  }
}
