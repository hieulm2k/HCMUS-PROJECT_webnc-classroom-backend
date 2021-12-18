import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { GradeStructureService } from 'src/grade-structure/grade-structure.service';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';
import { Repository } from 'typeorm';
import { CreateStudentListDto } from './dto/create-student-list.dto';
import { UpdateGradeOfGradeStructureDto } from './dto/update-grade.dto';
import { Grade } from './grade.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,
    private readonly gradeStructureService: GradeStructureService,
    private readonly joinClassroomService: JoinClassroomService,
  ) {}

  async getAllGrades(classroomId: string): Promise<Grade[]> {
    const query = this.gradeRepo
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.gradeStructure', 'gradeStructure')
      .andWhere('grade.classroomId = :id', { id: classroomId });

    try {
      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getGradeBoard(classroom: Classroom): Promise<any[]> {
    const grades = await this.gradeRepo
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.gradeStructure', 'gradeStructure')
      .where('grade.gradeStructure is not null')
      .andWhere('grade.classroomId = :id', { id: classroom.id })
      .orderBy('grade.studentId')
      .addOrderBy('gradeStructure.order')
      .getMany();

    if (grades.length !== 0) {
      let totalGrade = 0;
      let count = 0;

      const gradeBoard = [];

      const user =
        await this.joinClassroomService.getUserInClassroomByStudentId(
          classroom,
          grades[0].studentId,
        );

      let preGrade = {
        studentId: grades[0].studentId,
        name: grades[0].name,
        userId: user === null ? user : user.id,
      };
      preGrade[grades[0].gradeStructure.name] = grades[0].grade;

      if (grades[0].grade) {
        totalGrade += grades[0].grade * grades[0].gradeStructure.grade;
      }
      count += grades[0].gradeStructure.grade;

      for (let i = 1; i < grades.length; ++i) {
        if (grades[i].studentId !== grades[i - 1].studentId) {
          // count total grade of pre grade
          preGrade['totalGrade'] = Math.round((totalGrade / count) * 100) / 100;
          gradeBoard.push(preGrade);

          // create new pre grade
          totalGrade = 0;
          count = 0;
          const newUser =
            await this.joinClassroomService.getUserInClassroomByStudentId(
              classroom,
              grades[i].studentId,
            );

          preGrade = {
            studentId: grades[i].studentId,
            name: grades[i].name,
            userId: newUser === null ? newUser : newUser.id,
          };
          preGrade[grades[i].gradeStructure.name] = grades[i].grade;

          if (grades[i].grade) {
            totalGrade += grades[i].grade * grades[i].gradeStructure.grade;
          }
          count += grades[0].gradeStructure.grade;
        } else if (grades[i].studentId === grades[i - 1].studentId) {
          preGrade[grades[i].gradeStructure.name] = grades[i].grade;

          if (grades[i].grade) {
            totalGrade += grades[i].grade * grades[i].gradeStructure.grade;
          }

          count += grades[i].gradeStructure.grade;
        }
      }
      // count total grade of pre grade
      preGrade['totalGrade'] = Math.round((totalGrade / count) * 100) / 100;
      gradeBoard.push(preGrade);

      return gradeBoard;
    }

    const studentList = await this.gradeRepo
      .createQueryBuilder('grade')
      .select(['grade.studentId', 'grade.name', 'grade.userId'])
      .where('grade.classroomId = :id', { id: classroom.id })
      .orderBy('grade.studentId')
      .getMany();

    return studentList.length === 0 ? null : studentList;
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

      createStudentListDtos.forEach(async (student) => {
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

  async updateGradeOfGradeStructure(
    classroom: Classroom,
    structureId: string,
    dtos: UpdateGradeOfGradeStructureDto[],
  ): Promise<Grade[]> {
    const gradeStructure =
      await this.gradeStructureService.getGradeStructureById(
        structureId,
        classroom,
      );

    const grades = await this.gradeRepo
      .createQueryBuilder('grade')
      .where({ gradeStructure })
      .getMany();

    grades.forEach((grade) => {
      dtos.forEach((dto) => {
        if (grade.studentId === dto.studentId) {
          grade.grade = Math.round(dto.grade * 100) / 100;
        }
      });
    });

    return this.gradeRepo.save(grades);
  }

  async deleteAllGradesOfGradeStructure(
    gradeStructure: GradeStructure,
  ): Promise<void> {
    await this.gradeRepo.delete({ gradeStructure });
  }
}
