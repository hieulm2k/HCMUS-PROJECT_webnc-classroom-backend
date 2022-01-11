import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { AddNotificationDto } from './dto/add-noti.entity';
import { Notification, NotificationStatus } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
  ) {}

  async getAllNotifications(user: User): Promise<Notification[]> {
    return this.notiRepo.find({
      where: { receiver: user },
      relations: ['sender', 'grade'],
    });
  }

  async addNotification(sender: User, dto: AddNotificationDto): Promise<void> {
    await this.notiRepo.save({ ...dto, sender });
  }

  async updateToRead(user: User): Promise<void> {
    const notifications = await this.getAllNotifications(user);

    for (const notification of notifications) {
      notification.status = NotificationStatus.TO_READ;
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
}