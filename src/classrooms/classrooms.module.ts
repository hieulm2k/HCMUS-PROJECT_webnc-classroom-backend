import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomsRepository } from './classroom.repository';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClassroomsRepository])],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
})
export class ClassroomsModule {}
