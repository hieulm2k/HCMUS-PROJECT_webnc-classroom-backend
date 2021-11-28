import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeStructure } from './grade-structure.entity';
import { GradeStructureService } from './grade-structure.service';

@Module({
  imports: [TypeOrmModule.forFeature([GradeStructure])],
  providers: [GradeStructureService],
  exports: [GradeStructureService],
})
export class GradeStructureModule {}
