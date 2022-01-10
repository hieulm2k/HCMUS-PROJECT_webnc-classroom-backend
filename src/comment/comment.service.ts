import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GradeService } from 'src/grade/grade.service';
import { JoinClassroomService } from 'src/join-classroom/join-classroom.service';
import { User } from 'src/user/user.entity';
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
  ) {}

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

    return this.commentRepo.save({ ...dto, sender: user, grade: grade });
  }
}
