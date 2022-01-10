import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeStructureModule } from 'src/grade-structure/grade-structure.module';
import { JoinClassroomModule } from 'src/join-classroom/join-classroom.module';
import { GradeController } from './grade.controller';
import { Grade } from './grade.entity';
import { GradeService } from './grade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade]),
    forwardRef(() => GradeStructureModule),
    JoinClassroomModule,
  ],
  controllers: [GradeController],
  providers: [GradeService],
  exports: [GradeService],
})
export class GradeModule {}
