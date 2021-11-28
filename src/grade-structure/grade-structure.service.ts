import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
import { Repository } from 'typeorm';
import { GradeStructure } from './grade-structure.entity';

@Injectable()
export class GradeStructureService {
  constructor(
    @InjectRepository(GradeStructure)
    private gradeStructureRepo: Repository<GradeStructure>,
  ) {}

  async getGradeStructure(classroom: Classroom): Promise<GradeStructure[]> {
    const query = this.gradeStructureRepo.createQueryBuilder('gradeStructure');
    query.where({ classroom });

    try {
      const gradeStructure = await query.getMany();
      return gradeStructure;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
