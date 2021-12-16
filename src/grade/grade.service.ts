import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
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
      .andWhere('grade.classroomId = :id', { id: classroomId });

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
    classroom: Classroom,
  ): Promise<void> {
    const gradeStructure = classroom.gradeStructures;

    // create a student list without grade structure
    // -> it will not delete when grade structure delete
    await this.createStudentListWithoutGradeStructure(
      createStudentListDtos,
      classroom,
    );

    gradeStructure.forEach(async (assignment) => {
      assignment.grades = [];

      await createStudentListDtos.forEach(async (student) => {
        try {
          const { studentId, name } = student;
          let grade = this.gradeRepo.create({
            studentId,
            name,
            classroomId: classroom.id,
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

  async createStudentListWithoutGradeStructure(
    createStudentListDtos: CreateStudentListDto[],
    classroom: Classroom,
  ): Promise<void> {
    createStudentListDtos.forEach(async (student) => {
      try {
        const { studentId, name } = student;
        const grade = this.gradeRepo.create({
          studentId,
          name,
          classroomId: classroom.id,
        });

        await this.gradeRepo.save(grade);
      } catch (error) {
        throw new InternalServerErrorException();
      }
    });
  }

  async deleteDuplicateStudent(createStudentListDtos: any[]): Promise<any[]> {
    return createStudentListDtos.filter(
      (item, index, self) =>
        index === self.findIndex((s) => s.studentId === item.studentId),
    );
  }

  async createGradeWithNewGradeStructure(
    classroomId: string,
    assignment: GradeStructure,
  ): Promise<void> {
    let grades = await this.getAllGrades(classroomId);
    grades = await this.deleteDuplicateStudent(grades);

    assignment.grades = [];

    grades.forEach(async (grade) => {
      const newGrade = this.gradeRepo.create({
        studentId: grade.studentId,
        name: grade.name,
        classroomId,
      });

      await this.gradeRepo.save(newGrade);
      assignment.grades = [...assignment.grades, newGrade];
      await this.gradeStructureService.saveGradeStructure(assignment);
    });
  }

  async deleteAllGradesOfGradeStructure(
    gradeStructure: GradeStructure,
  ): Promise<void> {
    await this.gradeRepo.delete({ gradeStructure });
  }
}
