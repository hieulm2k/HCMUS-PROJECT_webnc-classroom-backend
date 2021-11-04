import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CourseService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './course.entity';

@Controller('courses')
export class CoursesController {
  constructor(private courseService: CourseService) {}

  @Get()
  getCourses(): Promise<Course[]> {
    return this.courseService.getCourses();
  }

  @Get('/:id')
  async getCourseById(@Param('id') id: string): Promise<Course> {
    return this.courseService.getCourseById(id);
  }

  @Post()
  createCourse(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courseService.createCourse(createCourseDto);
  }

  @Delete('/:id')
  deleteCourse(@Param('id') id: string): Promise<void> {
    return this.courseService.deleteCourse(id);
  }
}
