import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';
import { ChangePwd, UpdateUserDto } from './dto/user.dto';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersRepository)
    private userRepository: UsersRepository,
  ) {}

  async getUserById(id: string): Promise<User> {
    const found = await this.userRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`User does not exist!`);
    }

    return found;
  }

  async getByEmail(email: string): Promise<User> {
    const found = await this.userRepository.findOne({
      email,
    });

    if (!found) {
      throw new NotFoundException(`User with email "${email}" does not exist!`);
    }

    return found;
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
    }

    const updatedUser = await this.userRepository.save({
      ...user,
      ...updateUserDto,
    });

    delete updatedUser.password;
    delete updatedUser.token;
    delete updatedUser.tokenExpiration;
    delete updatedUser.joinClassrooms;
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
}
