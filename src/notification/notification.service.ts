import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/classrooms/classroom.entity';
import { Grade } from 'src/grade/grade.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
    @InjectRepository(Classroom)
    private classroomRepo: Repository<Classroom>,
  ) {}

  async getAllNotifications(user: User): Promise<Notification[]> {
    const notifications = await this.notiRepo.find({
      where: { receiver: user },
      relations: ['sender', 'grade', 'grade.gradeStructure'],
      order: {
        createdAt: 'DESC',
      },
    });

    for (const notification of notifications) {
      notification['classroomName'] = (
        await this.classroomRepo.findOne({
          id: notification.grade.classroomId,
        })
      ).name;
    }

    return notifications;
  }

  async addNotification(
    sender: User,
    receivers: User[],
    grade: Grade,
    type: NotificationType,
  ): Promise<void> {
    for (const receiver of receivers) {
      await this.notiRepo.save({ sender, grade, receiver, type });
    }
  }

  async updateToRead(user: User): Promise<void> {
    const notifications = await this.getAllNotifications(user);

    for (const notification of notifications) {
      if (notification.status === NotificationStatus.NEW) {
        notification.status = NotificationStatus.TO_READ;
      }
    }

    await this.notiRepo.save(notifications);
  }

  async updateDone(id: string, user: User): Promise<void> {
    const notification = await this.notiRepo.findOne({
      where: { id: id },
      relations: ['receiver'],
    });

    if (!notification || notification.receiver.id !== user.id) {
      throw new NotFoundException('Notification does not exists');
    }

    notification.status = NotificationStatus.DONE;

    await this.notiRepo.save(notification);
  }

  async deleteAllNotiOfGrade(grade: Grade): Promise<void> {
    await this.notiRepo.delete({ grade });
  }
}
