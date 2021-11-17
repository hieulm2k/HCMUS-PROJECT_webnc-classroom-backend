import { InternalServerErrorException } from '@nestjs/common';
import { Role } from 'src/auth/enum/role.enum';
import { Classroom } from 'src/classrooms/classroom.entity';
import { CreateClassroomDto } from 'src/classrooms/dto/create-classroom.dto';
import { User } from 'src/user/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { JoinClassroom } from './join-classroom.entity';

@EntityRepository(JoinClassroom)
export class JoinClassroomRepository extends Repository<JoinClassroom> {
  async getJoinClassrooms(user: User): Promise<JoinClassroom[]> {
    const query = this.createQueryBuilder('joinClassroom');
    query.where({ user }).andWhere(Role.OWNER);

    try {
      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createJoinClassroom(): Promise<JoinClassroom> {
    const joinClassroom = this.create({
      role: [Role.TEACHER, Role.OWNER],
    });

    await this.save(joinClassroom);

    return joinClassroom;
  }
}
