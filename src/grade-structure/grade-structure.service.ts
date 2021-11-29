import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
import { Repository } from 'typeorm';
import { CreateGradeStructureDto } from './dto/create-grade-structure.dto';
import { GradeStructure } from './grade-structure.entity';

@Injectable()
export class GradeStructureService {
  constructor(
    @InjectRepository(GradeStructure)
    private gradeStructureRepo: Repository<GradeStructure>,
  ) {}

  async getGradeStructures(classroom: Classroom): Promise<GradeStructure[]> {
    const query = this.gradeStructureRepo.createQueryBuilder('gradeStructure');
    query.where({ classroom });

    try {
      const gradeStructures = await query.getMany();
      return gradeStructures;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createGradeStructure(
    classroom: Classroom,
    createGradeStructureDto: CreateGradeStructureDto,
  ): Promise<GradeStructure> {
    const { name, grade } = createGradeStructureDto;
    const gradeStructures = await this.getGradeStructures(classroom);

    const gradeStructure = this.gradeStructureRepo.create({
      name,
      grade,
      order: gradeStructures.length + 1,
    });

    try {
      await this.gradeStructureRepo.save(gradeStructure);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(`"${name}" is already exists`);
      }
    }
    return gradeStructure;
  }
}
