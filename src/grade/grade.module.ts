import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeStructureModule } from 'src/grade-structure/grade-structure.module';
import { JoinClassroomModule } from 'src/join-classroom/join-classroom.module';
import { Grade } from './grade.entity';
import { GradeService } from './grade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade]),
    GradeStructureModule,
    JoinClassroomModule,
  ],
  providers: [GradeService],
  exports: [GradeService],
})
export class GradeModule {}
