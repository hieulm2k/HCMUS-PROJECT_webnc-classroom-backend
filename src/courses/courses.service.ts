import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CoursesRepository } from './course.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CoursesRepository)
    private coursesRepository: CoursesRepository,
  ) {}

  getCourses(): Promise<Course[]> {
    return this.coursesRepository.getCourses();
  }

  async getCourseById(id: string): Promise<Course> {
    const found = await this.coursesRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Course with ID "${id}" not found!`);
    }

    return found;
  }

  createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesRepository.createCourse(createCourseDto);
  }

  async deleteCourse(id: string): Promise<void> {
    const result = await this.coursesRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID "${id}" not found!`);
    }
  }
}
