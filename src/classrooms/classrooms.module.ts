import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeStructureModule } from 'src/grade-structure/grade-structure.module';
import { GradeModule } from 'src/grade/grade.module';
import { JoinClassroomModule } from 'src/join-classroom/join-classroom.module';
import { MailModule } from 'src/mail/mail.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';
import { ClassroomsRepository } from './classroom.repository';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassroomsRepository]),
    JoinClassroomModule,
    UserModule,
    MailModule,
    GradeStructureModule,
    GradeModule,
    NotificationModule,
  ],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
})
export class ClassroomsModule {}
