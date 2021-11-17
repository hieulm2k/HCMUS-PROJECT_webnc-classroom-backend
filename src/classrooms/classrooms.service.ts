import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { ClassroomsRepository } from './classroom.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './classroom.entity';
import { User } from 'src/user/user.entity';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(ClassroomsRepository)
    private classroomsRepository: ClassroomsRepository,
    private joinClassroomService: JoinClassroomService,
  ) {}

  async getClassrooms(user: User): Promise<Classroom[]> {
    const joinClassrooms = await this.joinClassroomService.getJoinClassrooms(
      user,
    );
    return this.classroomsRepository.getClassrooms(joinClassrooms);
  }

  // async getClassroomById(id: string, user: User): Promise<Classroom> {
  //   const found = await this.classroomsRepository.findOne({
  //     where: { id, user },
  //   });

  //   if (!found) {
  //     throw new NotFoundException(`Classroom with ID "${id}" not found!`);
  //   }

  //   return found;
  // }

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
    user: User,
  ): Promise<Classroom> {
    const joinClassroom = await this.joinClassroomService.createJoinClassroom();
    return this.classroomsRepository.createClassroom(
      createClassroomDto,
      user,
      joinClassroom,
    );
  }

  // async deleteClassroom(id: string, user: User): Promise<void> {
  //   const result = await this.classroomsRepository.delete({ id, user });

  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Classroom with ID "${id}" not found!`);
  //   }
  // }

  // async updateClassroom(
  //   id: string,
  //   updateClassroomDto: CreateClassroomDto,
  //   user: User,
  // ): Promise<Classroom> {
  //   const { name, description, section, subject, room } = updateClassroomDto;
  //   const classroom = await this.getClassroomById(id, user);
  //   classroom.name = name;
  //   classroom.description = description;
  //   classroom.section = section;
  //   classroom.subject = subject;
  //   classroom.room = room;
  //   await this.classroomsRepository.save(classroom);
  //   return classroom;
  // }
}
