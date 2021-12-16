import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreateGradeStructureDto } from './dto/create-grade-structure.dto';
import { UpdateGradeStructureDto } from './dto/update-grade-structure.dto';
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

    return await query.getOne();
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
    dto: UpdateGradeStructureDto,
  ): Promise<GradeStructure> {
    if (dto.name) {
      const found = await this.getGradeStructureByName(dto.name, classroom);
      if (found)
        throw new BadRequestException(`Grade structure already exists"!`);
    }

    const gradeStructure = await this.getGradeStructureById(gradeId, classroom);

    if (dto.order) {
      await this.handleBeforeChangeOrderGradeStructure(
        classroom,
        gradeStructure.order,
        dto.order,
      );
    }

    return this.saveGradeStructure({ ...gradeStructure, ...dto });
  }

  async handleBeforeChangeOrderGradeStructure(
    classroom: Classroom,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    const gradeStructures = await this.getGradeStructures(classroom);

    if (newOrder > gradeStructures.length || newOrder < 1) {
      throw new BadRequestException(`New order "${newOrder}" is out of range!`);
    }

    if (newOrder < oldOrder) {
      for (let i = newOrder - 1; i < oldOrder - 1; ++i) {
        gradeStructures[i].order++;
        await this.saveGradeStructure(gradeStructures[i]);
      }
    } else if (newOrder > oldOrder) {
      for (let i = oldOrder; i < newOrder; ++i) {
        gradeStructures[i].order--;
        await this.saveGradeStructure(gradeStructures[i]);
      }
    }
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

  async deleteAllGradeStructuresOfClassroom(
    classroom: Classroom,
  ): Promise<void> {
    await this.gradeStructureRepo.delete({ classroom });
  }
}
