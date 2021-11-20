import { EntityRepository, Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { Classroom } from './classroom.entity';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';

@EntityRepository(Classroom)
export class ClassroomsRepository extends Repository<Classroom> {
  async createClassroom(
    createClassroomDto: CreateClassroomDto,
  ): Promise<Classroom> {
    const { name, description, section, subject, room } = createClassroomDto;

    const classroom = this.create({
      name,
      description,
      section,
      subject,
      room,
      code: (Math.random() + 1).toString(36).substring(4),
    });

    await this.save(classroom);
    return classroom;
  }
}
