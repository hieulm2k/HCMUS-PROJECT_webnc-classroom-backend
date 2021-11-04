import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesRepository } from './course.repository';
import { CoursesController } from './courses.controller';
import { CourseService } from './courses.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoursesRepository])],
  controllers: [CoursesController],
  providers: [CourseService],
})
export class CoursesModule {}
