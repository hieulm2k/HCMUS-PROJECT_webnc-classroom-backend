import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { ClassroomsRepository } from './classroom.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './classroom.entity';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(ClassroomsRepository)
    private classroomsRepository: ClassroomsRepository,
  ) {}

  getClassrooms(): Promise<Classroom[]> {
    return this.classroomsRepository.getClassrooms();
  }

  async getClassroomById(id: string): Promise<Classroom> {
    const found = await this.classroomsRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    }

    return found;
  }

  createClassroom(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    return this.classroomsRepository.createClassroom(createClassroomDto);
  }

  async deleteClassroom(id: string): Promise<void> {
    const result = await this.classroomsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Classroom with ID "${id}" not found!`);
    }
  }
}
