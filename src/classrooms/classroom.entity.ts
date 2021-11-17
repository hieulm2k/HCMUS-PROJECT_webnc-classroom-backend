import { Exclude } from 'class-transformer';
import { User } from 'src/user/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { JoinClassroom } from '../join-classroom/join-classroom.entity';

@Entity()
export class Classroom extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  section: string;

  @Column()
  subject: string;

  @Column()
  room: string;

  @OneToMany(
    (_type) => JoinClassroom,
    (joinClassroom: JoinClassroom) => joinClassroom.classroom,
    {
      eager: true,
    },
  )
  joinClassrooms: JoinClassroom[];
}
