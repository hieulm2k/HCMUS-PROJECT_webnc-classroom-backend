import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
import { CreateClassroomDto } from 'src/classrooms/dto/create-classroom.dto';
import { User } from 'src/user/user.entity';
import { JoinClassroom } from './join-classroom.entity';
import { JoinClassroomRepository } from './join-classroom.repository';

@Injectable()
export class JoinClassroomService {
  constructor(
    @InjectRepository(JoinClassroomRepository)
    private joinClassroomRepository: JoinClassroomRepository,
  ) {}

  getJoinClassrooms(user: User): Promise<JoinClassroom[]> {
    return this.joinClassroomRepository.getJoinClassrooms(user);
  }

  createJoinClassroom(): Promise<JoinClassroom> {
    return this.joinClassroomRepository.createJoinClassroom();
  }
}
