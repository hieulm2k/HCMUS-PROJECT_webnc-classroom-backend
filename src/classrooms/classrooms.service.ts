import {
  BadRequestException,
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

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(ClassroomsRepository)
    private classroomsRepository: ClassroomsRepository,
    private joinClassroomService: JoinClassroomService,
    private userService: UserService,
    private mailService: MailService,
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

      await this.updateJoinClassroom(classroom, joinClassroom);
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
      return;
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

  async getClassroomById(id: string, user: User): Promise<Classroom> {
    const found = await this.classroomsRepository.findOne({ id });

    if (!found) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    } else {
      return await this.joinClassroomService.getClassroomByUser(found, user);
    }
  }

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
    user: User,
  ): Promise<object> {
    const joinClassroom = await this.joinClassroomService.createJoinClassroom([
      Role.OWNER,
      Role.TEACHER,
    ]);
    await this.userService.updateJoinClassroom(user, joinClassroom);
    const classroom = await this.classroomsRepository.createClassroom(
      createClassroomDto,
    );
    return this.updateJoinClassroom(classroom, joinClassroom);
  }

  async deleteClassroom(id: string, user: User): Promise<void> {
    const classroom = await this.getClassroomById(id, user);
    await this.joinClassroomService.deleteJoinClassroom(classroom);

    const result = await this.classroomsRepository.delete(classroom.id);

    if (result.affected === 0) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    }
  }

  async updateClassroom(
    id: string,
    updateClassroomDto: CreateClassroomDto,
    user: User,
  ): Promise<Classroom> {
    const { name, description, section, subject, room } = updateClassroomDto;
    const classroom = await this.getClassroomById(id, user);

    classroom.name = name;
    classroom.description = description;
    classroom.section = section;
    classroom.subject = subject;
    classroom.room = room;
    await this.classroomsRepository.save(classroom);
    return classroom;
  }

  async updateJoinClassroom(
    classroom: Classroom,
    joinClassroom: JoinClassroom,
  ): Promise<object> {
    if (classroom.joinClassrooms === undefined) {
      classroom.joinClassrooms = [joinClassroom];
    } else {
      classroom.joinClassrooms = [...classroom.joinClassrooms, joinClassroom];
    }
    await this.classroomsRepository.save(classroom);
    return {
      id: classroom.id,
      code: classroom.code,
      name: classroom.name,
      description: classroom.description,
      section: classroom.section,
      subject: classroom.subject,
      room: classroom.room,
    };
  }
}
