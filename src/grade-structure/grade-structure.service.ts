import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
import { GradeService } from 'src/grade/grade.service';
import { Repository } from 'typeorm';
import { CreateGradeStructureDto } from './dto/create-grade-structure.dto';
import { UpdateGradeStructureDto } from './dto/update-grade-structure.dto';
import { GradeStructure } from './grade-structure.entity';

@Injectable()
export class GradeStructureService {
  constructor(
    @InjectRepository(GradeStructure)
    private gradeStructureRepo: Repository<GradeStructure>,
    @Inject(forwardRef(() => GradeService))
    private readonly gradeService: GradeService,
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
    const gradeStructure = await this.gradeStructureRepo.findOne({
      where: { id: id, classroom: classroom },
    });

    if (!gradeStructure) {
      throw new NotFoundException(`Grade structure does not exist!`);
    }

    return gradeStructure;
  }

  async getGradeStructureByName(
    name: string,
    classroom: Classroom,
  ): Promise<GradeStructure> {
    const gradeStructure = await this.gradeStructureRepo.findOne({
      where: { name: name, classroom: classroom },
      relations: ['grades'],
    });

    if (!gradeStructure) {
      throw new NotFoundException(`Grade structure does not exist!`);
    }

    return gradeStructure;
  }

  async createGradeStructure(
    classroom: Classroom,
    createGradeStructureDto: CreateGradeStructureDto,
  ): Promise<GradeStructure> {
    const { name, grade } = createGradeStructureDto;
    let gradeStructure;

    try {
      gradeStructure = await this.getGradeStructureByName(name, classroom);
    } catch (error) {
      // if not found, do nothing
    }

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
    let gradeStructure: GradeStructure;
    const match = gradeId.match(
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    );

    if (match !== null) {
      gradeStructure = await this.getGradeStructureById(gradeId, classroom);
    } else {
      gradeStructure = await this.getGradeStructureByName(gradeId, classroom);
    }

    if (dto.name && dto.name !== gradeStructure.name) {
      let found;
      try {
        found = await this.getGradeStructureByName(dto.name, classroom);
      } catch (error) {
        // if not found, do nothing
      }

      if (found)
        throw new BadRequestException(`Grade structure name already exists"!`);
    }

    if (dto.order) {
      await this.handleBeforeChangeOrderGradeStructure(
        classroom,
        gradeStructure.order,
        dto.order,
      );
    }

    if (dto.isFinalize) {
      const grades = gradeStructure.grades;
      grades.forEach((grade) => {
        grade.isFinalize = dto.isFinalize;
      });
      this.gradeService.saveAllGrades(grades);
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

  async saveAllGradeStructures(
    gradeStructures: GradeStructure[],
  ): Promise<void> {
    await this.gradeStructureRepo.save(gradeStructures);
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
