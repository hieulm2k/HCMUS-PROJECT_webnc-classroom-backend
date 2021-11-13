import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { Classroom } from './classroom.entity';
import { User } from 'src/auth/user.entity';

@EntityRepository(Classroom)
export class ClassroomsRepository extends Repository<Classroom> {
  private logger = new Logger('ClassroomsRepository');

  async getClassrooms(user: User): Promise<Classroom[]> {
    const query = this.createQueryBuilder('classroom');
    query.where({ user });

    try {
      return await query.getMany();
    } catch (error) {
      this.logger.error('Failed to get classrooms', error.stack);
      throw new InternalServerErrorException();
    }
  }

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
    user: User,
  ): Promise<Classroom> {
    const { name, description, section, subject, room } = createClassroomDto;

    const classroom = this.create({
      name,
      description,
      section,
      subject,
      room,
      user,
    });

    await this.save(classroom);
    return classroom;
  }
}
