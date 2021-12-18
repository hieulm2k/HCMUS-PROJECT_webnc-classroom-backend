import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

      let user = await this.joinClassroomService.getUserInClassroomByStudentId(
        classroom,
        grades[0].studentId,
      );

      let newUserId = user === null ? null : user.id;

      await this.gradeRepo.update(grades[0].id, {
        ...grades[0],
        userId: newUserId,
      });

      await this.updateUserIdByDefaultStudent(
        classroom.id,
        grades[0].studentId,
        newUserId,
      );

      let preGrade = {
        studentId: grades[0].studentId,
        name: grades[0].name,
        userId: newUserId,
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
          // mapping
          user = await this.joinClassroomService.getUserInClassroomByStudentId(
            classroom,
            grades[i].studentId,
          );

          newUserId = user === null ? null : user.id;

          await this.updateUserIdByDefaultStudent(
            classroom.id,
            grades[i].studentId,
            newUserId,
          );

          preGrade = {
            studentId: grades[i].studentId,
            name: grades[i].name,
            userId: newUserId,
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

        await this.gradeRepo.update(grades[i].id, {
          ...grades[i],
          userId: newUserId,
        });
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

  async removeAllGrades(grades: Grade[]): Promise<void> {
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
      await this.gradeStructureService.saveGradeStructure(assignment);

      createStudentListDtos.forEach(async (student) => {
        const { studentId, name } = student;
        const grade = this.gradeRepo.create({
          studentId,
          name,
          classroomId: classroom.id,
          gradeStructure: assignment,
        });

        try {
          await this.gradeRepo.save(grade);
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
      const { studentId, name } = student;

      const grade = this.gradeRepo.create({
        studentId,
        name,
        classroomId: classroom.id,
      });

      try {
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

  async updateUserIdByDefaultStudent(
    classroomId: string,
    studentId: string,
    newUserId: string,
  ): Promise<Grade> {
    const student = await this.gradeRepo.findOne({
      where: {
        studentId: studentId,
        classroomId: classroomId,
        gradeStructure: null,
      },
      relations: ['gradeStructure'],
    });

    student.userId = newUserId;
    return this.gradeRepo.save(student);
  }

  async updateGradeOfGradeStructure(
    classroom: Classroom,
    structureName: string,
    dtos: UpdateGradeOfGradeStructureDto[],
  ): Promise<Grade[]> {
    const gradeStructure =
      await this.gradeStructureService.getGradeStructureByName(
        structureName,
        classroom,
      );

    const grades = gradeStructure.grades;

    dtos.forEach(async (dto) => {
      let success = false;
      grades.forEach((grade) => {
        if (grade.studentId === dto.studentId) {
          grade.grade = Math.round(dto.grade * 100) / 100;
          success = true;
          return;
        }
      });

      if (!success) {
        const newGrade = this.gradeRepo.create({
          studentId: dto.studentId,
          name: null,
          classroomId: classroom.id,
        });

        try {
          await this.gradeRepo.save(newGrade);
        } catch (error) {
          throw new InternalServerErrorException();
        }

        classroom.gradeStructures.forEach(async (structure) => {
          const newGrade = this.gradeRepo.create({
            studentId: dto.studentId,
            name: null,
            gradeStructure: structure,
            classroomId: classroom.id,
          });

          if (structure === gradeStructure) {
            newGrade.grade = dto.grade;
          }

          try {
            await this.gradeRepo.save(newGrade);
          } catch (error) {
            throw new InternalServerErrorException();
          }
        });
      }
    });

    return this.gradeRepo.save(grades);
  }

  async deleteAllGradesOfGradeStructure(
    gradeStructure: GradeStructure,
  ): Promise<void> {
    await this.gradeRepo.delete({ gradeStructure });
  }
}
