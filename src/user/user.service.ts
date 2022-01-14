import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';
import { ChangePwd, CreateAdmin, UpdateUserDto } from './dto/user.dto';
import { User, UserStatus } from './user.entity';
import { UsersRepository } from './users.repository';
import { GradeService } from 'src/grade/grade.service';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';
import { Classroom } from 'src/classrooms/classroom.entity';
import { Role } from 'src/auth/enum/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersRepository)
    private userRepository: UsersRepository,
    private readonly gradeService: GradeService,
    private readonly joinClassroomService: JoinClassroomService,
  ) {}

  async getUserById(id: string, user: User): Promise<User> {
    const found = await this.userRepository.findOne(id);

    if (!found || found.status !== UserStatus.ACTIVE) {
      throw new NotFoundException(`User does not exist!`);
    }

    if (found.role === Role.ADMIN) {
      await this.acceptRole(user, Role.ADMIN);
    }

    return found;
  }

  async getByEmail(email: string): Promise<User> {
    const found = await this.userRepository.findOne({
      email,
    });

    if (!found || found.status !== UserStatus.ACTIVE) {
      throw new NotFoundException(`User with email "${email}" does not exist!`);
    }

    return found;
  }

  async getUserByStudentId(id: string): Promise<User> {
    const found = await this.userRepository.findOne({ studentId: id });

    if (!found || found.status !== UserStatus.ACTIVE) {
      throw new NotFoundException(`User does not exist!`);
    }

    return found;
  }

  async getAllAdmins(user: User): Promise<User[]> {
    await this.acceptRole(user, Role.ADMIN);
    return this.userRepository.find({ role: Role.ADMIN });
  }

  async updateJoinClassroom(
    user: User,
    joinClassroom: JoinClassroom,
  ): Promise<User> {
    user.joinClassrooms = [...user.joinClassrooms, joinClassroom];
    await this.userRepository.save(user);
    return user;
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    const { studentId } = updateUserDto;

    if (studentId) {
      const found = await this.userRepository.findOne({
        studentId,
      });

      if (user.studentId !== null && studentId !== user.studentId) {
        throw new BadRequestException(
          'Cannot update Student ID twice, please contact Admin to update!',
        );
      }

      if (found && studentId !== user.studentId) {
        throw new ConflictException('Student ID already exists!');
      }

      // If user join a classroom -> need to update all mapping userId of grade of that classroom
      const joinClassrooms = await this.joinClassroomService.getClassrooms(
        user,
      );

      user.studentId = studentId;
      for (const joinClassroom of joinClassrooms) {
        const classroom: Classroom = joinClassroom['classroom'];
        await this.gradeService.updateGradeByClassroomAndUser(classroom, user);
      }
    }

    const updatedUser = await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });

    delete updatedUser.password;
    delete updatedUser.token;
    delete updatedUser.tokenExpiration;
    delete updatedUser.joinClassrooms;
    delete updatedUser.comments;
    delete updatedUser.notificationsReceived;
    delete updatedUser.notificationsSent;
    return updatedUser;
  }

  async createWithGoogle(email: string, name: string) {
    const newUser = this.userRepository.create({
      email,
      name,
      isRegisteredWithGoogle: true,
    });
    await this.userRepository.save(newUser);
    return newUser;
  }

  async changePwd(dto: ChangePwd, user: User) {
    if (!(await bcrypt.compare(dto.oldPassword, user.password))) {
      throw new BadRequestException('Old password is wrong');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must differ from old password',
      );
    }

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(dto.newPassword, salt);

    return this.userRepository.save(user);
  }

  async acceptRole(user: User, role: Role): Promise<void> {
    if (user.role !== role) {
      throw new ForbiddenException('You do not have permission to do this');
    }
  }

  async createAdmin(user: User, dto: CreateAdmin) {
    await this.acceptRole(user, Role.ADMIN);
    await this.userRepository.createAdmin(dto);
  }
}
