import { classToPlain, Exclude } from 'class-transformer';
import { JoinClassroom } from 'src/join-classroom/join-classroom.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  studentId: string;

  @OneToMany((_type) => JoinClassroom, (joinClassroom) => joinClassroom.user, {
    eager: true,
  })
  @Exclude({ toPlainOnly: true })
  joinClassrooms: JoinClassroom[];
}
