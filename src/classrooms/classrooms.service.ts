import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { ClassroomsRepository } from './classroom.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './classroom.entity';
import { User } from 'src/user/user.entity';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/auth/enum/role.enum';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(ClassroomsRepository)
    private classroomsRepository: ClassroomsRepository,
    private joinClassroomService: JoinClassroomService,
    private userService: UserService,
  ) {}

  async getClassrooms(user: User): Promise<object[]> {
    return this.joinClassroomService.getClassrooms(user);
  }

  async getClassroomOwner(classroom: Classroom): Promise<User> {
    return this.joinClassroomService.getClassroomOwner(classroom);
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
    console.log(classroom.joinClassrooms);
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
