import { Grade } from 'src/grade/grade.entity';
import { User } from 'src/user/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum NotificationType {
  FINALIZE_GRADE = 'Finalize Grade',
  REPLY_COMMENT = 'Reply Comment',
  REQUEST_REVIEW = 'Request Review',
}

export enum NotificationStatus {
  NEW = 'New',
  TO_READ = 'To Read',
  DONE = 'Done',
}

@Entity()
export class Notification extends BaseEntity {
  @ManyToOne(() => User, (user) => user.notificationsSent, {
    eager: false,
  })
  @JoinColumn()
  sender: User;

  @ManyToOne(() => User, (user) => user.notificationsReceived, {
    eager: false,
  })
  @JoinColumn()
  receiver: User;

  @ManyToOne(() => Grade, (grade) => grade.notifications, {
    eager: false,
  })
  @JoinColumn()
  grade: Grade;

  @Column({
    enum: NotificationStatus,
    type: 'enum',
    default: NotificationStatus.NEW,
  })
  status: NotificationStatus;

  @Column({
    enum: NotificationType,
    type: 'enum',
  })
  type: NotificationType;
}
