import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/auth/enum/role.enum';
import { Grade } from 'src/grade/grade.entity';
import { GradeService } from 'src/grade/grade.service';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';
import { NotificationType } from 'src/notification/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { PostCommentDto } from './dto/post-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
    private readonly gradeService: GradeService,
    private readonly joinClassroomService: JoinClassroomService,
    private readonly notiService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async getAllComments(gradeId: string, user: User): Promise<Comment[]> {
    const grade = await this.gradeService.getGradeById(gradeId);

    if (
      grade.studentId !== user.studentId &&
      !(await this.joinClassroomService.checkTeacher(
        grade.gradeStructure.classroom,
        user,
      ))
    ) {
      throw new ForbiddenException('You do not have permission to do this');
    }

    return this.commentRepo.find({
      where: { grade: grade },
      relations: ['sender'],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async postComment(
    gradeId: string,
    user: User,
    dto: PostCommentDto,
  ): Promise<Comment> {
    const grade = await this.gradeService.getGradeById(gradeId);

    if (
      grade.studentId !== user.studentId &&
      !(await this.joinClassroomService.checkTeacher(
        grade.gradeStructure.classroom,
        user,
      ))
    ) {
      throw new ForbiddenException('You do not have permission to do this');
    }

    const comment = await this.commentRepo.save({
      ...dto,
      sender: user,
      grade: grade,
    });

    // if a student comments -> send notification to all teachers
    if (grade.studentId == user.studentId) {
      const teachers = await this.joinClassroomService.getMembersByRole(
        grade.gradeStructure.classroom,
        Role.TEACHER,
      );

      await this.notiService.addNotification(
        user,
        teachers,
        grade,
        NotificationType.REPLY_COMMENT,
      );
    } else {
      // if a teacher comments -> send notification to only student own grade
      const students = [];
      try {
        students.push(
          await this.userService.getUserByStudentId(grade.studentId),
        );

        await this.notiService.addNotification(
          user,
          students,
          grade,
          NotificationType.REPLY_COMMENT,
        );
      } catch (error) {}
    }

    return comment;
  }

  async deleteAllCommentOfGrade(grade: Grade): Promise<void> {
    await this.commentRepo.delete({ grade });
  }
}
