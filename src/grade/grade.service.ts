import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/enum/role.enum';
import { Classroom } from 'src/classrooms/classroom.entity';
import { GradeStructure } from 'src/grade-structure/grade-structure.entity';
import { GradeStructureService } from 'src/grade-structure/grade-structure.service';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreateStudentListDto } from './dto/create-student-list.dto';
import {
  RequestReviewDto,
  UpdateGradeOfGradeStructureDto,
} from './dto/update-grade.dto';
import { Grade, ReportStatus } from './grade.entity';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,
    @Inject(forwardRef(() => GradeStructureService))
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

      preGrade[grades[0].gradeStructure.name] = {
        gradeId: grades[0].id,
        grade: grades[0].grade,
        isFinalize: grades[0].isFinalize,
        reportStatus: grades[0].reportStatus,
      };

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

          preGrade[grades[i].gradeStructure.name] = {
            gradeId: grades[i].id,
            grade: grades[i].grade,
            isFinalize: grades[i].isFinalize,
            reportStatus: grades[i].reportStatus,
          };

          if (grades[i].grade) {
            totalGrade += grades[i].grade * grades[i].gradeStructure.grade;
          }
          count += grades[0].gradeStructure.grade;
        } else if (grades[i].studentId === grades[i - 1].studentId) {
          preGrade[grades[i].gradeStructure.name] = {
            gradeId: grades[i].id,
            grade: grades[i].grade,
            isFinalize: grades[i].isFinalize,
            reportStatus: grades[i].reportStatus,
          };

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
      .select(['grade.studentId', 'grade.name', 'grade.userId', 'grade.id'])
      .where('grade.classroomId = :id', { id: classroom.id })
      .orderBy('grade.studentId')
      .getMany();

    if (studentList.length === 0) return null;

    for (let i = 0; i < studentList.length; ++i) {
      const user =
        await this.joinClassroomService.getUserInClassroomByStudentId(
          classroom,
          studentList[i].studentId,
        );

      studentList[i].userId = user === null ? null : user.id;

      await this.gradeRepo.update(studentList[i].id, {
        userId: user === null ? null : user.id,
      });

      delete studentList[i].id;
    }

    return studentList;
  }

  async getGradeOfStudentId(
    classroom: Classroom,
    studentId: string,
  ): Promise<any> {
    const grades = await this.gradeRepo
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.gradeStructure', 'gradeStructure')
      .where('grade.gradeStructure is not null')
      .andWhere('grade.classroomId = :id', { id: classroom.id })
      .andWhere('grade.studentId = :studentId', { studentId: studentId })
      .orderBy('grade.studentId')
      .addOrderBy('gradeStructure.order')
      .getMany();

    if (grades.length === 0) {
      throw new NotFoundException(
        `Not found grade detail of student ID: ${studentId}`,
      );
    }

    let totalGrade = 0;
    let count = 0;

    const user = await this.joinClassroomService.getUserInClassroomByStudentId(
      classroom,
      studentId,
    );

    const gradeDetail = { user: user, grades: [] };

    for (let i = 0; i < grades.length; ++i) {
      gradeDetail.grades.push({
        gradeId: grades[i].id,
        name: grades[i].gradeStructure.name,
        grade: grades[i].grade,
        isFinalize: grades[i].isFinalize,
        reportInfo: {
          reportStatus: grades[i].reportStatus,
          expectedGrade: grades[i].expectedGrade,
          message: grades[i].message,
        },
      });

      if (grades[i].grade) {
        totalGrade += grades[i].grade * grades[i].gradeStructure.grade;
      }

      count += grades[i].gradeStructure.grade;
    }

    // count total grade of pre grade
    gradeDetail['totalGrade'] = Math.round((totalGrade / count) * 100) / 100;

    return gradeDetail;
  }

  async removeAllGrades(grades: Grade[]): Promise<void> {
    await this.gradeRepo.remove(grades);
  }

  async saveAllGrades(grades: Grade[]): Promise<void> {
    await this.gradeRepo.save(grades);
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

    for (const assignment of gradeStructure) {
      assignment.grades = [];
      await this.gradeStructureService.saveGradeStructure(assignment);
      for (const student of createStudentListDtos) {
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
      }
    }
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

    gradeStructure.isFinalize = false;
    await this.gradeStructureService.saveGradeStructure(gradeStructure);

    const grades = gradeStructure.grades;

    for (const dto of dtos) {
      let success = false;
      for (const grade of grades) {
        if (grade.studentId === dto.studentId) {
          if (dto.grade !== undefined) {
            grade.grade = Math.round(dto.grade * 100) / 100;
          }

          if (dto.isFinalize === undefined) {
            grade.isFinalize = false;
          } else {
            grade.isFinalize = dto.isFinalize;
          }

          success = true;
        }
      }

      // if all grade is finalize -> grade structure is finalize too
      if (success) {
        let count = 0;
        for (const grade of grades) {
          if (grade.isFinalize === true) {
            count++;
          }
        }

        if (count === grades.length) {
          gradeStructure.isFinalize = true;
          await this.gradeStructureService.saveGradeStructure(gradeStructure);
        }
      } else if (!success) {
        // create default
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

        for (let structure of classroom.gradeStructures) {
          structure.isFinalize = false;
          structure = await this.gradeStructureService.saveGradeStructure(
            structure,
          );

          const newGrade = this.gradeRepo.create({
            studentId: dto.studentId,
            name: null,
            gradeStructure: structure,
            classroomId: classroom.id,
          });

          if (structure.id === gradeStructure.id) {
            newGrade.grade = dto.grade;
          }

          try {
            await this.gradeRepo.save(newGrade);
          } catch (error) {
            throw new InternalServerErrorException();
          }
        }
      }
    }

    return this.gradeRepo.save(grades);
  }

  async deleteAllGradesOfGradeStructure(
    gradeStructure: GradeStructure,
  ): Promise<void> {
    await this.gradeRepo.delete({ gradeStructure });
  }

  async requestReview(
    id: string,
    user: User,
    dto: RequestReviewDto,
  ): Promise<Grade> {
    const grade = await this.gradeRepo.findOne({
      where: { id: id },
      relations: ['gradeStructure'],
    });

    if (!grade || grade.studentId !== user.studentId) {
      throw new NotFoundException('Grade does not exists!');
    }

    if (grade.reportStatus !== ReportStatus.NEW) {
      throw new BadRequestException('Cannot report twice times!');
    }

    if (grade.grade === null || !grade.isFinalize) {
      throw new BadRequestException(
        'Cannot request review now, please wait the teachers to update grade or finalize grade',
      );
    }

    grade.reportStatus = ReportStatus.OPEN;
    grade.isFinalize = false;
    grade.gradeStructure.isFinalize = false;
    await this.gradeStructureService.saveGradeStructure(grade.gradeStructure);

    return this.gradeRepo.save({ ...grade, ...dto });
  }

  async getAllRequestReviews(
    classroomId: string,
    user: User,
  ): Promise<Grade[]> {
    const joinClassroom =
      await this.joinClassroomService.getJoinClassroomByClassroomIdAndUserId(
        classroomId,
        user.id,
      );

    if (!joinClassroom) {
      throw new NotFoundException('Classroom does not exists!');
    }

    if (!joinClassroom.roles.includes(Role.TEACHER)) {
      throw new ForbiddenException('You do not have permission to do this!');
    }

    const result = [];

    for (const gradeStructure of joinClassroom.classroom.gradeStructures) {
      const temp = { gradeStructure, grade: null };
      for (const grade of gradeStructure.grades) {
        if (grade.reportStatus === ReportStatus.OPEN) {
          temp.grade = grade;
          result.push(temp);
        }
      }
    }

    return result;
  }
}
