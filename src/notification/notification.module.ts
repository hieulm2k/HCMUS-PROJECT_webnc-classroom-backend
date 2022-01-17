import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
import { NotificationController } from './notification.controller';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    TypeOrmModule.forFeature([Classroom]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
