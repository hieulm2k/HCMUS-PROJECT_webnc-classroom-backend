import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeModule } from 'src/grade/grade.module';
import { GradeStructure } from './grade-structure.entity';
import { GradeStructureService } from './grade-structure.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GradeStructure]),
    forwardRef(() => GradeModule),
  ],
  providers: [GradeStructureService],
  exports: [GradeStructureService],
})
export class GradeStructureModule {}
