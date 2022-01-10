import { Exclude } from 'class-transformer';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';
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

  @OneToMany((_type) => JoinClassroom, (joinClassroom) => joinClassroom.user, {
    eager: true,
  })
  @Exclude({ toPlainOnly: true })
  joinClassrooms: JoinClassroom[];
}
