import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { AddNotificationDto } from './dto/add-noti.entity';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notiRepo: Repository<Notification>,
  ) {}

  async getAllNotifications(user: User): Promise<Notification[]> {
    return this.notiRepo.find({
      where: { receiver: user },
      relations: ['sender, grade'],
    });
  }

  async addNotification(sender: User, dto: AddNotificationDto): Promise<void> {
    await this.notiRepo.save({ ...dto, sender });
  }
}
