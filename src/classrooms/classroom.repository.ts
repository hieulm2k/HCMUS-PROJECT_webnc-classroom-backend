import { EntityRepository, Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { Classroom } from './classroom.entity';
import { User } from 'src/user/user.entity';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';
import { InternalServerErrorException } from '@nestjs/common';

@EntityRepository(Classroom)
export class ClassroomsRepository extends Repository<Classroom> {
  async getClassrooms(joinClassrooms: JoinClassroom[]) {
    const query = this.createQueryBuilder('classroom');

    try {
      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
    user: User,
    joinClassroom: JoinClassroom,
  ) {
    const { name, description, section, subject, room } = createClassroomDto;

    const classroom = this.create({
      name,
      description,
      section,
      subject,
      room,
      joinClassrooms: [joinClassroom],
    });

    user.joinClassrooms = [joinClassroom];
    await await this.save(classroom);
    return classroom;
  }
}
