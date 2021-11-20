import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/enum/role.enum';
import { Classroom } from 'src/classrooms/classroom.entity';
import { User } from 'src/user/user.entity';
import { JoinClassroom } from './join-classroom.entity';
import { JoinClassroomRepository } from './join-classroom.repository';

@Injectable()
export class JoinClassroomService {
  constructor(
    @InjectRepository(JoinClassroomRepository)
    private joinClassroomRepository: JoinClassroomRepository,
  ) {}

  getClassrooms(user: User): Promise<object[]> {
    return this.joinClassroomRepository.getClassrooms(user);
  }

  getClassroomByUser(classroom: Classroom, user: User): Promise<Classroom> {
    return this.joinClassroomRepository.getClassroomByUser(classroom, user);
  }

  getClassroomOwner(classroom: Classroom): Promise<User> {
    return this.joinClassroomRepository.getClassroomOwner(classroom);
  }

  createJoinClassroom(roles: Role[]): Promise<JoinClassroom> {
    return this.joinClassroomRepository.createJoinClassroom(roles);
  }

  async deleteJoinClassroom(classroom: Classroom): Promise<void> {
    await this.joinClassroomRepository.delete({ classroom });
  }
}
