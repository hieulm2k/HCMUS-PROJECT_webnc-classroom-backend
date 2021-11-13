import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { ClassroomsRepository } from './classroom.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './classroom.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(ClassroomsRepository)
    private classroomsRepository: ClassroomsRepository,
  ) {}

  getClassrooms(user: User): Promise<Classroom[]> {
    return this.classroomsRepository.getClassrooms(user);
  }

  async getClassroomById(id: string, user: User): Promise<Classroom> {
    const found = await this.classroomsRepository.findOne({
      where: { id, user },
    });

    if (!found) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    }

    return found;
  }

  createClassroom(
    createClassroomDto: CreateClassroomDto,
    user: User,
  ): Promise<Classroom> {
    return this.classroomsRepository.createClassroom(createClassroomDto, user);
  }

  async deleteClassroom(id: string, user: User): Promise<void> {
    const result = await this.classroomsRepository.delete({ id, user });

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
}
