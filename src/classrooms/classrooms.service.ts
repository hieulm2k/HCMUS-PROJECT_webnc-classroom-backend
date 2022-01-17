import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
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
import { UpdateGradeOfGradeStructureDto } from 'src/grade/dto/update-grade.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/notification.entity';
import { ReportStatus } from 'src/grade/grade.entity';
import { CommentService } from 'src/comment/comment.service';
import { GetManyQuery } from 'src/user/dto/user.dto';
import { UserStatus } from 'src/user/user.entity';
import { paginate } from 'nestjs-typeorm-paginate';

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
    private notiService: NotificationService,
    private commentService: CommentService,
  ) {}

  async getClassrooms(user: User, query: GetManyQuery) {
    await this.preventBannedAccount(user);
    if (user.role === Role.ADMIN) {
      let q = this.classroomsRepository.createQueryBuilder('c');

      if (query.search) {
        q = q.andWhere('c.name ILIKE :search', { search: `%${query.search}%` });
      }

      q.orderBy('c.createdAt', 'ASC');

      if (String(query.shouldNotPaginate) === 'true') return q.getMany();

      return paginate(q, { limit: query.limit, page: query.page });
    }

    return this.joinClassroomService.getClassrooms(user);
  }

  async getMembers(id: string, user: User): Promise<object> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    const students = await this.joinClassroomService.getMembersByRole(
      classroom,
      Role.STUDENT,
    );

    const teachers = await this.joinClassroomService.getMembersByRole(
      classroom,
      Role.TEACHER,
    );

    return {
      students,
      teachers,
    };
  }

  async getOwners(id: string, user: User): Promise<User[]> {
    const classroom = await this.getClassroomById(id, user);
    const owners = await this.joinClassroomService.getMembersByRole(
      classroom,
      Role.OWNER,
    );
    return owners;
  }

  async getGradeStructures(
    id: string,
    user: User,
    param?: GetGradeStructureParam,
  ): Promise<GradeStructure[]> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);

    if (param) {
      const { edit } = param;

      if (String(edit) === 'true') {
        await this.preventStudent(classroom, user);
      }
    }

    return this.gradeStructureService.getGradeStructures(classroom);
  }

  async getGradeBoard(id: string, user: User): Promise<any[]> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    await this.preventStudent(classroom, user);

    return this.gradeService.getGradeBoard(classroom);
  }

  async getGradeOfStudentId(
    id: string,
    user: User,
    studentId: string,
  ): Promise<any> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);

    if (
      user.studentId !== studentId &&
      !(await this.joinClassroomService.checkTeacher(classroom, user))
    ) {
      throw new ForbiddenException('You do not have permission to do this!');
    }

    return this.gradeService.getGradeOfStudentId(classroom, studentId);
  }

  async getClassroomById(id: string, user: User): Promise<Classroom> {
    await this.preventBannedAccount(user);
    const found = await this.classroomsRepository.findOne({ id });

    if (!found) {
      throw new NotFoundException(`Classroom does not exist!`);
    } else {
      if (user.role === Role.ADMIN) return found;

      await this.joinClassroomService.getClassroomByUser(found, user);
      return found;
    }
  }

  async getClassroomByCode(code: string): Promise<Classroom> {
    const found = await this.classroomsRepository.findOne({ code: code });

    if (!found) {
      throw new NotFoundException(`Classroom does not exist!`);
    }

    return found;
  }

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
    user: User,
  ): Promise<Classroom> {
    await this.acceptRole(user, Role.USER);
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
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    await this.preventStudent(classroom, user);

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

    await this.gradeService.syncUserIdBetweenGradeAndJoinClassroom(classroom);
    return gradeStructure;
  }

  async createStudentList(
    id: string,
    user: User,
    createStudentListDtos: CreateStudentListDto[],
  ): Promise<void> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    await this.acceptOnlyOwner(classroom, user);

    const grades = await this.gradeService.getAllGrades(classroom.id);
    if (grades.length !== 0) {
      for (const grade of grades) {
        // delete all comments
        await this.commentService.deleteAllCommentOfGrade(grade);

        // delete all notifications
        await this.notiService.deleteAllNotiOfGrade(grade);
      }
      // Delete all grades
      await this.gradeService.removeAllGrades(grades);
    }

    // Update grade structure finalize false
    const gradeStructures = classroom.gradeStructures;
    for (const gradeStructure of gradeStructures) {
      gradeStructure.isFinalize = false;
    }
    await this.gradeStructureService.saveAllGradeStructures(gradeStructures);

    createStudentListDtos = await this.gradeService.deleteDuplicateStudent(
      createStudentListDtos,
    );

    await this.gradeService.createStudentList(createStudentListDtos, classroom);
  }

  async joinClassroomByCode(
    id: string,
    user: User,
    inviteJoinClassroomDto: InviteJoinClassroomDto,
  ): Promise<void> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.classroomsRepository.findOne({ id });

    if (!classroom) {
      throw new NotFoundException(`Classroom does not exist!`);
    }

    try {
      await this.getClassroomById(id, user);
    } catch (error) {
      // If not found -> user not join to this class
      const { code, role } = inviteJoinClassroomDto;

      if (code !== classroom.code) {
        throw new NotAcceptableException(`Code "${code}" is not accepted!`);
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
      'You have already joined this class',
    );
  }

  async joinClassroomByEmail(
    id: string,
    user: User,
    inviteJoinClassroomByEmailDto: InviteJoinClassroomByEmailDto,
  ): Promise<void> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.classroomsRepository.findOne(id);

    if (!classroom) {
      throw new NotFoundException(`Classroom does not exist!`);
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
      `This user with email "${email}" have already joined this class`,
    );
  }

  async updateClassroom(
    id: string,
    updateClassroomDto: UpdateClassroomDto,
    user: User,
  ): Promise<Classroom> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    await this.acceptOnlyOwner(classroom, user);

    return this.classroomsRepository.save({
      ...classroom,
      ...updateClassroomDto,
    });
  }

  async updateGradeStructure(
    id: string,
    gradeId: string,
    user: User,
    updateGradeStructure: UpdateGradeStructureDto,
  ): Promise<GradeStructure> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    await this.preventStudent(classroom, user);
    const gradeStructure =
      await this.gradeStructureService.updateGradeStructure(
        gradeId,
        classroom,
        updateGradeStructure,
      );

    if (updateGradeStructure.isFinalize) {
      const grades = gradeStructure.grades;
      let students;
      for (const grade of grades) {
        students = [];
        try {
          students.push(
            await this.userService.getUserByStudentId(grade.studentId),
          );
          await this.notiService.addNotification(
            user,
            students,
            grade,
            NotificationType.FINALIZE_GRADE,
          );
        } catch (error) {}
      }
    }

    return gradeStructure;
  }

  async updateGradeOfGradeStructure(
    id: string,
    structureName: string,
    user: User,
    dtos: UpdateGradeOfGradeStructureDto[],
  ): Promise<void> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    await this.preventStudent(classroom, user);

    dtos = await this.gradeService.deleteDuplicateStudent(dtos);

    await this.gradeService.updateGradeOfGradeStructure(
      classroom,
      structureName,
      dtos,
    );

    if (dtos.length === 1) {
      const dto = dtos[0];
      if (dto.isFinalize) {
        const students = [];
        const grades = [];
        try {
          const gradeStructure =
            await this.gradeStructureService.getGradeStructureByName(
              structureName,
              classroom,
            );

          const grade =
            await this.gradeService.findOneByStudentIdAndClassroomIdAndGradeStructure(
              dto.studentId,
              classroom.id,
              gradeStructure,
            );

          if (grade.reportStatus === ReportStatus.OPEN) {
            grade.reportStatus = ReportStatus.CLOSED;
            grades.push(grade);
            await this.gradeService.saveAllGrades(grades);
          }

          students.push(
            await this.userService.getUserByStudentId(dto.studentId),
          );

          await this.notiService.addNotification(
            user,
            students,
            grade,
            NotificationType.FINALIZE_GRADE,
          );
        } catch (error) {}
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
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    await this.acceptOnlyOwner(classroom, user);
    await this.joinClassroomService.deleteAllJoinClassroomsOfClassroom(
      classroom,
    );
    const grades = await this.gradeService.getAllGrades(classroom.id);

    for (const grade of grades) {
      // delete all comments
      await this.commentService.deleteAllCommentOfGrade(grade);

      // delete all notifications
      await this.notiService.deleteAllNotiOfGrade(grade);
    }

    await this.gradeService.removeAllGrades(grades);
    await this.gradeStructureService.deleteAllGradeStructuresOfClassroom(
      classroom,
    );

    const result = await this.classroomsRepository.delete(classroom.id);

    if (result.affected === 0) {
      throw new NotFoundException(`Classroom does not exist!`);
    }
  }

  async deleteGradeStructure(
    id: string,
    gradeId: string,
    user: User,
  ): Promise<void> {
    await this.acceptRole(user, Role.USER);
    const classroom = await this.getClassroomById(id, user);
    await this.preventStudent(classroom, user);
    const gradeStructure =
      await this.gradeStructureService.getGradeStructureById(
        gradeId,
        classroom,
      );

    const grades = gradeStructure.grades;

    for (const grade of grades) {
      // delete all comments
      await this.commentService.deleteAllCommentOfGrade(grade);

      // delete all notifications
      await this.notiService.deleteAllNotiOfGrade(grade);
    }

    await this.gradeService.deleteAllGradesOfGradeStructure(gradeStructure);

    await this.gradeStructureService.deleteGradeStructure(gradeId);
    await this.updateOrderInGradeStructureList(id, user);
  }

  async preventStudent(classroom: Classroom, user: User): Promise<void> {
    const students = await this.joinClassroomService.getMembersByRole(
      classroom,
      Role.STUDENT,
    );

    students.forEach((element) => {
      if (element.id === user.id) {
        throw new ForbiddenException('You do not have permission to do this!');
      }
    });
  }

  async preventBannedAccount(user: User): Promise<void> {
    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Your account banned by Admin');
    }
  }

  async acceptOnlyOwner(classroom: Classroom, user: User): Promise<void> {
    const owners = await this.joinClassroomService.getMembersByRole(
      classroom,
      Role.OWNER,
    );

    let isOwner = false;

    owners.forEach((owner) => {
      if (owner.id === user.id) {
        isOwner = true;
        return;
      }
    });

    if (!isOwner) {
      throw new ForbiddenException('You do not have permission to do this!');
    }
  }

  async acceptRole(user: User, role: Role): Promise<void> {
    if (user.role !== role) {
      throw new ForbiddenException('You do not have permission to do this');
    }
  }
}
