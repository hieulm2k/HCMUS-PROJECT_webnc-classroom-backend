import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeStructureModule } from 'src/grade-structure/grade-structure.module';
import { GradeController } from './grade.controller';
import { Grade } from './grade.entity';
import { GradeService } from './grade.service';

@Module({
  imports: [TypeOrmModule.forFeature([Grade]), GradeStructureModule],
  controllers: [GradeController],
  providers: [GradeService],
  exports: [GradeService],
})
export class GradeModule {}
