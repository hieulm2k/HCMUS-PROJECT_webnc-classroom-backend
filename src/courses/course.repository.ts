import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './course.entity';

@EntityRepository(Course)
export class CoursesRepository extends Repository<Course> {
  private logger = new Logger('CoursesRepository');

  async getCourses(): Promise<Course[]> {
    const query = this.createQueryBuilder('course');

    try {
      return await query.getMany();
    } catch (error) {
      this.logger.error('Failed to get courses', error.stack);
      throw new InternalServerErrorException();
    }
  }

  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    const { name, description, section, subject, room } = createCourseDto;

    const course = this.create({
      name,
      description,
      section,
      subject,
      room,
    });

    await this.save(course);
    return course;
  }
}
