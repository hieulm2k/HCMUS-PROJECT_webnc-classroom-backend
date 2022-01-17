import { Exclude } from 'class-transformer';
import { Role } from 'src/auth/enum/role.enum';
import { Comment } from 'src/comment/comment.entity';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';
import { Notification } from 'src/notification/notification.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';

export enum UserStatus {
  ACTIVE = 'Active',
  BANNED = 'Banned',
  UNCONFIRMED = 'Unconfirmed',
}

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password?: string;

  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  studentId: string;

  @Column({ enum: Role, type: 'enum', default: Role.USER })
  role: Role;

  @Column({ default: false })
  public isRegisteredWithGoogle: boolean;

  @Column({ type: 'varchar', nullable: true, default: null, unique: true })
  @Exclude({ toPlainOnly: true })
  token: string | null;

  @Column({ nullable: true, default: null })
  @Exclude({ toPlainOnly: true })
  tokenExpiration: Date | null;

  @Column({ enum: UserStatus, type: 'enum', default: UserStatus.ACTIVE })
  status: UserStatus;

  @OneToMany(() => JoinClassroom, (joinClassroom) => joinClassroom.user, {
    eager: true,
  })
  @Exclude({ toPlainOnly: true })
  joinClassrooms: JoinClassroom[];

  @OneToMany(() => Comment, (comment) => comment.sender, {
    eager: true,
  })
  @Exclude({ toPlainOnly: true })
  comments: Comment[];

  @OneToMany(() => Notification, (notification) => notification.sender, {
    eager: true,
  })
  @Exclude({ toPlainOnly: true })
  notificationsSent: Notification[];

  @OneToMany(() => Notification, (notification) => notification.receiver, {
    eager: true,
  })
  @Exclude({ toPlainOnly: true })
  notificationsReceived: Notification[];
}
