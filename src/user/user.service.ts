import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersRepository)
    private userRepository: UsersRepository,
  ) {}

  async getUserById(id: string): Promise<User> {
    const found = await this.userRepository.findOne({
      where: id,
    });

    if (!found) {
      throw new NotFoundException(`User with ID "${id}" not found!`);
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
    const { name, studentId } = updateUserDto;

    user.name = name;
    user.studentId = studentId;

    await this.userRepository.save(user);
    return user;
  }
}
