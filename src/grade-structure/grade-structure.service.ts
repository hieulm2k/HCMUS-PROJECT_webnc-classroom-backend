import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
    query.where({ classroom }).orderBy('gradeStructure.order');

    try {
      const gradeStructures = await query.getMany();
      return gradeStructures;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getGradeStructureById(
    id: string,
    classroom: Classroom,
  ): Promise<GradeStructure> {
    const query = this.gradeStructureRepo.createQueryBuilder('gradeStructure');
    query.where({ classroom }).andWhere({ id });

    try {
      return await query.getOne();
    } catch (error) {
      throw new NotFoundException(
        `Not found Grade structure with ID "${id} of "classroom with ID "${classroom.id}"!`,
      );
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

    return this.saveGradeStructure(gradeStructure);
  }

  async updateGradeStructure(
    gradeId: string,
    classroom: Classroom,
    updateGradeStructure: CreateGradeStructureDto,
  ): Promise<GradeStructure> {
    const { name, grade } = updateGradeStructure;
    const gradeStructure = await this.getGradeStructureById(gradeId, classroom);
    gradeStructure.name = name;
    gradeStructure.grade = grade;

    return this.saveGradeStructure(gradeStructure);
  }

  async saveGradeStructure(
    gradeStructure: GradeStructure,
  ): Promise<GradeStructure> {
    try {
      await this.gradeStructureRepo.save(gradeStructure);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          `"${gradeStructure.name}" is already exists`,
        );
      }
    }

    return gradeStructure;
  }

  async deleteGradeStructure(id: string): Promise<void> {
    const result = await this.gradeStructureRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Grade structure with ID "${id}" not found!`);
    }
  }
}
