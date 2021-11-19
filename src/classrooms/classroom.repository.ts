import { EntityRepository, Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { Classroom } from './classroom.entity';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';

@EntityRepository(Classroom)
export class ClassroomsRepository extends Repository<Classroom> {
  async getClassrooms(joinClassrooms: JoinClassroom[]) {
    // const token = randomBytes(48).toString('base64url');
    // console.log(token);
    const classrooms: Classroom[] = [];
    joinClassrooms.map((joinClassroom) => {
      classrooms.push(joinClassroom.classroom);
    });

    return classrooms;
  }

  async createClassroom(
    createClassroomDto: CreateClassroomDto,
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

    await this.save(classroom);
    return classroom;
  }
}
