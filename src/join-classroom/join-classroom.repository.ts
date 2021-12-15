import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from 'src/auth/enum/role.enum';
import { Classroom } from 'src/classrooms/classroom.entity';
import { User } from 'src/user/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { JoinClassroom } from './join-classroom.entity';

@EntityRepository(JoinClassroom)
export class JoinClassroomRepository extends Repository<JoinClassroom> {
  async getClassrooms(user: User): Promise<object[]> {
    const query = this.createQueryBuilder('joinClassroom');
    query
      .where({ user })
      .leftJoinAndSelect('joinClassroom.classroom', 'classroom');

    try {
      const joinClassrooms = await query.getMany();
      const results: object[] = [];

      for (let i = 0; i < joinClassrooms.length; i++) {
        const owner = await this.getMembersByRole(
          joinClassrooms[i].classroom,
          Role.OWNER,
        );

        results.push({
          owner: owner[0],
          classroom: joinClassrooms[i].classroom,
        });
      }

      return results;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getClassroomByUser(
    classroom: Classroom,
    user: User,
  ): Promise<Classroom> {
    const query = this.createQueryBuilder('joinClassroom');
    query
      .where({ user })
      .leftJoinAndSelect('joinClassroom.classroom', 'classroom')
      .andWhere({ classroom });
    try {
      return await (
        await query.getOne()
      ).classroom;
    } catch (error) {
      throw new NotFoundException(`Classroom does not exist!`);
    }
  }

  async getMembersByRole(classroom: Classroom, role: Role): Promise<User[]> {
    const query = this.createQueryBuilder('joinClassroom');
    query
      .where({ classroom })
      .leftJoinAndSelect('joinClassroom.user', 'user')
      .andWhere(':role = ANY(roles)', { role: role });

    try {
      const joinClassrooms = await query.getMany();
      const users: User[] = [];
      joinClassrooms.map((item) => {
        users.push(item.user);
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createJoinClassroom(roles: Role[]): Promise<JoinClassroom> {
    const joinClassroom = this.create({
      roles: roles,
    });

    await this.save(joinClassroom);

    return joinClassroom;
  }
}
