import { Module } from '@nestjs/common';
import { GradeStructureService } from './grade-structure.service';

@Module({
  providers: [GradeStructureService],
  exports: [GradeStructureService],
})
export class GradeStructureModule {}
