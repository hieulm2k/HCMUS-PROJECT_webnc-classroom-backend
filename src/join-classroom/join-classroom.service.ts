import { Injectable } from '@nestjs/common';
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

  getUserInClassroomByStudentId(
    classroom: Classroom,
    studentId: string,
  ): Promise<User> {
    return this.joinClassroomRepository.getUserInClassroomByStudentId(
      classroom,
      studentId,
    );
  }

  getMembersByRole(classroom: Classroom, role: Role): Promise<User[]> {
    return this.joinClassroomRepository.getMembersByRole(classroom, role);
  }

  createJoinClassroom(roles: Role[]): Promise<JoinClassroom> {
    return this.joinClassroomRepository.createJoinClassroom(roles);
  }

  async deleteAllJoinClassroomsOfClassroom(
    classroom: Classroom,
  ): Promise<void> {
    await this.joinClassroomRepository.delete({ classroom });
  }

  getJoinClassroomByClassroomIdAndUserId(
    classroomId: string,
    userId: string,
  ): Promise<JoinClassroom> {
    return this.joinClassroomRepository.getJoinClassroomByClassroomIdAndUserId(
      classroomId,
      userId,
    );
  }
}
