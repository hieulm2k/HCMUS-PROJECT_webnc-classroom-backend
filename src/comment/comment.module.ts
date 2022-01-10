import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeModule } from 'src/grade/grade.module';
import { JoinClassroomModule } from 'src/join-classroom/join-classroom.module';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    GradeModule,
    JoinClassroomModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
