import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeModule } from 'src/grade/grade.module';
import { JoinClassroomModule } from 'src/join-classroom/join-classroom.module';
import { MailModule } from 'src/mail/mail.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository]),
    GradeModule,
    JoinClassroomModule,
    MailModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
