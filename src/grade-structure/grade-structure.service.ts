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
      throw new NotFoundException(`Grade structure does not exist!`);
    }
  }

  async getGradeStructureByName(
    name: string,
    classroom: Classroom,
  ): Promise<GradeStructure> {
    const query = this.gradeStructureRepo.createQueryBuilder('gradeStructure');
    query.where({ classroom }).andWhere({ name });

    try {
      return await query.getOne();
    } catch (error) {
      throw new NotFoundException(`Grade structure does not exist!`);
    }
  }

  async createGradeStructure(
    classroom: Classroom,
    createGradeStructureDto: CreateGradeStructureDto,
  ): Promise<GradeStructure> {
    const { name, grade } = createGradeStructureDto;
    let gradeStructure;

    gradeStructure = await this.getGradeStructureByName(name, classroom);

    if (gradeStructure) {
      throw new BadRequestException(`Grade structure already exists"!`);
    }

    // If not found a grade structure with name
    const gradeStructures = await this.getGradeStructures(classroom);

    gradeStructure = this.gradeStructureRepo.create({
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

  async updateOrderOfGradeStructure(
    gradeId: string,
    classroom: Classroom,
    order: number,
  ): Promise<GradeStructure> {
    const gradeStructure = await this.getGradeStructureById(gradeId, classroom);
    gradeStructure.order = order;

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
          `"${gradeStructure.name}" already exists`,
        );
      }
    }

    return gradeStructure;
  }

  async deleteGradeStructure(id: string): Promise<void> {
    const result = await this.gradeStructureRepo.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Grade structure does not exist!`);
    }
  }
}
