import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeModule } from 'src/grade/grade.module';
import { JoinClassroomModule } from 'src/join-classroom/join-classroom.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    GradeModule,
    JoinClassroomModule,
    NotificationModule,
    UserModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
