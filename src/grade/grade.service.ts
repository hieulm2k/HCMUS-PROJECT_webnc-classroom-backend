import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { GradeStructureService } from 'src/grade-structure/grade-structure.service';
import { Repository } from 'typeorm';
import { CreateStudentListDto } from './dto/create-student-list.dto';
import { Grade } from './grade.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,
    private readonly gradeStructureService: GradeStructureService,
  ) {}

  async getAllGrades(classroomId: string): Promise<Grade[]> {
    const query = this.gradeRepo
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.gradeStructure', 'gradeStructure')
      .andWhere('gradeStructure.classroom.id = :id', { id: classroomId });

    try {
      return query.getMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async removeAllGrades(classroomId: string): Promise<void> {
    const grades = await this.getAllGrades(classroomId);
    await this.gradeRepo.remove(grades);
  }

  async createStudentList(
    createStudentListDtos: CreateStudentListDto[],
    gradeStructure: GradeStructure[],
  ): Promise<void> {
    gradeStructure.forEach(async (assignment) => {
      assignment.grades = [];

      await createStudentListDtos.forEach(async (student) => {
        try {
          const { studentId, name } = student;
          let grade = this.gradeRepo.create({
            studentId,
            name,
          });

          grade = await this.gradeRepo.save(grade);

          assignment.grades = [...assignment.grades, grade];
          await this.gradeStructureService.saveGradeStructure(assignment);
        } catch (error) {
          throw new InternalServerErrorException();
        }
      });
    });
  }

  async deleteDuplicateStudent(
    createStudentListDtos: CreateStudentListDto[],
  ): Promise<CreateStudentListDto[]> {
    return createStudentListDtos.filter(
      (student, index, self) =>
        index ===
        self.findIndex(
          (s) => s.name === student.name && s.studentId === student.studentId,
        ),
    );
  }
}
